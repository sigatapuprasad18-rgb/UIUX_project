/* MindWallet View: Smart Insights */
import { store } from '../store.js';

export function renderInsights() {
    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Smart Insights & Nudges</h1>
                <p class="page-subtitle">Cognitive behavioral insights designed to reduce financial stress and impulse spending.</p>
            </div>
        </div>

        <div class="grid-2">
            <div class="card" style="border-left: 4px solid var(--emerald);">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="font-size:2rem;">🎉</span>
                    <div>
                        <h3 style="font-size:1.05rem; font-weight:700;">Groceries Pacing Exceeding Goal</h3>
                        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">
                            You spent 18% less on groceries during the first week of August compared to July. At this rate, you will save ₹2,400 this month!
                        </p>
                    </div>
                </div>
            </div>

            <div class="card" style="border-left: 4px solid var(--orange);">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="font-size:2rem;">⚠️</span>
                    <div>
                        <h3 style="font-size:1.05rem; font-weight:700;">Subscription Inflation Warning</h3>
                        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">
                            You currently pay for 5 recurring subscriptions totaling ₹3,700/mo. Canceling 1 unused streaming service could accelerate your laptop goal by 2 months.
                        </p>
                    </div>
                </div>
            </div>

            <div class="card" style="border-left: 4px solid var(--purple);">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="font-size:2rem;">🛡️</span>
                    <div>
                        <h3 style="font-size:1.05rem; font-weight:700;">Emergency Reserve Milestone</h3>
                        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">
                            Your Emergency Cushion Fund is currently 65% complete. You are 7 months away from 100% financial security stability.
                        </p>
                    </div>
                </div>
            </div>

            <div class="card" style="border-left: 4px solid var(--navy);">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="font-size:2rem;">💡</span>
                    <div>
                        <h3 style="font-size:1.05rem; font-weight:700;">Rule of 30-Day Impulse Delay</h3>
                        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">
                            Before buying non-essential items over ₹5,000, use our <strong>Purchase Simulator</strong> to calculate the delay on your primary savings goal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
