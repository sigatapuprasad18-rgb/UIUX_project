/* MindWallet View: Income & Expense Tracking */
import { store } from '../store.js';

export function renderTransactions() {
    const txs = store.getTransactions();
    const currency = store.getSettings().currency;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Income & Expense Tracker</h1>
                <p class="page-subtitle">Full transaction log with category recognition and instant search.</p>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="window.app.openModal('add-transaction')">
                    <span>+ Log New Transaction</span>
                </button>
            </div>
        </div>

        <div class="card">
            <!-- Filter Bar -->
            <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:center;">
                <div style="display:flex; gap:12px; flex:1; min-width:260px;">
                    <input type="text" id="tx-search-input" class="form-control" placeholder="Search merchant or category..." oninput="window.app.filterTransactions()" />
                </div>
                <div style="display:flex; gap:12px;">
                    <select id="tx-category-filter" class="form-control" onchange="window.app.filterTransactions()">
                        <option value="all">All Categories</option>
                        <option value="Income">Income</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Housing">Housing</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Subscriptions">Subscriptions</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Transport">Transport</option>
                    </select>
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
                    <thead>
                        <tr>
                            <th>Merchant / Source</th>
                            <th>Category</th>
                            <th class="secondary-detail">Date</th>
                            <th style="text-align:right;">Amount</th>
                            <th style="text-align:center;">Action</th>
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

    return txs.map(t => `
        <tr>
            <td>
                <div class="txn-merchant">
                    <span class="txn-icon" style="background:${t.iconBg || '#EAF1FC'}; color:${t.iconColor || 'var(--navy)'};">${t.icon || '💳'}</span>
                    ${t.merchant}
                </div>
            </td>
            <td>
                <span class="cat-pill" style="background:${t.iconBg || '#EAF1FC'}; color:${t.iconColor || 'var(--navy)'};">${t.category}</span>
            </td>
            <td class="secondary-detail">${t.date}</td>
            <td style="text-align:right;" class="${t.type === 'income' ? 'amt-pos' : 'amt-neg'}">
                ${t.type === 'income' ? '+' : '-'}${currency}${Number(t.amount).toLocaleString()}
            </td>
            <td style="text-align:center;">
                <button class="btn btn-outline btn-sm" onclick="window.app.deleteTransaction('${t.id}')" title="Delete Transaction">🗑️</button>
            </td>
        </tr>
    `).join('');
}
