/* MindWallet View: Decluttered High-Hierarchy Overview Dashboard */
import { store, escapeHtml, resolvePersonaKey, getPersona } from '../store.js';

export function renderDashboard() {
    const settings = store.getSettings();
    const personaKey = resolvePersonaKey(settings.persona || 'student');
    const mSummary = store.getMonthSummary();
    const health = store.getFinancialHealthScore();
    const currency = settings.currency || '₹';
    const subBurn = store.getMonthlySubscriptionCost();
    const goals = store.getGoals();
    const totalSaved = goals.reduce((acc, g) => acc + (Number(g.current) || 0), 0);
    const isNegative = mSummary.moneyLeftThisMonth < 0;

    const nextAction = computeNextBestAction({ currency });

    return `
        <!-- Single Page Title with Strict H1 Hierarchy -->
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Dashboard</h1>
                <p class="page-subtitle">${getPersonaSubtitle(personaKey)}</p>
            </div>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <button type="button" class="btn btn-outline btn-sm" onclick="window.app.openProfileSwitcherModal()" aria-label="Switch active user profile">
                    <span aria-hidden="true">👤</span> Profile: <strong>${formatPersonaName(personaKey)}</strong>
                </button>
                <!-- The Single Primary CTA on Dashboard -->
                <button type="button" class="btn btn-primary" onclick="window.app.openModal('add-transaction')" id="hero-quick-add-btn">
                    <span>+ Add Transaction</span>
                </button>
            </div>
        </div>

        <!-- 1. The Unified Hero Row (Balance + Health Gauge + Next Best Action) -->
        <section class="dashboard-hero-row" aria-label="Monthly Snapshot & Priority Action">
            <!-- Block 1: Monthly Balance & Cashflow -->
            <div class="card hero-metric-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div class="card-subtitle" style="display:flex; align-items:center; gap:6px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; font-size:var(--text-xs); color:var(--text-muted);">
                        <span aria-hidden="true">💳</span> Money Left This Month
                    </div>
                    <div style="font-size:2.3rem; font-weight:800; font-family:var(--font-display); color:${isNegative ? 'var(--status-critical-text)' : 'var(--navy)'}; margin:6px 0 2px;">
                        ${currency}${Math.abs(mSummary.moneyLeftThisMonth).toLocaleString()}
                        ${isNegative ? '<span style="font-size:1rem; font-weight:600; color:var(--status-critical-text);"> (Overspent)</span>' : ''}
                    </div>
                    <div style="font-size:var(--text-xs); color:var(--text-muted);">
                        Flow: <strong style="color:var(--status-healthy-text);">+${currency}${mSummary.monthlyIncome.toLocaleString()} In</strong> / 
                        <strong style="color:var(--status-critical-text);">-${currency}${mSummary.monthlyExpense.toLocaleString()} Out</strong>
                    </div>
                </div>

                <!-- Compact Secondary Metrics Links -->
                <div class="hero-secondary-links" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; padding-top:12px; border-top:1px solid var(--border);">
                    <a href="#subscriptions" class="btn btn-ghost btn-sm" style="font-size:var(--text-xs); padding:4px 8px; color:var(--text-muted);" aria-label="View subscriptions, monthly cost ${currency}${Math.round(subBurn).toLocaleString()}">
                        <span aria-hidden="true">🔁</span> Subscriptions: <strong>${currency}${Math.round(subBurn).toLocaleString()}/mo</strong> →
                    </a>
                    <a href="#savings" class="btn btn-ghost btn-sm" style="font-size:var(--text-xs); padding:4px 8px; color:var(--text-muted);" aria-label="View savings goals, total saved ${currency}${totalSaved.toLocaleString()}">
                        <span aria-hidden="true">🎯</span> Total Savings: <strong>${currency}${totalSaved.toLocaleString()}</strong> →
                    </a>
                </div>
            </div>

            <!-- Block 2: Health Score Gauge with Progressive Disclosure -->
            <div class="card hero-gauge-card" style="display:flex; flex-direction:column; align-items:center; text-align:center; justify-content:space-between;">
                <div style="width:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:6px;">
                        <span class="card-subtitle" style="font-weight:600; text-transform:uppercase; font-size:var(--text-xs); color:var(--text-muted);">
                            Financial Health
                        </span>
                        <span class="status-pill ${health.score >= 80 ? 'healthy' : health.score >= 60 ? 'warning' : 'critical'}" style="font-size:0.75rem;">
                            ${health.status}
                        </span>
                    </div>

                    <!-- Mini Gauge Visual -->
                    <div class="gauge-circle" role="meter" aria-valuenow="${health.score}" aria-valuemin="0" aria-valuemax="100" 
                         aria-label="Financial health score: ${health.score} out of 100, ${health.status}"
                         style="width:110px; height:110px; margin:8px auto; background: conic-gradient(${health.color} 0% ${health.score}%, var(--border) ${health.score}% 100%);">
                        <div class="gauge-inner" style="width:86px; height:86px;">
                            <span class="gauge-score" style="font-size:1.8rem;">${health.score}</span>
                            <span class="gauge-max" style="font-size:0.65rem;">/ 100</span>
                        </div>
                    </div>
                    <p class="sr-only">Financial health score: ${health.score} out of 100, status: ${health.status}.</p>
                </div>

                <!-- Progressive Disclosure: Show Breakdown Expander -->
                <div style="width:100%; margin-top:8px;">
                    <button type="button" class="btn btn-ghost btn-sm" id="btnToggleHealthDetails" aria-expanded="false" 
                            aria-controls="dashboard-health-details" onclick="window.app.toggleDashboardDetails('dashboard-health-details', this)"
                            style="width:100%; font-size:var(--text-xs); justify-content:center; color:var(--text-muted);">
                        <span>Show score factors</span> <span class="expander-arrow" aria-hidden="true">▾</span>
                    </button>

                    <div id="dashboard-health-details" style="display:none; margin-top:10px; text-align:left; font-size:var(--text-xs); border-top:1px solid var(--border); padding-top:8px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Savings Rate:</span> <strong>${health.breakdown.savingsScore}/25 pts</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Budget Discipline:</span> <strong>${health.breakdown.budgetScore}/25 pts</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Emergency Cushion:</span> <strong>${health.breakdown.emergencyScore}/20 pts</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Subscription Ratio:</span> <strong>${health.breakdown.subScore}/15 pts</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>Impulse Control:</span> <strong>${health.breakdown.impulseScore}/15 pts</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Block 3: Single 'Next Best Action' Card -->
            <div class="card hero-action-card" style="display:flex; flex-direction:column; justify-content:space-between; border-left: 4px solid var(--accent); background: var(--surface);">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span class="status-pill ${nextAction.badgeClass}" style="font-size:0.75rem;">
                            <span aria-hidden="true">${nextAction.icon}</span> ${nextAction.badge}
                        </span>
                        <span style="font-size:var(--text-xs); color:var(--text-muted);">Next Best Action</span>
                    </div>
                    <h2 class="card-title" style="font-size:1.1rem; margin:6px 0 4px;">${nextAction.title}</h2>
                    <p style="font-size:var(--text-sm); color:var(--text-muted); line-height:1.45; margin:0;">
                        ${nextAction.description}
                    </p>
                </div>

                <div style="margin-top:14px;">
                    <a href="${nextAction.actionRoute}" class="btn btn-outline btn-sm" style="width:100%; justify-content:center; font-weight:600;">
                        ${nextAction.actionText}
                    </a>
                </div>
            </div>
        </section>

        <!-- 2. Lower Grid: 3 Most At-Risk Budgets + 5 Recent Transactions -->
        <div class="grid-2 dashboard-lower-grid" style="margin-top:var(--space-3);">
            <!-- At-Risk Budgets (Max 3) -->
            ${renderAtRiskBudgetsCard({ currency })}

            <!-- Recent Transactions (Max 5) -->
            ${renderRecentTransactionsCard({ currency })}
        </div>
    `;
}

