/* MindWallet View: Income & Expense Tracking */
import { store, escapeHtml, CATEGORY_ICONS } from '../store.js';

export function renderTransactions() {
    const txs = store.getTransactions();
    const currency = store.getSettings().currency;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Income & Expense Tracker</h1>
                <p class="page-subtitle">Complete transaction log with category recognition, search, and 8-second reversible actions.</p>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button type="button" class="btn btn-primary" onclick="window.app.openModal('add-transaction')">
                    <span>+ Log New Transaction</span>
                </button>
            </div>
        </div>

        <div class="card">
            <!-- Filter Bar -->
            <div style="display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; align-items:center;">
                <div style="display:flex; gap:12px; flex:1; min-width:260px;">
                    <label for="tx-search-input" class="sr-only">Search transactions by merchant or category</label>
                    <input type="text" id="tx-search-input" class="form-control" placeholder="Search merchant or category..." oninput="window.app.filterTransactions()" />
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <label for="tx-category-filter" class="sr-only">Filter transactions by category</label>
                    <select id="tx-category-filter" class="form-control" onchange="window.app.filterTransactions()">
                        <option value="all">All Categories</option>
                        <option value="Income">Income</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Dining out">Dining out</option>
                        <option value="Housing">Housing</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Subscriptions">Subscriptions</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                    </select>

                    <label for="tx-type-filter" class="sr-only">Filter transactions by type</label>
                    <select id="tx-type-filter" class="form-control" onchange="window.app.filterTransactions()">
                        <option value="all">All Types</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expenses Only</option>
                    </select>
                </div>
            </div>

            <!-- Transactions Table -->
            <div class="table-responsive" style="margin-top:12px;">
                <table class="data-table" id="tx-table">
                    <caption class="sr-only">List of recorded income and expense transactions</caption>
                    <thead>
                        <tr>
                            <th scope="col">Merchant / Source</th>
                            <th scope="col">Category</th>
                            <th scope="col" class="secondary-detail">Date</th>
                            <th scope="col" style="text-align:right;">Amount</th>
                            <th scope="col" style="text-align:center;">Action</th>
                        </tr>
                    </thead>
                    <tbody id="tx-table-body">
                        ${renderTxRows(txs, currency)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export function renderTxRows(txs, currency) {
    if (!txs.length) {
        return `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-muted);">No matching transactions found.</td></tr>`;
    }

    return txs.map(t => {
        const merchantEscaped = escapeHtml(t.merchant);
        const categoryEscaped = escapeHtml(t.category);
        const idEscaped = escapeHtml(t.id);
        const isIncome = t.type === 'income';
        const icon = t.icon || CATEGORY_ICONS[t.category] || (isIncome ? '💼' : '💳');

        return `
            <tr>
                <td data-label="Merchant">
                    <div class="txn-merchant">
                        <span class="txn-icon" style="background:${t.iconBg || '#EAF1FC'}; color:${t.iconColor || 'var(--navy)'};" aria-hidden="true">${icon}</span>
                        <span style="font-weight:600;">${merchantEscaped}</span>
                    </div>
                </td>
                <td data-label="Category">
                    <span class="cat-pill" style="background:var(--bg); color:var(--text); border:1px solid var(--border);">
                        ${categoryEscaped}
                    </span>
                </td>
                <td data-label="Date" class="secondary-detail">${escapeHtml(t.date)}</td>
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
