/* MindWallet View: Reports (Delegates to Merged Analytics & Reports View) */
import { renderAnalytics } from './analytics.js';

export function renderReports(selectedMonthStr = null) {
    return renderAnalytics('statement', selectedMonthStr);
}