function computeNextBestAction({ currency }) {
    const budgets = store.getBudgets();
    const monthTxs = store.getMonthTransactions();
    const subs = store.getSubscriptions();
    const goals = store.getGoals();
    const today = new Date();

    // 1. Most at-risk budget
    let mostAtRisk = null;
    let highestPct = 0;
    budgets.forEach(b => {
        const spent = monthTxs
            .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === b.category.toLowerCase())
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const pct = Math.round((spent / b.limit) * 100);
        if (pct >= 75 && pct > highestPct) {
            highestPct = pct;
            mostAtRisk = { ...b, spent, pct, remaining: b.limit - spent };
        }
    });

    if (mostAtRisk) {
        return {
            badge: mostAtRisk.pct >= 90 ? 'CRITICAL BUDGET' : 'AT RISK BUDGET',
            badgeClass: mostAtRisk.pct >= 90 ? 'critical' : 'warning',
            icon: '⚠️',
            title: `Pace your ${escapeHtml(mostAtRisk.category)} spend`,
            description: `You've utilized <strong>${mostAtRisk.pct}%</strong> of this category's limit (${currency}${mostAtRisk.spent.toLocaleString()} / ${currency}${mostAtRisk.limit.toLocaleString()}). Slow down non-essentials.`,
            actionText: 'Adjust Budget →',
            actionRoute: '#budget'
        };
    }

    // 2. Upcoming renewal within 7 days
    const upcomingSub = subs.find(s => {
        if (!s.nextBilling) return false;
        const diff = Math.ceil((new Date(s.nextBilling) - today) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
    });

    if (upcomingSub) {
        return {
            badge: 'UPCOMING RENEWAL',
            badgeClass: 'warning',
            icon: '🔁',
            title: `Review ${escapeHtml(upcomingSub.name)}`,
            description: `Scheduled recurring charge of <strong>${currency}${Number(upcomingSub.amount).toLocaleString()}</strong> renews on ${escapeHtml(upcomingSub.nextBilling)}.`,
            actionText: 'Review Subscriptions →',
            actionRoute: '#subscriptions'
        };
    }

    // 3. Nearest Goal
    const topGoal = goals[0];
    if (topGoal) {
        const pct = Math.min(100, Math.round((topGoal.current / topGoal.target) * 100));
        return {
            badge: 'PRIORITY GOAL',
            badgeClass: 'healthy',
            icon: '🎯',
            title: `Deposit to ${escapeHtml(topGoal.name)}`,
            description: `Currently <strong>${pct}%</strong> achieved. Depositing ${currency}${Number(topGoal.monthlyContribution || 1000).toLocaleString()} keeps your timeline on track.`,
            actionText: 'Deposit Funds →',
            actionRoute: '#savings'
        };
    }

    const settings = store.getSettings();
    const persona = resolvePersonaKey(settings.persona || 'student');

    if (persona === 'student') {
        return {
            badge: 'IMPULSE CONTROL',
            badgeClass: 'warning',
            icon: '⚡',
            title: 'Before you buy: Can I afford it?',
            description: 'Got an impulse want? Use your 24h deliberation cooling-off check before buying to safeguard your cashflow.',
            actionText: 'Check Purchase in Simulator →',
            actionRoute: '#simulator'
        };
    } else if (persona === 'working_professional') {
        return {
            badge: 'ZERO-BASED VARIANCE',
            badgeClass: 'healthy',
            icon: '📊',
            title: 'Category Variance & Adherence',
            description: 'Zero-based allocation monitoring. Inspect granular category thresholds, deviations, and export statements.',
            actionText: 'View Variance Report →',
            actionRoute: '#budget'
        };
    } else if (persona === 'elderly_retiree') {
        return {
            badge: 'PENSION & HEALTHCARE',
            badgeClass: 'healthy',
            icon: '👵',
            title: 'Pension & Healthcare Cushion',
            description: 'Fixed pension pacing active. Pharmacy funds & health safety reserve are preserved with senior accessibility.',
            actionText: 'Review Healthcare Budget →',
            actionRoute: '#budget'
        };
    } else if (persona === 'goal_saver') {
        const topGoal = goals[0];
        const pct = topGoal ? Math.min(100, Math.round((topGoal.current / topGoal.target) * 100)) : 65;
        return {
            badge: 'MILESTONE MOMENTUM',
            badgeClass: 'healthy',
            icon: '🎯',
            title: topGoal ? `Accelerate ${escapeHtml(topGoal.name)}` : 'Milestone Savings Progress',
            description: `Currently <strong>${pct}%</strong> funded. Postponing non-essential wants brings your target completion date closer.`,
            actionText: 'Explore Goal ETA Impact →',
            actionRoute: '#savings'
        };
    }

    return {
        badge: 'ALL ON TRACK',
        badgeClass: 'healthy',
        icon: '🛡️',
        title: 'Plan in Good Shape',
        description: 'All budgets are healthy and no renewals are due this week.',
        actionText: 'Test in Simulator →',
        actionRoute: '#simulator'
    };
}

