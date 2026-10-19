/* MindWallet View: Subscription Manager */
import { store, escapeHtml, CATEGORY_ICONS } from '../store.js';

export function renderSubscriptions() {
    const subs = store.getSubscriptions();
    const currency = store.getSettings().currency;
    const monthlyBurn = store.getMonthlySubscriptionCost();
    const annualBurn = monthlyBurn * 12;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Subscription Manager</h1>
                <p class="page-subtitle">Track recurring payments, prevent forgotten renewals, and reverse cancellations anytime.</p>
            </div>
            <button type="button" class="btn btn-primary" onclick="window.app.openModal('add-subscription')">
                <span>+ Track New Subscription</span>
            </button>
        </div>

        <div class="grid-2">
            <div class="metric-card budget">
                <div class="metric-header">
                    <span>Monthly Subscription Burn</span>
                    <span style="font-size:1.2rem;" aria-hidden="true">🔁</span>
                </div>
                <div class="metric-val">${currency}${Math.round(monthlyBurn).toLocaleString()} / mo</div>
                <div class="metric-footer">
                    <span>Equal to <strong>${currency}${Math.round(annualBurn).toLocaleString()}</strong> each year</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span>Active Services</span>
                    <span style="font-size:1.2rem;" aria-hidden="true">📦</span>
                </div>
                <div class="metric-val">${subs.length} Services</div>
                <div class="metric-footer">
                    <span class="status-pill healthy"><span aria-hidden="true">✅</span> Auto-Renewal Monitoring</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top:20px;">
            <div class="table-responsive">
                <table class="data-table">
                    <caption class="sr-only">List of recurring subscriptions and upcoming billing dates</caption>
                    <thead>
                        <tr>
                            <th scope="col">Subscription</th>
                            <th scope="col">Category</th>
                            <th scope="col">Billing Cycle</th>
                            <th scope="col">Next Renewal</th>
                            <th scope="col" style="text-align:right;">Amount</th>
                            <th scope="col" style="text-align:center;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subs.map(s => {
                            const nameEscaped = escapeHtml(s.name);
                            const idEscaped = escapeHtml(s.id);
                            const catEscaped = escapeHtml(s.category);
                            const icon = s.icon || CATEGORY_ICONS[s.category] || '📦';

                            return `
                                <tr>
                                    <td data-label="Subscription">
                                        <div class="txn-merchant">
                                            <span class="txn-icon" style="background:var(--orange-light); color:var(--warning-text);" aria-hidden="true">${icon}</span>
                                            <span style="font-weight:600;">${nameEscaped}</span>
                                        </div>
                                    </td>
                                    <td data-label="Category"><span class="cat-pill" style="background:var(--bg); color:var(--text); border:1px solid var(--border);">${catEscaped}</span></td>
                                    <td data-label="Billing Cycle">${escapeHtml(s.cycle)}</td>
                                    <td data-label="Next Renewal">${escapeHtml(s.nextBilling)}</td>
                                    <td data-label="Amount" style="text-align:right;" class="amt-neg">
                                        <span class="sr-only">Recurring expense: </span>-${currency}${s.amount.toLocaleString()}
                                    </td>
                                    <td data-label="Action" style="text-align:center;">
                                        <button type="button" class="btn btn-outline btn-sm" data-action="delete-subscription" data-id="${idEscaped}" data-name="${nameEscaped}" data-amount="${s.amount}" aria-label="Cancel subscription for ${nameEscaped}">
                                            Cancel / Pause
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
