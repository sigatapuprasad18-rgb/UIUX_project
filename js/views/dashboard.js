/* MindWallet View: Dashboard */
import { store } from '../store.js';

export function renderDashboard() {
    const summary = store.getSummary();
    const health = store.getFinancialHealthScore();
    const txs = store.getTransactions().slice(0, 5);
    const budgets = store.getBudgets().slice(0, 3);
    const currency = store.getSettings().currency;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Overview Dashboard</h1>
                <p class="page-subtitle">Understand your financial health and manage money effortlessly.</p>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="window.app.openModal('add-transaction')">
                    <span>+ Add Transaction</span>
                </button>
                <button class="btn btn-secondary" onclick="window.location.hash='#simulator'">
                    <span>⚡ Purchase Simulator</span>
                </button>
            </div>
        </div>

        <!-- Summary Metric Grid -->
        <div class="grid-4">
            <div class="metric-card">
                <div class="metric-header">
                    <span>Net Balance</span>
                    <div class="metric-icon" style="background:var(--emerald-light); color:var(--emerald);">💳</div>
                </div>
                <div class="metric-val">${currency}${summary.netBalance.toLocaleString()}</div>
                <div class="metric-footer">
                    <span class="tag-pos">↑ Active</span>
                    <span>After all current expenses</span>
                </div>
            </div>

            <div class="metric-card expense">
                <div class="metric-header">
                    <span>Monthly Expenses</span>
                    <div class="metric-icon" style="background:var(--red-light); color:var(--red);">📤</div>
                </div>
                <div class="metric-val">${currency}${summary.totalExpense.toLocaleString()}</div>
                <div class="metric-footer">
                    <span class="secondary-detail">Tracked across ${store.getTransactions().filter(t => t.type === 'expense').length} items</span>
                </div>
            </div>

            <div class="metric-card savings">
                <div class="metric-header">
                    <span>Total Savings</span>
                    <div class="metric-icon" style="background:var(--purple-light); color:var(--purple);">🐷</div>
                </div>
                <div class="metric-val">${currency}${summary.totalSaved.toLocaleString()}</div>
                <div class="metric-footer">
                    <span class="tag-pos">Across ${store.getGoals().length} Goals</span>
                </div>
            </div>

            <div class="metric-card budget">
                <div class="metric-header">
                    <span>Sub Burn Rate</span>
                    <div class="metric-icon" style="background:var(--orange-light); color:var(--orange);">🔁</div>
                </div>
                <div class="metric-val">${currency}${store.getSubscriptions().reduce((a,s)=>a+s.amount,0).toLocaleString()}</div>
                <div class="metric-footer">
                    <span class="secondary-detail">${store.getSubscriptions().length} Active Subscriptions</span>
                </div>
            </div>
        </div>

        <!-- Main Content & Health Gauge Grid -->
        <div class="grid-main-side">
            <div style="display:flex; flex-direction:column; gap:24px;">
                <!-- Recent Transactions Card -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h2 class="card-title">Recent Transactions</h2>
                            <p class="card-subtitle">Recognition-focused activity log</p>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="window.location.hash='#transactions'">View All</button>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Merchant / Source</th>
                                    <th>Category</th>
                                    <th class="secondary-detail">Date</th>
                                    <th style="text-align:right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${txs.map(t => `
                                    <tr>
                                        <td>
                                            <div class="txn-merchant">
                                                <span class="txn-icon" style="background:${t.iconBg}; color:${t.iconColor};">${t.icon}</span>
                                                ${t.merchant}
                                            </div>
                                        </td>
                                        <td>
                                            <span class="cat-pill" style="background:${t.iconBg}; color:${t.iconColor};">${t.category}</span>
                                        </td>
                                        <td class="secondary-detail">${t.date}</td>
                                        <td style="text-align:right;" class="${t.type === 'income' ? 'amt-pos' : 'amt-neg'}">
                                            ${t.type === 'income' ? '+' : '-'}${currency}${t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Budget Highlights -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h2 class="card-title">Budget Health Overview</h2>
                            <p class="card-subtitle">Immediate feedback on your highest categories</p>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="window.location.hash='#budget'">Manage Budgets</button>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        ${budgets.map(b => {
                            const spent = store.getTransactions()
                                .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
                                .reduce((acc, t) => acc + Number(t.amount), 0);
                            const pct = Math.min(100, Math.round((spent / b.limit) * 100));
                            const isDanger = pct > 90;
                            const isWarn = pct > 75 && !isDanger;
                            return `
                                <div class="progress-wrap">
                                    <div style="display:flex; justify-content:space-between; font-size:0.88rem;">
                                        <span style="font-weight:600;">${b.icon} ${b.category}</span>
                                        <span>${currency}${spent.toLocaleString()} / ${currency}${b.limit.toLocaleString()} (${pct}%)</span>
                                    </div>
                                    <div class="progress-bar-bg">
                                        <div class="progress-fill ${isDanger ? 'danger' : isWarn ? 'warning' : ''}" style="width: ${pct}%;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Side Column: Health Score & Quick Insight -->
            <div style="display:flex; flex-direction:column; gap:24px;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Financial Health Meter</h2>
                    </div>
                    <div class="health-gauge-box">
                        <div class="gauge-circle" style="background: conic-gradient(${health.color} 0% ${health.score}%, var(--border) ${health.score}% 100%);">
                            <div class="gauge-inner">
                                <span class="gauge-score">${health.score}</span>
                                <span class="gauge-max">/ 100 Score</span>
                            </div>
                        </div>
                        <div style="margin-top:16px; font-weight:700; font-size:1.1rem; color:${health.color};">
                            ${health.status}
                        </div>
                        <p class="secondary-detail" style="font-size:0.82rem; color:var(--text-muted); margin-top:6px;">
                            Calculated dynamically based on savings rate, budget discipline, and emergency safety cushion.
                        </p>
                        <button class="btn btn-secondary btn-sm" style="margin-top:12px; width:100%;" onclick="window.location.hash='#health'">
                            View Full Score Breakdown →
                        </button>
                    </div>
                </div>

                <div class="card" style="background: var(--navy-light); border-color: rgba(16, 35, 63, 0.1);">
                    <div style="display:flex; gap:12px; align-items:flex-start;">
                        <span style="font-size:1.4rem;">💡</span>
                        <div>
                            <h3 style="font-size:0.95rem; font-weight:700;">Smart Behavioral Nudge</h3>
                            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">
                                Your Groceries budget is at 39% capacity. You are pacing 12% better than last month!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
