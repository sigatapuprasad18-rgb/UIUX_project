/* MindWallet View: Activity (Transactions + Reports Tabs) */
import { store, escapeHtml } from '../store.js';
import { renderTransactions } from './transactions.js';
import { renderReports } from './reports.js';

export function renderActivity(activeTab = 'transactions', selectedMonthStr = null) {
    const isReports = activeTab === 'reports';

    return `
        <div class="tabs-header-wrap">
            <div class="page-title-group">
                <h1 tabindex="-1">Activity</h1>
                <p class="page-subtitle">Track your income and expense transactions, and inspect monthly statements.</p>
            </div>
            
            <div class="view-tabs" role="tablist" aria-label="Activity Navigation">
                <button type="button" role="tab" class="view-tab-btn ${!isReports ? 'active' : ''}" id="tab-activity-tx" 
                    aria-selected="${!isReports ? 'true' : 'false'}" aria-controls="panel-activity-content" 
                    onclick="window.app.switchSubTab('activity', 'transactions')">
                    <span aria-hidden="true">💳</span> Transactions Tracker
                </button>
                <button type="button" role="tab" class="view-tab-btn ${isReports ? 'active' : ''}" id="tab-activity-reports" 
                    aria-selected="${isReports ? 'true' : 'false'}" aria-controls="panel-activity-content" 
                    onclick="window.app.switchSubTab('activity', 'reports')">
                    <span aria-hidden="true">📄</span> Monthly Statement
                </button>
            </div>
        </div>

        <div role="tabpanel" id="panel-activity-content" aria-labelledby="${isReports ? 'tab-activity-reports' : 'tab-activity-tx'}" style="margin-top:16px;">
            ${isReports ? renderReports(selectedMonthStr) : renderTransactions()}
        </div>
    `;
}
