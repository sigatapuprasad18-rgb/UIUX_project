/* MindWallet View: Subscription Manager */
import { store } from '../store.js';

export function renderSubscriptions() {
    const subs = store.getSubscriptions();
    const currency = store.getSettings().currency;
    const monthlyBurn = subs.reduce((a, s) => a + (s.cycle === 'Annual' ? s.amount / 12 : s.amount), 0);
    const annualBurn = monthlyBurn * 12;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Subscription Manager</h1>
                <p class="page-subtitle">Identify recurring leaks and control automatic payments.</p>
            </div>
            <button class="btn btn-primary" onclick="window.app.openModal('add-subscription')">
                <span>+ Track New Subscription</span>
            </button>
        </div>

        <div class="grid-2">
            <div class="metric-card budget">
                <div class="metric-header">
                    <span>Monthly Subscription Burn</span>
                    <span style="font-size:1.2rem;">🔁</span>
                </div>
                <div class="metric-val">${currency}${Math.round(monthlyBurn).toLocaleString()} / mo</div>
                <div class="metric-footer">
                    <span>Equivalent to ${currency}${Math.round(annualBurn).toLocaleString()} every year</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span>Active Services</span>
                    <span style="font-size:1.2rem;">📦</span>
                </div>
                <div class="metric-val">${subs.length} Subscriptions</div>
                <div class="metric-footer">
                    <span class="tag-pos">Tracked for auto-renewals</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top:24px;">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Subscription</th>
                            <th>Category</th>
                            <th>Billing Cycle</th>
                            <th>Next Renewal</th>
                            <th style="text-align:right;">Amount</th>
                            <th style="text-align:center;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subs.map(s => `
                            <tr>
                                <td>
                                    <div class="txn-merchant">
                                        <span class="txn-icon" style="background:var(--orange-light); color:var(--orange);">${s.icon}</span>
                                        ${s.name}
                                    </div>
                                </td>
                                <td><span class="cat-pill" style="background:var(--bg); color:var(--text);">${s.category}</span></td>
                                <td>${s.cycle}</td>
                                <td>${s.nextBilling}</td>
                                <td style="text-align:right;" class="amt-neg">${currency}${s.amount.toLocaleString()}</td>
                                <td style="text-align:center;">
                                    <button class="btn btn-outline btn-sm" onclick="window.app.deleteSubscription('${s.id}', '${s.name}', ${s.amount})" title="Cancel Subscription">
                                        Cancel / Pause
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
