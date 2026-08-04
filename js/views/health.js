/* MindWallet View: Financial Health Score */
import { store } from '../store.js';

export function renderHealth() {
    const health = store.getFinancialHealthScore();

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Financial Health Score</h1>
                <p class="page-subtitle">Multi-factor diagnostic evaluation based on cognitive behavioral metrics.</p>
            </div>
        </div>

        <div class="grid-main-side">
            <div class="card">
                <h2 class="card-title">Detailed Factor Evaluation</h2>
                <div style="display:flex; flex-direction:column; gap:20px; margin-top:12px;">
                    <!-- Factor 1: Savings Rate -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span style="font-weight:600;">1. Monthly Savings Rate (Weight: 25%)</span>
                            <span style="font-weight:700;">${health.breakdown.savingsScore} / 25 pts</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-fill" style="width:${(health.breakdown.savingsScore/25)*100}%;"></div>
                        </div>
                        <p style="font-size:0.83rem; color:var(--text-muted); margin-top:4px;">
                            Evaluates income retained after essential expenses. Ideal target is $>20\%$.
                        </p>
                    </div>

                    <!-- Factor 2: Budget Discipline -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span style="font-weight:600;">2. Budget Adherence (Weight: 25%)</span>
                            <span style="font-weight:700;">${health.breakdown.budgetScore} / 25 pts</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-fill ${health.breakdown.budgetScore < 15 ? 'warning' : ''}" style="width:${(health.breakdown.budgetScore/25)*100}%;"></div>
                        </div>
                        <p style="font-size:0.83rem; color:var(--text-muted); margin-top:4px;">
                            Evaluates category budget overflow incidents during the past 30 days.
                        </p>
                    </div>

                    <!-- Factor 3: Emergency Buffer -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span style="font-weight:600;">3. Emergency Safety Cushion (Weight: 20%)</span>
                            <span style="font-weight:700;">${health.breakdown.emergencyScore} / 20 pts</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-fill" style="width:${(health.breakdown.emergencyScore/20)*100}%; background:var(--purple);"></div>
                        </div>
                        <p style="font-size:0.83rem; color:var(--text-muted); margin-top:4px;">
                            Measures liquid reserves relative to 3 to 6 months of essential living expenses.
                        </p>
                    </div>

                    <!-- Factor 4: Subscription Burden -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span style="font-weight:600;">4. Subscription Ratio (Weight: 15%)</span>
                            <span style="font-weight:700;">${health.breakdown.subScore} / 15 pts</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-fill" style="width:${(health.breakdown.subScore/15)*100}%; background:var(--orange);"></div>
                        </div>
                        <p style="font-size:0.83rem; color:var(--text-muted); margin-top:4px;">
                            Keeps recurring automatic subscription charges below 5% of monthly income.
                        </p>
                    </div>

                    <!-- Factor 5: Impulse Control -->
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span style="font-weight:600;">5. Impulse Control & Simulator Usage (Weight: 15%)</span>
                            <span style="font-weight:700;">${health.breakdown.impulseScore} / 15 pts</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-fill" style="width:${(health.breakdown.impulseScore/15)*100}%;"></div>
                        </div>
                        <p style="font-size:0.83rem; color:var(--text-muted); margin-top:4px;">
                            Evaluates pre-purchase simulation checks before committing to non-essential buying.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Health Score Gauge -->
            <div class="card">
                <div class="health-gauge-box">
                    <div class="gauge-circle" style="width:180px; height:180px; background: conic-gradient(${health.color} 0% ${health.score}%, var(--border) ${health.score}% 100%);">
                        <div class="gauge-inner" style="width:145px; height:145px;">
                            <span class="gauge-score" style="font-size:2.8rem;">${health.score}</span>
                            <span class="gauge-max">Overall Score</span>
                        </div>
                    </div>
                    <div style="margin-top:20px; font-weight:700; font-size:1.25rem; color:${health.color};">
                        ${health.status}
                    </div>
                    <div style="margin-top:16px; text-align:left; background:var(--bg); padding:16px; border-radius:12px; font-size:0.85rem;">
                        <h4 style="font-size:0.9rem; margin-bottom:6px;">💡 Recommended Action</h4>
                        <p style="color:var(--text-muted); margin:0;">
                            Increase monthly Emergency Cushion contribution by ₹1,500 to push overall score above 85.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
