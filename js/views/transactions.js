/* MindWallet View: Income & Expense Tracking with Advanced Filters & Sorting */
import { store, escapeHtml, CATEGORY_ICONS } from '../store.js';

export function filterAndSortTransactions(txs, filterState = {}) {
    if (!txs || !Array.isArray(txs)) return [];
    let filtered = [...txs];

    // 1. Text Search Filter (merchant, category, notes)
    if (filterState.search) {
        const q = filterState.search.toLowerCase();
        filtered = filtered.filter(t => 
            (t.merchant || '').toLowerCase().includes(q) ||
            (t.category || '').toLowerCase().includes(q) ||
            (t.notes || '').toLowerCase().includes(q)
        );
    }

    // 2. Category Filter
    if (filterState.category && filterState.category !== 'all') {
        const cat = filterState.category.toLowerCase();
        filtered = filtered.filter(t => (t.category || '').toLowerCase() === cat);
    }

    // 3. Type Filter (income / expense)
    if (filterState.type && filterState.type !== 'all') {
        filtered = filtered.filter(t => t.type === filterState.type);
    }

    // 4. Date Range Filter
    if (filterState.dateRange && filterState.dateRange !== 'all') {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        if (filterState.dateRange === 'this_month') {
            filtered = filtered.filter(t => {
                if (!t.date) return false;
                const d = new Date(t.date);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
            });
        } else if (filterState.dateRange === 'last_30_days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filtered = filtered.filter(t => {
                if (!t.date) return false;
                const d = new Date(t.date);
                return d >= thirtyDaysAgo && d <= now;
            });
        } else if (filterState.dateRange === 'last_month') {
            const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            filtered = filtered.filter(t => {
                if (!t.date) return false;
                const d = new Date(t.date);
                return d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth;
            });
        }
    }

    // 5. Necessity Filter (essential / discretionary)
    if (filterState.necessity && filterState.necessity !== 'all') {
        filtered = filtered.filter(t => {
            const nec = t.necessity || 'essential';
            return nec === filterState.necessity;
        });
    }

    // 6. Sorting
    const { sortBy = 'date', sortOrder = 'desc' } = filterState;
    filtered.sort((a, b) => {
        let res = 0;
        if (sortBy === 'amount') {
            res = (Number(a.amount) || 0) - (Number(b.amount) || 0);
        } else if (sortBy === 'merchant') {
            res = (a.merchant || '').localeCompare(b.merchant || '');
        } else {
            // Default: date
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            res = dateA - dateB;
        }
        return sortOrder === 'desc' ? -res : res;
    });

    return filtered;
}

