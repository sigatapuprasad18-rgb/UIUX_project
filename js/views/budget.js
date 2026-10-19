/* MindWallet View: Budget Planner */
import { store, escapeHtml, CATEGORY_ICONS } from '../store.js';

export function renderBudget() {
    const budgets = store.getBudgets();
    const txs = store.getMonthTransactions();
    const currency = store.getSettings().currency;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Budget Planner</h1>
                <p class="page-subtitle">Visual category spending limits with immediate status feedback and safe thresholds.</p>
            </div>
            <button type="button" class="btn btn-primary" onclick="window.app.openModal('set-budget')">
                <span aria-hidden="true">⚙️</span> Set Category Limit
            </button>
        </div>

        <div class="grid-2">
            ${budgets.map(b => {
                const spent = txs
                    .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === b.category.toLowerCase())
                    .reduce((acc, t) => acc + Number(t.amount), 0);
                const pct = Math.min(100, Math.round((spent / b.limit) * 100));
                const isCritical = pct >= 90;
                const isWarning = pct >= 75 && !isCritical;
                const remaining = b.limit - spent;
                const catEscaped = escapeHtml(b.category);
                const icon = b.icon || CATEGORY_ICONS[b.category] || '📌';

                const statusClass = isCritical ? 'critical' : isWarning ? 'warning' : 'healthy';
                const statusText = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'HEALTHY';
                const statusIcon = isCritical ? '🚨' : isWarning ? '⚠️' : '✅';

                return `
                    <div class="card">
                        <div class="card-header">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <span style="font-size:1.6rem;" aria-hidden="true">${icon}</span>
                                <div>
                                    <h2 class="card-title" style="font-size:1.1rem;">${catEscaped}</h2>
                                    <p class="card-subtitle">${remaining < 0 ? `Over budget by ${currency}${Math.abs(remaining).toLocaleString()}` : `${currency}${remaining.toLocaleString()} safe spending left`}</p>
                                </div>
                            </div>
                            <span class="status-pill ${statusClass}">
                                <span aria-hidden="true">${statusIcon}</span> ${statusText}
                            </span>
                        </div>

                        <div class="progress-wrap" style="margin-top:8px;">
                            <div style="display:flex; justify-content:space-between; font-size:var(--text-sm); font-weight:600;">
                                <span>Spent: ${currency}${spent.toLocaleString()}</span>
                                <span>Limit: ${currency}${b.limit.toLocaleString()} (${pct}%)</span>
                            </div>
                            <div class="progress-bar-bg" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${catEscaped} budget capacity used: ${pct}%" style="height:12px;">
                                <div class="progress-fill ${isCritical ? 'danger' : isWarning ? 'warning' : ''}" style="width: ${pct}%;"></div>
                            </div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:var(--text-xs); color:var(--text-muted); margin-top:4px;">
                            <span>${pct}% of threshold reached</span>
                            <button type="button" class="btn btn-outline btn-sm" data-action="quick-set-budget" data-category="${catEscaped}" data-limit="${b.limit}" aria-label="Adjust limit for ${catEscaped} budget">
                                ✏️ Adjust Limit
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
