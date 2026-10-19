/* MindWallet View: Plan (Budgets + Goals + Subscriptions Tabs) */
import { store, escapeHtml } from '../store.js';
import { renderBudget } from './budget.js';
import { renderSavings } from './savings.js';
import { renderSubscriptions } from './subscriptions.js';

export function renderPlan(activeTab = 'budget') {
    const isBudget = activeTab === 'budget';
    const isSavings = activeTab === 'savings';
    const isSubs = activeTab === 'subscriptions';

    let contentHtml = '';
    let currentTabId = 'tab-plan-budget';
    if (isSavings) {
        contentHtml = renderSavings();
        currentTabId = 'tab-plan-savings';
    } else if (isSubs) {
        contentHtml = renderSubscriptions();
        currentTabId = 'tab-plan-subs';
    } else {
        contentHtml = renderBudget();
        currentTabId = 'tab-plan-budget';
    }

    return `
        <div class="tabs-header-wrap">
            <div class="page-title-group">
                <h1 tabindex="-1">Financial Plan</h1>
                <p class="page-subtitle">Configure spending limits, track savings milestones, and manage recurring commitments.</p>
            </div>
            
            <div class="view-tabs" role="tablist" aria-label="Plan Navigation">
                <button type="button" role="tab" class="view-tab-btn ${isBudget ? 'active' : ''}" id="tab-plan-budget" 
                    aria-selected="${isBudget ? 'true' : 'false'}" aria-controls="panel-plan-content" 
                    onclick="window.app.switchSubTab('plan', 'budget')">
                    <span aria-hidden="true">📊</span> Budget Planner
                </button>
                <button type="button" role="tab" class="view-tab-btn ${isSavings ? 'active' : ''}" id="tab-plan-savings" 
                    aria-selected="${isSavings ? 'true' : 'false'}" aria-controls="panel-plan-content" 
                    onclick="window.app.switchSubTab('plan', 'savings')">
                    <span aria-hidden="true">🎯</span> Savings Goals
                </button>
                <button type="button" role="tab" class="view-tab-btn ${isSubs ? 'active' : ''}" id="tab-plan-subs" 
                    aria-selected="${isSubs ? 'true' : 'false'}" aria-controls="panel-plan-content" 
                    onclick="window.app.switchSubTab('plan', 'subscriptions')">
                    <span aria-hidden="true">🔁</span> Subscriptions
                </button>
            </div>
        </div>

        <div role="tabpanel" id="panel-plan-content" aria-labelledby="${currentTabId}" style="margin-top:16px;">
            ${contentHtml}
        </div>
    `;
}
