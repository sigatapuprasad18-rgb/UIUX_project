/* MindWallet View: Spending Analytics */
import { store } from '../store.js';

export function renderAnalytics() {
    const txs = store.getTransactions().filter(t => t.type === 'expense');
    const currency = store.getSettings().currency;

    // Group expenses by category
    const categoryTotals = {};
    let totalSpent = 0;
    txs.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        totalSpent += Number(t.amount);
    });

    const categoriesSorted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Spending Analytics</h1>
                <p class="page-subtitle">Visual pattern analysis to aid long-term financial decision making.</p>
            </div>
        </div>

        <div class="grid-2">
            <!-- Category Distribution Card -->
            <div class="card">
                <h2 class="card-title">Expense Category Breakdown</h2>
                <p class="card-subtitle">Total Monthly Spend: ${currency}${totalSpent.toLocaleString()}</p>
                <div style="display:flex; flex-direction:column; gap:16px; margin-top:12px;">
                    ${categoriesSorted.map(([cat, amt]) => {
                        const pct = Math.round((amt / (totalSpent || 1)) * 100);
                        return `
                            <div class="progress-wrap">
                                <div style="display:flex; justify-content:space-between; font-size:0.9rem; font-weight:600;">
                                    <span>${cat}</span>
                                    <span>${currency}${amt.toLocaleString()} (${pct}%)</span>
                                </div>
                                <div class="progress-bar-bg" style="height:10px;">
                                    <div class="progress-fill" style="width:${pct}%;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Visual Bar Chart representation -->
            <div class="card">
                <h2 class="card-title">Comparative Monthly Flow</h2>
                <p class="card-subtitle">Income vs Expense Visual Distribution</p>
                <div style="height:220px; display:flex; align-items:flex-end; justify-content:space-around; padding:20px 10px; background:var(--bg); border-radius:12px; margin-top:12px;">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <div style="width:48px; height:160px; background:var(--emerald); border-radius:8px 8px 0 0;"></div>
                        <span style="font-size:0.85rem; font-weight:600;">Income</span>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <div style="width:48px; height:75px; background:var(--navy); border-radius:8px 8px 0 0;"></div>
                        <span style="font-size:0.85rem; font-weight:600;">Expenses</span>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <div style="width:48px; height:85px; background:var(--purple); border-radius:8px 8px 0 0;"></div>
                        <span style="font-size:0.85rem; font-weight:600;">Savings</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
