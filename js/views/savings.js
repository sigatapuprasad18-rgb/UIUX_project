/* MindWallet View: Savings Goals */
import { store } from '../store.js';

export function renderSavings() {
    const goals = store.getGoals();
    const currency = store.getSettings().currency;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Savings Goals</h1>
                <p class="page-subtitle">Piggy bank mental model and long-term financial security planning.</p>
            </div>
            <button class="btn btn-primary" onclick="window.app.openModal('add-goal')">
                <span>+ Create New Savings Goal</span>
            </button>
        </div>

        <div class="grid-2">
            ${goals.map(g => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                const remaining = g.target - g.current;
                const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(remaining / g.monthlyContribution) : 'N/A';

                return `
                    <div class="card">
                        <div class="card-header">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <span style="font-size:2rem; background:var(--purple-light); padding:10px; border-radius:12px;">${g.icon}</span>
                                <div>
                                    <h3 class="card-title">${g.name}</h3>
                                    <span class="cat-pill" style="background:var(--purple-light); color:var(--purple); margin-top:2px;">${g.category}</span>
                                </div>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="window.app.depositGoal('${g.id}', '${g.name}')">+ Deposit</button>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:12px;">
                            <span style="font-family:var(--font-display); font-size:1.6rem; font-weight:700;">${currency}${g.current.toLocaleString()}</span>
                            <span style="color:var(--text-muted); font-size:0.9rem;">Target: ${currency}${g.target.toLocaleString()}</span>
                        </div>

                        <div class="progress-wrap">
                            <div class="progress-bar-bg" style="height:12px;">
                                <div class="progress-fill" style="width:${pct}%; background:var(--purple);"></div>
                            </div>
                        </div>

                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-muted);">
                            <span>${pct}% Achieved</span>
                            <span>Est. ${monthsLeft} months remaining (${currency}${g.monthlyContribution}/mo)</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