export function renderTransactions() {
    const txs = store.getTransactions();
    const currency = store.getSettings().currency;
    const filterState = window.app?.txFilterState || {
        search: '',
        category: 'all',
        type: 'all',
        dateRange: 'all',
        necessity: 'all',
        sortBy: 'date',
        sortOrder: 'desc'
    };

    // Extract dynamic unique categories from both transactions and budgets
    const dynamicCategories = Array.from(new Set([
        ...txs.map(t => t.category),
        ...store.getBudgets().map(b => b.category)
    ])).filter(Boolean).sort();

    const displayedTxs = filterAndSortTransactions(txs, filterState);
    const countText = displayedTxs.length === txs.length
        ? `Showing all ${txs.length} transactions`
        : `Showing ${displayedTxs.length} of ${txs.length} transactions`;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Income & Expense Tracker</h1>
                <p class="page-subtitle">Complete transaction log with category recognition, search, multi-factor filtering, and 8-second reversible actions.</p>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button type="button" class="btn btn-primary" onclick="window.app.openModal('add-transaction')">
                    <span>+ Log New Transaction</span>
                </button>
            </div>
        </div>

        <div class="card">
            <!-- Filter & Sort Toolbar -->
            <div class="tx-toolbar">
                <!-- Top Row: Search Input & Sort Controls -->
                <div class="tx-top-row">
                    <!-- Search Input -->
                    <div class="tx-search-wrap">
                        <label for="tx-search-input" class="sr-only">Search transactions by merchant, category, or notes</label>
                        <input type="text" id="tx-search-input" class="form-control tx-search-input" 
                            placeholder="🔍 Search merchant, category, notes..." 
                            value="${escapeHtml(filterState.search || '')}"
                            oninput="window.app.filterTransactions()" />
                    </div>

                    <!-- Sorting Controls -->
                    <div class="tx-sort-controls">
                        <label for="tx-sort-by" class="tx-sort-label">Sort:</label>
                        <select id="tx-sort-by" class="form-control tx-sort-select" onchange="window.app.onTxSortChange(this.value)">
                            <option value="date" ${filterState.sortBy === 'date' ? 'selected' : ''}>Date</option>
                            <option value="amount" ${filterState.sortBy === 'amount' ? 'selected' : ''}>Amount</option>
                            <option value="merchant" ${filterState.sortBy === 'merchant' ? 'selected' : ''}>Merchant</option>
                        </select>

                        <!-- Asc / Desc Order Toggle Button -->
                        <button type="button" class="btn-sort-toggle" id="tx-sort-order-btn" 
                            onclick="window.app.toggleTxSortOrder()" 
                            aria-label="Toggle sort order: currently ${filterState.sortOrder === 'asc' ? 'Ascending' : 'Descending'}"
                            title="Click to toggle Ascending / Descending order">
                            <span id="tx-sort-order-icon" aria-hidden="true">${filterState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                            <span id="tx-sort-order-label">${filterState.sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
                        </button>
                    </div>
                </div>

                <!-- Filters Row: 4 Filter Dropdowns Side by Side with Equal Spacing & Total Consistency -->
                <div class="tx-filters-grid">
                    <!-- 1. Category Filter -->
                    <div class="tx-filter-col">
                        <label for="tx-category-filter" class="sr-only">Filter transactions by category</label>
                        <select id="tx-category-filter" class="form-control tx-select" onchange="window.app.filterTransactions()">
                            <option value="all" ${filterState.category === 'all' ? 'selected' : ''}>All Categories</option>
                            ${dynamicCategories.map(cat => `
                                <option value="${escapeHtml(cat)}" ${filterState.category === cat ? 'selected' : ''}>
                                    ${CATEGORY_ICONS[cat] || '🏷️'} ${escapeHtml(cat)}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <!-- 2. Type Filter -->
                    <div class="tx-filter-col">
                        <label for="tx-type-filter" class="sr-only">Filter transactions by type</label>
                        <select id="tx-type-filter" class="form-control tx-select" onchange="window.app.filterTransactions()">
                            <option value="all" ${filterState.type === 'all' ? 'selected' : ''}>All Types</option>
                            <option value="income" ${filterState.type === 'income' ? 'selected' : ''}>💰 Income Only</option>
                            <option value="expense" ${filterState.type === 'expense' ? 'selected' : ''}>💳 Expenses Only</option>
                        </select>
                    </div>

                    <!-- 3. Timeframe / Date Range Filter -->
                    <div class="tx-filter-col">
                        <label for="tx-date-filter" class="sr-only">Filter transactions by date range</label>
                        <select id="tx-date-filter" class="form-control tx-select" onchange="window.app.filterTransactions()">
                            <option value="all" ${filterState.dateRange === 'all' ? 'selected' : ''}>📅 All Time</option>
                            <option value="this_month" ${filterState.dateRange === 'this_month' ? 'selected' : ''}>This Month</option>
                            <option value="last_30_days" ${filterState.dateRange === 'last_30_days' ? 'selected' : ''}>Past 30 Days</option>
                            <option value="last_month" ${filterState.dateRange === 'last_month' ? 'selected' : ''}>Last Month</option>
                        </select>
                    </div>

                    <!-- 4. Necessity Filter -->
                    <div class="tx-filter-col">
                        <label for="tx-necessity-filter" class="sr-only">Filter by spending necessity</label>
                        <select id="tx-necessity-filter" class="form-control tx-select" onchange="window.app.filterTransactions()">
                            <option value="all" ${filterState.necessity === 'all' ? 'selected' : ''}>⚡ All Spending</option>
                            <option value="essential" ${filterState.necessity === 'essential' ? 'selected' : ''}>🛡️ Needs (Essential)</option>
                            <option value="discretionary" ${filterState.necessity === 'discretionary' ? 'selected' : ''}>🎟️ Wants (Discretionary)</option>
                        </select>
                    </div>
                </div>

                <!-- Filter Summary Bar & Reset Button -->
                <div class="tx-filter-summary-bar">
                    <span id="tx-count-indicator">${countText}</span>
                    <button type="button" class="btn btn-ghost btn-sm" id="tx-reset-filters-btn" 
                        onclick="window.app.resetTransactionFilters()" style="padding:2px 8px; font-size:0.78rem;">
                        <span aria-hidden="true">↺</span> Reset Filters
                    </button>
                </div>
            </div>

            <!-- Transactions Table -->
            <div class="table-responsive" style="margin-top:8px;">
                <table class="data-table" id="tx-table">
                    <caption class="sr-only">List of recorded income and expense transactions</caption>
                    <thead>
                        <tr>
                            <th scope="col" class="sortable-th" id="th-sort-merchant" 
                                aria-sort="${filterState.sortBy === 'merchant' ? (filterState.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}">
                                <button type="button" class="sortable-th-btn" onclick="window.app.toggleTxSort('merchant')" aria-label="Sort by Merchant">
                                    <span>Merchant / Source</span>
                                    <span class="sort-icon" aria-hidden="true">${filterState.sortBy === 'merchant' ? (filterState.sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                                </button>
                            </th>
                            <th scope="col">Category</th>
                            <th scope="col" class="secondary-detail sortable-th" id="th-sort-date" 
                                aria-sort="${filterState.sortBy === 'date' ? (filterState.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}">
                                <button type="button" class="sortable-th-btn" onclick="window.app.toggleTxSort('date')" aria-label="Sort by Date">
                                    <span>Date</span>
                                    <span class="sort-icon" aria-hidden="true">${filterState.sortBy === 'date' ? (filterState.sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                                </button>
                            </th>
                            <th scope="col" style="text-align:right;" class="sortable-th" id="th-sort-amount" 
                                aria-sort="${filterState.sortBy === 'amount' ? (filterState.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}">
                                <button type="button" class="sortable-th-btn" style="justify-content:flex-end;" onclick="window.app.toggleTxSort('amount')" aria-label="Sort by Amount">
                                    <span>Amount</span>
                                    <span class="sort-icon" aria-hidden="true">${filterState.sortBy === 'amount' ? (filterState.sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                                </button>
                            </th>
                            <th scope="col" style="text-align:center;">Action</th>
                        </tr>
                    </thead>
                    <tbody id="tx-table-body">
                        ${renderTxRows(displayedTxs, currency)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export function renderTxRows(txs, currency) {
    if (!txs || !txs.length) {
        return `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-muted);">No matching transactions found. Try adjusting your filters.</td></tr>`;
    }

    return txs.map(t => {
        const merchantEscaped = escapeHtml(t.merchant || 'Unknown');
        const categoryEscaped = escapeHtml(t.category || 'General');
        const idEscaped = escapeHtml(t.id);
        const isIncome = t.type === 'income';
        const icon = t.icon || CATEGORY_ICONS[t.category] || (isIncome ? '💼' : '💳');
        const isEssential = (t.necessity || 'essential') === 'essential';

        return `
            <tr>
                <td data-label="Merchant">
                    <div class="txn-merchant">
                        <span class="txn-icon" style="background:${t.iconBg || '#EAF1FC'}; color:${t.iconColor || 'var(--navy)'};" aria-hidden="true">${icon}</span>
                        <div>
                            <div style="font-weight:600;">${merchantEscaped}</div>
                            ${t.notes ? `<div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(t.notes)}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td data-label="Category">
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span class="cat-pill" style="background:var(--bg); color:var(--text); border:1px solid var(--border);">
                            ${categoryEscaped}
                        </span>
                        ${!isIncome ? `<span class="badge" style="font-size:0.68rem; padding:2px 6px; background:${isEssential ? '#E4F5EE' : '#FEF3E2'}; color:${isEssential ? 'var(--emerald)' : 'var(--warning-text)'};">${isEssential ? 'Need' : 'Want'}</span>` : ''}
                    </div>
                </td>
                <td data-label="Date" class="secondary-detail">${escapeHtml(t.date || '')}</td>
                <td data-label="Amount" style="text-align:right;" class="${isIncome ? 'amt-pos' : 'amt-neg'}">
                    <span class="sr-only">${isIncome ? 'Income: ' : 'Expense: '}</span>${isIncome ? '+' : '-'}${currency}${Number(t.amount).toLocaleString()}
                </td>
                <td data-label="Action" style="text-align:center;">
                    <button type="button" class="btn btn-outline btn-sm" data-action="delete-transaction" data-id="${idEscaped}" aria-label="Delete transaction: ${merchantEscaped}" title="Delete Transaction">
                        <span aria-hidden="true">🗑️</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}
