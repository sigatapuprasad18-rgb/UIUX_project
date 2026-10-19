/* MindWallet View: Financial Health Score Factor Breakdown */
import { store, escapeHtml } from '../store.js';

export function renderHealth() {
    const health = store.getFinancialHealthScore();
    const currency = store.getSettings().currency;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Financial Health Diagnostic</h1>
                <p class="page-subtitle">Multi-factor diagnostic evaluation based on cognitive behavioral metrics.</p>
            </div>
            <a href="#simulator" class="btn btn-secondary btn-sm">
                <span aria-hidden="true">⚡</span> Test Purchase in Simulator
            </a>
        </div>

        <div class="grid-main-side">
            <!-- Left Column: 5 Factor Breakdown -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">Diagnostic Factor Breakdown</h2>
                        <p class="card-subtitle">Real-time dynamic weights computed from current monthly flow</p>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:20px; margin-top:8px;">
                    <!-- Factor 1: Savings Rate -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:var(--text-sm);">
                            <span style="font-weight:700;">1. Monthly Savings Rate (Weight: 25%)</span>
                            <span class="status-pill healthy">${health.breakdown.savingsScore} / 25 pts</span>
                        </div>
                        <div class="progress-bar-bg" role="progressbar" aria-valuenow="${health.breakdown.savingsScore}" aria-valuemin="0" aria-valuemax="25" aria-label="Monthly savings rate score: ${health.breakdown.savingsScore} out of 25">
                            <div class="progress-fill" style="width:${(health.breakdown.savingsScore / 25) * 100}%;"></div>
                        </div>
                        <p style="font-size:var(--text-xs); color:var(--text-muted); margin-top:4px;">
                            Scores percentage of monthly income retained after living expenses. ≥20% retained achieves the full 25 pts.
                        </p>
                    </div>

                    <!-- Factor 2: Budget Discipline -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:var(--text-sm);">
                            <span style="font-weight:700;">2. Budget Adherence (Weight: 25%)</span>
                            <span class="status-pill ${health.breakdown.budgetScore >= 18 ? 'healthy' : 'warning'}">${health.breakdown.budgetScore} / 25 pts</span>
                        </div>
                        <div class="progress-bar-bg" role="progressbar" aria-valuenow="${health.breakdown.budgetScore}" aria-valuemin="0" aria-valuemax="25" aria-label="Budget adherence score: ${health.breakdown.budgetScore} out of 25">
                            <div class="progress-fill ${health.breakdown.budgetScore < 15 ? 'danger' : health.breakdown.budgetScore < 20 ? 'warning' : ''}" style="width:${(health.breakdown.budgetScore / 25) * 100}%;"></div>
                        </div>
                        <p style="font-size:var(--text-xs); color:var(--text-muted); margin-top:4px;">
                            Evaluates active budget limits against current month expenses. Deducts 7 pts for each category exceeding its monthly limit.
                        </p>
                    </div>

                    <!-- Factor 3: Emergency Cushion -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:var(--text-sm);">
                            <span style="font-weight:700;">3. Emergency Safety Cushion (Weight: 20%)</span>
                            <span class="status-pill healthy">${health.breakdown.emergencyScore} / 20 pts</span>
                        </div>
                        <div class="progress-bar-bg" role="progressbar" aria-valuenow="${health.breakdown.emergencyScore}" aria-valuemin="0" aria-valuemax="20" aria-label="Emergency cushion score: ${health.breakdown.emergencyScore} out of 20">
                            <div class="progress-fill" style="width:${(health.breakdown.emergencyScore / 20) * 100}%; background:var(--purple);"></div>
                        </div>
                        <p style="font-size:var(--text-xs); color:var(--text-muted); margin-top:4px;">
                            Progress towards your dedicated liquid emergency reserve goal (scaled to 20 pts).
                        </p>
                    </div>

                    <!-- Factor 4: Subscription Burden -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:var(--text-sm);">
                            <span style="font-weight:700;">4. Subscription Ratio (Weight: 15%)</span>
                            <span class="status-pill ${health.breakdown.subScore >= 12 ? 'healthy' : 'warning'}">${health.breakdown.subScore} / 15 pts</span>
                        </div>
                        <div class="progress-bar-bg" role="progressbar" aria-valuenow="${health.breakdown.subScore}" aria-valuemin="0" aria-valuemax="15" aria-label="Subscription ratio score: ${health.breakdown.subScore} out of 15">
                            <div class="progress-fill ${health.breakdown.subScore < 10 ? 'warning' : ''}" style="width:${(health.breakdown.subScore / 15) * 100}%;"></div>
                        </div>
                        <p style="font-size:var(--text-xs); color:var(--text-muted); margin-top:4px;">
                            Compares recurring subscription cost against monthly income: ≤5% earns 15 pts, 5–10% earns 10 pts, and &gt;10% drops to 5 pts.
                        </p>
                    </div>

                    <!-- Factor 5: Impulse Control -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:var(--text-sm);">
                            <span style="font-weight:700;">5. Impulse Control & Deliberation (Weight: 15%)</span>
                            <span class="status-pill ${health.breakdown.impulseScore >= 12 ? 'healthy' : 'warning'}">${health.breakdown.impulseScore} / 15 pts</span>
                        </div>
                        <div class="progress-bar-bg" role="progressbar" aria-valuenow="${health.breakdown.impulseScore}" aria-valuemin="0" aria-valuemax="15" aria-label="Impulse control score: ${health.breakdown.impulseScore} out of 15">
                            <div class="progress-fill" style="width:${(health.breakdown.impulseScore / 15) * 100}%;"></div>
                        </div>
                        <p style="font-size:var(--text-xs); color:var(--text-muted); margin-top:4px;">
                            Computed from current month discretionary spending (Dining out, Shopping, Entertainment) vs budget (up to 10 pts), plus up to 5 deliberation bonus points for testing "Want" purchases in the Simulator.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Right Column: Meter & Behavioral HCI Advice -->
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div class="card">
                    <div class="health-gauge-box">
                        <div class="gauge-circle" role="meter" aria-valuenow="${health.score}" aria-valuemin="0" aria-valuemax="100" 
                             aria-label="Overall financial health score: ${health.score} out of 100, status ${health.status}" 
                             style="width:180px; height:180px; background: conic-gradient(${health.color} 0% ${health.score}%, var(--border) ${health.score}% 100%);">
                            <div class="gauge-inner" style="width:145px; height:145px;">
                                <span class="gauge-score" style="font-size:2.8rem;">${health.score}</span>
                                <span class="gauge-max">Overall Score</span>
                            </div>
                        </div>
                        <p class="sr-only">Diagnostic financial health score is ${health.score} out of 100 with status ${health.status}.</p>
                        <div style="margin-top:16px;">
                            <span class="status-pill ${health.score >= 80 ? 'healthy' : health.score >= 60 ? 'warning' : 'critical'}" style="font-size:var(--text-sm); padding:6px 14px;">
                                <span aria-hidden="true">${health.score >= 80 ? '🛡️' : health.score >= 60 ? '⚠️' : '🚨'}</span>
                                Status: ${health.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="card" style="background:var(--navy-light); border-left:4px solid var(--accent);">
                    <h3 style="font-size:var(--text-base); font-weight:700; margin-bottom:4px;">💡 Recommended Action</h3>
                    <p style="font-size:var(--text-sm); color:var(--text); line-height:1.45; margin:0;">
                        ${escapeHtml(health.recommendedAction)}
                    </p>
                </div>
            </div>
        </div>
    `;
}
