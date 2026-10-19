/* MindWallet View: Savings Goals */
import { store, escapeHtml, CATEGORY_ICONS } from '../store.js';

export function renderSavings() {
    const goals = store.getGoals();
    const currency = store.getSettings().currency;
    const savedThisMonth = store.getSavedThisMonth();

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Savings Goals</h1>
                <p class="page-subtitle">Piggy bank mental model and dedicated funds for long-term financial security.</p>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                <span class="status-pill healthy" style="font-size:var(--text-sm); padding:6px 12px;">
                    <span aria-hidden="true">🐷</span> Saved this month: <strong>${currency}${savedThisMonth.toLocaleString()}</strong>
                </span>
                <button type="button" class="btn btn-primary" onclick="window.app.openModal('add-goal')">
                    <span>+ New Savings Goal</span>
                </button>
            </div>
        </div>

        <div class="grid-2">
            ${goals.map(g => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                const remaining = Math.max(0, g.target - g.current);
                const monthly = Number(g.monthlyContribution) || 1000;
                const monthsLeft = monthly > 0 ? Math.ceil(remaining / monthly) : 'N/A';
                const nameEscaped = escapeHtml(g.name);
                const idEscaped = escapeHtml(g.id);
                const catEscaped = escapeHtml(g.category);
                const icon = g.icon || CATEGORY_ICONS[g.category] || '🎯';

                return `
                    <div class="card">
                        <div class="card-header">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <span style="font-size:2rem; background:var(--purple-light); padding:10px; border-radius:12px;" aria-hidden="true">${icon}</span>
                                <div>
                                    <h2 class="card-title" style="font-size:1.1rem;">${nameEscaped}</h2>
                                    <span class="status-pill info" style="margin-top:2px;">${catEscaped}</span>
                                </div>
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm" data-action="deposit-goal" data-id="${idEscaped}" data-name="${nameEscaped}" aria-label="Deposit funds into goal: ${nameEscaped}">
                                + Deposit
                            </button>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:8px;">
                            <span style="font-family:var(--font-display); font-size:1.6rem; font-weight:700;">
                                ${currency}${g.current.toLocaleString()}
                            </span>
                            <span style="color:var(--text-muted); font-size:var(--text-sm);">
                                Target: ${currency}${g.target.toLocaleString()}
                            </span>
                        </div>

                        <div class="progress-wrap">
                            <div class="progress-bar-bg" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${nameEscaped} goal achieved: ${pct}%" style="height:12px;">
                                <div class="progress-fill" style="width:${pct}%; background:var(--purple);"></div>
                            </div>
                        </div>

                        <div style="display:flex; justify-content:space-between; font-size:var(--text-xs); color:var(--text-muted);">
                            <span style="font-weight:600; color:var(--purple);">${pct}% Achieved</span>
                            <span>Est. <strong>${monthsLeft} months</strong> left (${currency}${monthly.toLocaleString()}/mo)</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
