/* MindWallet View: Budget Planner */
import { store } from '../store.js';

export function renderBudget() {
    const budgets = store.getBudgets();
    const txs = store.getTransactions();
    const currency = store.getSettings().currency;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Budget Planner</h1>
                <p class="page-subtitle">Visual category limits with immediate feedback and safe spending thresholds.</p>
            </div>
            <button class="btn btn-primary" onclick="window.app.openModal('set-budget')">
                <span>⚙️ Adjust Category Limits</span>
            </button>
        </div>

        <div class="grid-2">
            ${budgets.map(b => {
                const spent = txs
                    .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
                    .reduce((acc, t) => acc + Number(t.amount), 0);
                const pct = Math.min(100, Math.round((spent / b.limit) * 100));
                const isDanger = pct >= 90;
                const isWarn = pct >= 75 && !isDanger;
                const remaining = b.limit - spent;

                return `
                    <div class="card">
                        <div class="card-header">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <span style="font-size:1.5rem;">${b.icon}</span>
                                <div>
                                    <h3 class="card-title">${b.category} Budget</h3>
                                    <p class="card-subtitle">${spent > b.limit ? 'Over budget limit!' : `${currency}${remaining.toLocaleString()} remaining`}</p>
                                </div>
                            </div>
                            <span class="cat-pill" style="background:${isDanger ? 'var(--red-light)' : isWarn ? 'var(--orange-light)' : 'var(--emerald-light)'}; color:${isDanger ? 'var(--red)' : isWarn ? 'var(--orange)' : 'var(--emerald)'};">
                                ${isDanger ? 'CRITICAL' : isWarn ? 'WARNING' : 'HEALTHY'}
                            </span>
                        </div>

                        <div class="progress-wrap" style="margin-top:8px;">
                            <div style="display:flex; justify-content:space-between; font-size:0.9rem; font-weight:600;">
                                <span>Spent: ${currency}${spent.toLocaleString()}</span>
                                <span>Limit: ${currency}${b.limit.toLocaleString()}</span>
                            </div>
                            <div class="progress-bar-bg" style="height:12px;">
                                <div class="progress-fill ${isDanger ? 'danger' : isWarn ? 'warning' : ''}" style="width: ${pct}%;"></div>
                            </div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; color:var(--text-muted); margin-top:4px;">
                            <span>${pct}% of limit used</span>
                            <button class="btn btn-outline btn-sm" onclick="window.app.quickSetBudget('${b.category}', ${b.limit})">Edit Limit</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