function formatPersonaName(key) {
    const resolved = resolvePersonaKey(key);
    switch (resolved) {
        case 'student': return 'Alex Morgan (Student)';
        case 'working_professional': return 'Priya Sharma (Professional)';
        case 'elderly_retiree': return 'Eleanor Vance (Senior Citizen)';
        case 'goal_saver': return 'Rohan Mehta (Goal Saver)';
        default: return 'Active Profile';
    }
}

function getPersonaSubtitle(key) {
    const resolved = resolvePersonaKey(key);
    switch (resolved) {
        case 'student':
            return 'Stipend cashflow snapshot with 24h cooling-off and positive reinforcement.';
        case 'working_professional':
            return 'Zero-based category tracking, adherence variance, and investment metrics.';
        case 'elderly_retiree':
            return 'Predictable pension cashflow, healthcare allocation, and accessible senior clarity.';
        case 'goal_saver':
            return 'Milestone-first roadmap, delayed gratification momentum, and goal timeline impact.';
        default:
            return 'Overview of your personal finances and decision tools.';
    }
}

/**
 * 3 Most At-Risk Budgets
 */
function renderAtRiskBudgetsCard({ currency }) {
    const budgets = store.getBudgets();
    const txs = store.getMonthTransactions();

    const atRiskList = [];
    budgets.forEach(b => {
        const spent = txs
            .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === b.category.toLowerCase())
            .reduce((acc, t) => acc + Number(t.amount), 0);
        const pct = Math.round((spent / b.limit) * 100);

        if (pct >= 75) {
            atRiskList.push({
                ...b,
                spent,
                pct,
                isCritical: pct >= 90
            });
        }
    });

    atRiskList.sort((a, b) => b.pct - a.pct);

    let contentHtml = '';
    if (atRiskList.length > 0) {
        contentHtml = atRiskList.slice(0, 3).map(b => {
            const catEscaped = escapeHtml(b.category);
            const statusClass = b.isCritical ? 'critical' : 'warning';
            const statusText = b.isCritical ? 'CRITICAL' : 'WARNING';
            const statusIcon = b.isCritical ? '🚨' : '⚠️';

            return `
                <div class="progress-wrap" style="padding:10px 12px; background:var(--bg); border-radius:var(--radius-sm); border:1px solid var(--border);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-weight:600; font-size:var(--text-sm);">
                            <span aria-hidden="true">${b.icon || '📌'}</span> ${catEscaped}
                        </span>
                        <span class="status-pill ${statusClass}">
                            <span aria-hidden="true">${statusIcon}</span> ${statusText} (${b.pct}%)
                        </span>
                    </div>
                    <div class="progress-bar-bg" role="progressbar" aria-valuenow="${b.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${catEscaped} budget capacity: ${b.pct}%">
                        <div class="progress-fill ${b.isCritical ? 'danger' : 'warning'}" style="width: ${Math.min(100, b.pct)}%;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:var(--text-xs); color:var(--text-muted); margin-top:2px;">
                        <span>Spent: ${currency}${b.spent.toLocaleString()}</span>
                        <span>Limit: ${currency}${b.limit.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        contentHtml = `
            <div style="padding:16px; background:var(--status-healthy-bg); border-radius:var(--radius-sm); border:1px solid var(--status-healthy-border); display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.5rem;" aria-hidden="true">🎉</span>
                <div>
                    <div style="font-weight:700; color:var(--status-healthy-text); font-size:var(--text-sm);">All Budgets on Track!</div>
                    <div style="font-size:var(--text-xs); color:var(--status-healthy-text); margin-top:2px;">
                        None of your spending categories are currently in Warning or Critical status.
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="card">
            <div class="card-header">
                <div>
                    <h2 class="card-title" style="display:flex; align-items:center; gap:8px;">
                        <span aria-hidden="true">⚠️</span> At-Risk Budgets
                    </h2>
                    <p class="card-subtitle">Top categories needing attention this month</p>
                </div>
                <a href="#budget" class="btn btn-ghost btn-sm" aria-label="See all budgets">
                    See all budgets →
                </a>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${contentHtml}
            </div>
        </div>
    `;
}

/**
 * Last 5 Transactions
 */
function renderRecentTransactionsCard({ currency }) {
    const txs = store.getTransactions().slice(0, 5);

    return `
        <div class="card">
            <div class="card-header">
                <div>
                    <h2 class="card-title">Recent Transactions</h2>
                    <p class="card-subtitle">5 latest recorded entries</p>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                    <button type="button" class="btn btn-ghost btn-sm" id="btnToggleTxDetails" aria-expanded="false" 
                            aria-controls="recent-tx-extra" onclick="window.app.toggleDashboardDetails('recent-tx-extra', this)" aria-label="Toggle extra transaction details">
                        <span>Details</span> <span class="expander-arrow" aria-hidden="true">▾</span>
                    </button>
                    <a href="#transactions" class="btn btn-ghost btn-sm" aria-label="See all transactions">
                        See all →
                    </a>
                </div>
            </div>

            <div class="table-responsive">
                <table class="data-table">
                    <caption class="sr-only">Table of last 5 transactions</caption>
                    <thead>
                        <tr>
                            <th scope="col">Merchant / Source</th>
                            <th scope="col" class="tx-extra-col" style="display:none;">Category</th>
                            <th scope="col" class="tx-extra-col" style="display:none;">Date</th>
                            <th scope="col" style="text-align:right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${txs.map(t => {
                            const isIncome = t.type === 'income';
                            const merchantEscaped = escapeHtml(t.merchant);
                            const categoryEscaped = escapeHtml(t.category);

                            return `
                                <tr>
                                    <td data-label="Merchant">
                                        <div class="txn-merchant">
                                            <span class="txn-icon" style="background:${t.iconBg || '#EAF1FC'}; color:${t.iconColor || 'var(--navy)'};" aria-hidden="true">
                                                ${t.icon || '💳'}
                                            </span>
                                            <div>
                                                <div style="font-weight:600;">${merchantEscaped}</div>
                                                <div class="tx-inline-meta" style="font-size:var(--text-xs); color:var(--text-muted);">${categoryEscaped} • ${escapeHtml(t.date)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Category" class="tx-extra-col" style="display:none;">
                                        <span class="cat-pill" style="background:var(--bg); color:var(--text);">
                                            ${categoryEscaped}
                                        </span>
                                    </td>
                                    <td data-label="Date" class="tx-extra-col" style="display:none; font-size:var(--text-xs); color:var(--text-muted);">${escapeHtml(t.date)}</td>
                                    <td data-label="Amount" style="text-align:right;" class="${isIncome ? 'amt-pos' : 'amt-neg'}">
                                        <span class="sr-only">${isIncome ? 'Income: ' : 'Expense: '}</span>${isIncome ? '+' : '-'}${currency}${Number(t.amount).toLocaleString()}
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
