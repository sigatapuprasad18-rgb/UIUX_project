/* MindWallet View: Spending Analytics & Monthly Financial Reports */
import { store, escapeHtml } from '../store.js';

export function renderAnalytics(defaultTab = 'analytics', selectedMonthStr = null) {
    const targetDate = selectedMonthStr ? new Date(`${selectedMonthStr}-01`) : new Date();
    const monthName = targetDate.toLocaleString('default', { month: 'long' });
    const yearStr = targetDate.getFullYear();
    const curYearMonth = `${yearStr}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

    const txs = store.getMonthTransactions(targetDate);
    const expenseTxs = txs.filter(t => t.type === 'expense');
    const currency = store.getSettings().currency;
    const mSummary = store.getMonthSummary(targetDate);

    // Group expenses by category
    const categoryTotals = {};
    let totalSpent = 0;
    expenseTxs.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        totalSpent += Number(t.amount);
    });

    const categoriesSorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    // Data-driven Comparative Monthly Flow with proportional heights (no hardcoded heights)
    const income = mSummary.monthlyIncome;
    const expense = mSummary.monthlyExpense;
    const saved = mSummary.savedThisMonth;
    const maxVal = Math.max(income, expense, saved, 1);

    const incomePct = maxVal > 0 ? ((income / maxVal) * 100) : 0;
    const expensePct = maxVal > 0 ? ((expense / maxVal) * 100) : 0;
    const savedPct = maxVal > 0 ? ((saved / maxVal) * 100) : 0;

    const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : 0;
    const savedRatio = income > 0 ? Math.round((saved / income) * 100) : 0;
    const currentUser = store.getCurrentUser();
    const lastDayOfMonth = new Date(yearStr, targetDate.getMonth() + 1, 0).getDate();

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Analytics & Monthly Reports</h1>
                <p class="page-subtitle">Comparative cashflow analytics and official financial statement for <strong>${monthName} ${yearStr}</strong>.</p>
            </div>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <label for="report-month-select" class="sr-only">Select Month</label>
                <input type="month" id="report-month-select" class="form-control" style="width:auto; padding:6px 12px; font-size:0.875rem;" value="${curYearMonth}" onchange="window.app.handleReportMonthChange(this.value)" aria-label="Select report statement month" />
                <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">
                    <span aria-hidden="true">🖨️</span> Print / Save PDF
                </button>
            </div>
        </div>

        <!-- Section 1: Dynamic Visual Cashflow Analysis -->
        <div class="grid-2">
            <!-- Dynamic Comparative Monthly Flow Bar Chart -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">Comparative Monthly Flow</h2>
                        <p class="card-subtitle">Actual Cashflow: Income vs Outflow vs Saved (${monthName} ${yearStr})</p>
                    </div>
                    <span class="status-pill healthy"><span aria-hidden="true">📊</span> Live Data</span>
                </div>

                <!-- Accessible Text / Table Alternative for Screen Readers -->
                <table class="sr-only">
                    <caption>Comparative Monthly Cashflow Table for ${monthName} ${yearStr}</caption>
                    <thead>
                        <tr>
                            <th scope="col">Flow Category</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Proportion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Monthly Income</td><td>${currency}${income.toLocaleString()}</td><td>100% Base</td></tr>
                        <tr><td>Monthly Expenses</td><td>${currency}${expense.toLocaleString()}</td><td>${expenseRatio}% of Income</td></tr>
                        <tr><td>Saved This Month</td><td>${currency}${saved.toLocaleString()}</td><td>${savedRatio}% of Income</td></tr>
                    </tbody>
                </table>

                <!-- Data-Driven Visual Bars with proportional percentage heights (no hardcoded pixel heights) -->
                <div role="img" aria-label="Comparative monthly cashflow: Income ${currency}${income.toLocaleString()}, Expenses ${currency}${expense.toLocaleString()}, Saved this month ${currency}${saved.toLocaleString()}" 
                     style="height:210px; display:flex; align-items:flex-end; justify-content:space-around; padding:20px 10px 14px; background:var(--bg); border-radius:12px; border:1px solid var(--border);">
                    
                    <!-- Income Bar -->
                    <div style="display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end;">
                        <span style="font-size:0.82rem; font-weight:700; color:var(--text);">+${currency}${income.toLocaleString()}</span>
                        <div style="width:58px; height:${incomePct.toFixed(1)}%; background:var(--emerald); border-radius:8px 8px 0 0; transition:height 0.4s ease;" title="Monthly Income: +${currency}${income.toLocaleString()}"></div>
                        <span style="font-size:0.85rem; font-weight:600; color:var(--text);">Income</span>
                    </div>

                    <!-- Expenses Bar -->
                    <div style="display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end;">
                        <span style="font-size:0.82rem; font-weight:700; color:var(--text);">-${currency}${expense.toLocaleString()}</span>
                        <div style="width:58px; height:${expensePct.toFixed(1)}%; background:var(--navy); border-radius:8px 8px 0 0; transition:height 0.4s ease;" title="Monthly Expenses: -${currency}${expense.toLocaleString()}"></div>
                        <span style="font-size:0.85rem; font-weight:600; color:var(--text);">Expenses</span>
                    </div>

                    <!-- Savings Bar -->
                    <div style="display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end;">
                        <span style="font-size:0.82rem; font-weight:700; color:var(--text);">${currency}${saved.toLocaleString()}</span>
                        <div style="width:58px; height:${savedPct.toFixed(1)}%; background:var(--purple); border-radius:8px 8px 0 0; transition:height 0.4s ease;" title="Saved This Month: ${currency}${saved.toLocaleString()}"></div>
                        <span style="font-size:0.85rem; font-weight:600; color:var(--text);">Saved</span>
                    </div>
                </div>

                <!-- Text Summary of Flow -->
                <div style="margin-top:12px; padding:10px 12px; background:var(--surface); border-radius:8px; border:1px solid var(--border); font-size:var(--text-xs); color:var(--text); line-height:1.5;">
                    <strong>Cashflow Summary for ${monthName} ${yearStr}:</strong> You earned ${currency}${income.toLocaleString()}, spent ${currency}${expense.toLocaleString()} (${expenseRatio}% of income), and deposited ${currency}${saved.toLocaleString()} (${savedRatio}% of income) toward goals, leaving a net monthly cash retention of <strong>${currency}${mSummary.moneyLeftThisMonth.toLocaleString()}</strong>.
                </div>
            </div>

            <!-- Expense Category Breakdown Card -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">Expense Category Breakdown</h2>
                        <p class="card-subtitle">Monthly Expenses for ${monthName}: ${currency}${totalSpent.toLocaleString()}</p>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:14px; margin-top:6px;">
                    ${categoriesSorted.length > 0 ? categoriesSorted.map(([cat, amt]) => {
                        const pct = Math.round((amt / (totalSpent || 1)) * 100);
                        const catEscaped = escapeHtml(cat);
                        return `
                            <div class="progress-wrap">
                                <div style="display:flex; justify-content:space-between; font-size:var(--text-sm); font-weight:600;">
                                    <span>${catEscaped}</span>
                                    <span>${currency}${amt.toLocaleString()} (${pct}%)</span>
                                </div>
                                <div class="progress-bar-bg" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${catEscaped} proportion: ${pct}%" style="height:10px;">
                                    <div class="progress-fill" style="width:${pct}%;"></div>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p style="color:var(--text-muted); font-size:var(--text-sm); text-align:center; padding:24px 0;">No expenses recorded in ' + monthName + ' ' + yearStr + '.</p>'}
                </div>
            </div>
        </div>

        <!-- Section 2: Printable Monthly Statement -->
        <div class="card" style="padding:32px; margin-top:20px;">
            <div style="display:flex; justify-content:space-between; border-bottom:2px solid var(--navy); padding-bottom:16px; flex-wrap:wrap; gap:12px; align-items:flex-end;">
                <div>
                    <h2 style="font-size:1.5rem; font-weight:700; color:var(--navy);">MindWallet Monthly Statement</h2>
                    <p style="font-size:0.95rem; font-weight:600; color:var(--accent); margin-top:2px;">Statement Period: ${monthName} 1, ${yearStr} – ${monthName} ${lastDayOfMonth}, ${yearStr}</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; font-size:1.05rem;">${escapeHtml(currentUser?.name || 'Primary Wallet')}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(currentUser?.email || 'user@mindwallet.local')}</div>
                </div>
            </div>

            <div class="grid-3" style="margin-top:24px;">
                <div style="background:var(--bg); padding:16px; border-radius:10px; border:1px solid var(--border);">
                    <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Total Income (${monthName})</div>
                    <div style="font-size:1.4rem; font-weight:700; color:var(--emerald);">${currency}${income.toLocaleString()}</div>
                </div>
                <div style="background:var(--bg); padding:16px; border-radius:10px; border:1px solid var(--border);">
                    <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Total Expenses (${monthName})</div>
                    <div style="font-size:1.4rem; font-weight:700; color:var(--danger-text);">${currency}${expense.toLocaleString()}</div>
                </div>
                <div style="background:var(--bg); padding:16px; border-radius:10px; border:1px solid var(--border);">
                    <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Net Retained Balance</div>
                    <div style="font-size:1.4rem; font-weight:700; color:var(--navy);">${currency}${mSummary.moneyLeftThisMonth.toLocaleString()}</div>
                </div>
            </div>

            <div class="table-responsive" style="margin-top:24px;">
                <table class="data-table">
                    <caption class="sr-only">Detailed transactions statement for ${monthName} ${yearStr}</caption>
                    <thead>
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Description</th>
                            <th scope="col">Category</th>
                            <th scope="col" style="text-align:right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${txs.length > 0 ? txs.map(t => `
                            <tr>
                                <td data-label="Date">${escapeHtml(t.date)}</td>
                                <td data-label="Description" style="font-weight:600;">${escapeHtml(t.merchant)}</td>
                                <td data-label="Category">${escapeHtml(t.category)}</td>
                                <td data-label="Amount" style="text-align:right;" class="${t.type === 'income' ? 'amt-pos' : 'amt-neg'}">
                                    <span class="sr-only">${t.type === 'income' ? 'Income: ' : 'Expense: '}</span>${t.type === 'income' ? '+' : '-'}${currency}${Number(t.amount).toLocaleString()}
                                </td>
                            </tr>
                        `).join('') : `<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted);">No transactions recorded for ${monthName} ${yearStr}.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

