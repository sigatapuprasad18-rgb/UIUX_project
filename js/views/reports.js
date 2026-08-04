/* MindWallet View: Monthly Reports */
import { store } from '../store.js';

export function renderReports() {
    const summary = store.getSummary();
    const currency = store.getSettings().currency;
    const txs = store.getTransactions();

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Monthly Financial Statement</h1>
                <p class="page-subtitle">Clean, bank-statement inspired summary for August 2026.</p>
            </div>
            <button class="btn btn-outline" onclick="window.print()">
                <span>🖨️ Print / Download PDF</span>
            </button>
        </div>

        <div class="card" style="padding:36px;">
            <div style="display:flex; justify-content:space-between; border-bottom:2px solid var(--navy); padding-bottom:16px;">
                <div>
                    <h2 style="font-size:1.5rem; font-weight:700; color:var(--navy);">MindWallet Statement</h2>
                    <p style="font-size:0.88rem; color:var(--text-muted);">Period: August 1, 2026 – August 31, 2026</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; font-size:1.1rem;">Account #MW-88392</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">Primary Wallet</div>
                </div>
            </div>

            <div class="grid-3" style="margin-top:24px;">
                <div style="background:var(--bg); padding:16px; border-radius:10px;">
                    <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Total Income</div>
                    <div style="font-size:1.5rem; font-weight:700; color:var(--emerald);">${currency}${summary.totalIncome.toLocaleString()}</div>
                </div>
                <div style="background:var(--bg); padding:16px; border-radius:10px;">
                    <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Total Expense</div>
                    <div style="font-size:1.5rem; font-weight:700; color:var(--red);">${currency}${summary.totalExpense.toLocaleString()}</div>
                </div>
                <div style="background:var(--bg); padding:16px; border-radius:10px;">
                    <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Net Retained</div>
                    <div style="font-size:1.5rem; font-weight:700; color:var(--navy);">${currency}${summary.netBalance.toLocaleString()}</div>
                </div>
            </div>

            <div class="table-responsive" style="margin-top:32px;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th style="text-align:right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${txs.map(t => `
                            <tr>
                                <td>${t.date}</td>
                                <td style="font-weight:600;">${t.merchant}</td>
                                <td>${t.category}</td>
                                <td style="text-align:right;" class="${t.type === 'income' ? 'amt-pos' : 'amt-neg'}">
                                    ${t.type === 'income' ? '+' : '-'}${currency}${t.amount.toLocaleString()}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
