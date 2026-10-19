/* MindWallet View: Insights (Health + Analytics + Smart Insights + Simulator Tabs) */
import { store, escapeHtml } from '../store.js';
import { renderHealth } from './health.js';
import { renderAnalytics } from './analytics.js';
import { renderSimulator } from './simulator.js';

export function renderSmartNudges() {
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    const currency = store.getSettings().currency;
    const mSummary = store.getMonthSummary();
    const budgets = store.getBudgets();
    const monthTxs = store.getMonthTransactions();
    const subs = store.getSubscriptions();
    const monthlySubBurn = store.getMonthlySubscriptionCost();
    const annualSubBurn = monthlySubBurn * 12;
    const goals = store.getGoals();

    // Category usage calculations
    const catUsage = budgets.map(b => {
        const spent = monthTxs
            .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === b.category.toLowerCase())
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const pct = Math.round((spent / b.limit) * 100);
        const remaining = b.limit - spent;
        return { ...b, spent, pct, remaining };
    });
    catUsage.sort((a, b) => b.pct - a.pct);
    const highestUsed = catUsage[0] || { category: 'Groceries', pct: 0, limit: 5000, remaining: 5000, spent: 0 };
    const lowestUsed = catUsage[catUsage.length - 1] || highestUsed;

    // Upcoming renewals within 7 days
    const today = new Date();
    const upcomingSubs = subs.filter(s => {
        if (!s.nextBilling) return false;
        const d = new Date(s.nextBilling);
        const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
    });

    // Nearest goal ETA
    const nearestGoal = goals[0] || { name: 'Emergency Reserve', current: 20000, target: 50000, monthlyContribution: 5000 };
    const goalRemaining = Math.max(0, nearestGoal.target - nearestGoal.current);
    const goalMonthsETA = nearestGoal.monthlyContribution > 0 ? Math.ceil(goalRemaining / nearestGoal.monthlyContribution) : 0;
    const goalPct = Math.min(100, Math.round((nearestGoal.current / nearestGoal.target) * 100));

    return `
        <div class="grid-2">
            <!-- 1. Category Pacing Insight -->
            <div class="card" style="border-left: 5px solid ${highestUsed.pct >= 75 ? 'var(--status-warning)' : 'var(--accent)'};">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="font-size:2rem;" aria-hidden="true">${highestUsed.pct >= 75 ? '⚠️' : '🎉'}</span>
                    <div>
                        <h2 style="font-size:1.05rem; font-weight:700;">
                            ${highestUsed.pct >= 75 ? `${escapeHtml(highestUsed.category)} Budget Alert` : `${escapeHtml(lowestUsed.category)} Pacing on Track`}
                        </h2>
                        <p style="color:var(--text); font-size:0.9rem; margin-top:4px;">
                            ${highestUsed.pct >= 75
                                ? `You have utilized <strong>${highestUsed.pct}%</strong> (${currency}${highestUsed.spent.toLocaleString()}) of your ${currency}${highestUsed.limit.toLocaleString()} monthly limit. Consider pacing discretionary expenses.`
                                : `You have utilized only <strong>${lowestUsed.pct}%</strong> of your monthly ${escapeHtml(lowestUsed.category)} limit. You have ${currency}${lowestUsed.remaining.toLocaleString()} buffer remaining for ${monthName}.`}
                        </p>
                    </div>
                </div>
            </div>

            <!-- 2. Subscription Cashflow Insight -->
            <div class="card" style="border-left: 5px solid var(--orange);">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="font-size:2rem;" aria-hidden="true">🔁</span>
                    <div>
                        <h2 style="font-size:1.05rem; font-weight:700;">Subscription Outflow Analysis</h2>
                        <p style="color:var(--text); font-size:0.9rem; margin-top:4px;">
                            You currently pay <strong>${currency}${Math.round(monthlySubBurn).toLocaleString()}/month</strong> (${currency}${Math.round(annualSubBurn).toLocaleString()} annualized) across ${subs.length} active service${subs.length === 1 ? '' : 's'}.
                            ${upcomingSubs.length > 0
                                ? `<br><span style="color:var(--warning-text); font-weight:600;">Upcoming: ${escapeHtml(upcomingSubs[0].name)} renews for ${currency}${upcomingSubs[0].amount.toLocaleString()} on ${escapeHtml(upcomingSubs[0].nextBilling)}.</span>`
                                : ` No renewals due in the next 7 days.`}
                        </p>
                    </div>
                </div>
            </div>

            <!-- 3. Goal ETA Milestone -->
            <div class="card" style="border-left: 5px solid var(--purple);">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="font-size:2rem;" aria-hidden="true">🎯</span>
                    <div>
                        <h2 style="font-size:1.05rem; font-weight:700;">${escapeHtml(nearestGoal.name)} ETA</h2>
                        <p style="color:var(--text); font-size:0.9rem; margin-top:4px;">
                            Progress: <strong>${currency}${nearestGoal.current.toLocaleString()} / ${currency}${nearestGoal.target.toLocaleString()} (${goalPct}%)</strong>.
                            At your planned deposit rate of ${currency}${Number(nearestGoal.monthlyContribution).toLocaleString()}/mo, you are on track to achieve this goal in <strong>~${goalMonthsETA} month${goalMonthsETA === 1 ? '' : 's'}</strong> (${currency}${goalRemaining.toLocaleString()} remaining).
                        </p>
                    </div>
                </div>
            </div>

            <!-- 4. Behavioral Impulse Delay Rule -->
            <div class="card" style="border-left: 5px solid var(--navy);">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="font-size:2rem;" aria-hidden="true">💡</span>
                    <div>
                        <h2 style="font-size:1.05rem; font-weight:700;">Cognitive 30-Day Impulse Rule</h2>
                        <p style="color:var(--text); font-size:0.9rem; margin-top:4px;">
                            Before completing non-essential "Want" purchases above ${currency}${Math.round(mSummary.monthlyIncome * 0.1).toLocaleString()}, run them through the <strong>Purchase Simulator</strong> to assess health score change and savings goal delay.
                        </p>
                        <div style="margin-top:10px;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.switchSubTab('insights', 'simulator')">Open Purchase Simulator →</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderInsights(activeTab = 'health', selectedMonthStr = null) {
    const isHealth = activeTab === 'health' || (!activeTab);
    const isAnalytics = activeTab === 'analytics';
    const isNudges = activeTab === 'insights' || activeTab === 'nudges';
    const isSimulator = activeTab === 'simulator';

    let contentHtml = '';
    let currentTabId = 'tab-insights-health';
    if (isAnalytics) {
        contentHtml = renderAnalytics('analytics', selectedMonthStr);
        currentTabId = 'tab-insights-analytics';
    } else if (isNudges) {
        contentHtml = renderSmartNudges();
        currentTabId = 'tab-insights-nudges';
    } else if (isSimulator) {
        contentHtml = renderSimulator();
        currentTabId = 'tab-insights-simulator';
    } else {
        contentHtml = renderHealth();
        currentTabId = 'tab-insights-health';
    }

    return `
        <div class="tabs-header-wrap">
            <div class="page-title-group">
                <h1 tabindex="-1">Insights & Decision Tools</h1>
                <p class="page-subtitle">Multi-factor diagnostic evaluation, pattern analysis, and pre-purchase simulations.</p>
            </div>
            
            <div class="view-tabs" role="tablist" aria-label="Insights Navigation">
                <button type="button" role="tab" class="view-tab-btn ${isHealth ? 'active' : ''}" id="tab-insights-health" 
                    aria-selected="${isHealth ? 'true' : 'false'}" aria-controls="panel-insights-content" 
                    onclick="window.app.switchSubTab('insights', 'health')">
                    <span aria-hidden="true">🛡️</span> Health Score
                </button>
                <button type="button" role="tab" class="view-tab-btn ${isAnalytics ? 'active' : ''}" id="tab-insights-analytics" 
                    aria-selected="${isAnalytics ? 'true' : 'false'}" aria-controls="panel-insights-content" 
                    onclick="window.app.switchSubTab('insights', 'analytics')">
                    <span aria-hidden="true">📈</span> Analytics
                </button>
                <button type="button" role="tab" class="view-tab-btn ${isNudges ? 'active' : ''}" id="tab-insights-nudges" 
                    aria-selected="${isNudges ? 'true' : 'false'}" aria-controls="panel-insights-content" 
                    onclick="window.app.switchSubTab('insights', 'nudges')">
                    <span aria-hidden="true">💡</span> Smart Insights
                </button>
                <button type="button" role="tab" class="view-tab-btn ${isSimulator ? 'active' : ''}" id="tab-insights-simulator" 
                    aria-selected="${isSimulator ? 'true' : 'false'}" aria-controls="panel-insights-content" 
                    onclick="window.app.switchSubTab('insights', 'simulator')">
                    <span aria-hidden="true">⚡</span> Purchase Simulator
                </button>
            </div>
        </div>

        <div role="tabpanel" id="panel-insights-content" aria-labelledby="${currentTabId}" style="margin-top:16px;">
            ${contentHtml}
        </div>
    `;
}
