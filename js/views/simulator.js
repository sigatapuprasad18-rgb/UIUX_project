/* MindWallet View: Cognitive Purchase Simulator ("Can I Afford This?") */
import { store, escapeHtml } from '../store.js';

export function renderSimulator() {
    const currency = store.getSettings().currency;
    const goals = store.getGoals();
    const budgets = store.getBudgets();
    const categories = budgets.map(b => b.category);

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Purchase Simulator</h1>
                <p class="page-subtitle">"Can I Afford This?" — Cognitive decision evaluation before spending money.</p>
            </div>
        </div>

        <div class="grid-2">
            <!-- Form Card -->
            <div class="card">
                <h2 class="card-title">Simulate a Planned Purchase</h2>
                <form id="simulator-form" onsubmit="window.app.runSimulation(event)">
                    <div id="sim-error" role="alert" style="display:none; color:var(--status-critical-text); background:var(--status-critical-bg); padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:0.875rem; border:1px solid var(--status-critical-border);"></div>
                    
                    <div class="form-group" style="margin-top:8px;">
                        <label for="sim-item">Planned Item / Service Name</label>
                        <input type="text" id="sim-item" class="form-control" placeholder="e.g. Sony Wireless Headphones, Dinner Buffet" required />
                    </div>

                    <div class="form-grid" style="margin-top:12px;">
                        <div class="form-group">
                            <label for="sim-price">Price (${currency})</label>
                            <input type="number" id="sim-price" class="form-control" placeholder="6500" min="1" required />
                        </div>
                        <div class="form-group">
                            <label for="sim-category">Category Budget to Impact</label>
                            <select id="sim-category" class="form-control">
                                ${categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="form-grid" style="margin-top:12px;">
                        <div class="form-group">
                            <label for="sim-priority">Purchase Urgency / Priority</label>
                            <select id="sim-priority" class="form-control">
                                <option value="Want">Want (Discretionary / Impulse)</option>
                                <option value="Need">Need (Mandatory / Essential)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sim-goal">Goal to Delay if Purchased</label>
                            <select id="sim-goal" class="form-control">
                                ${goals.map(g => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.name)} (₹${g.monthlyContribution}/mo)</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:20px; font-size:1rem; padding:12px;">
                        <span aria-hidden="true">⚡</span> Evaluate Decision Impact
                    </button>
                </form>
            </div>

            <!-- Result Output Card -->
            <div class="card" id="sim-result-card">
                <h2 class="card-title">Simulation Decision Analysis</h2>
                <div id="sim-result-content" role="status" aria-live="polite" style="display:flex; flex-direction:column; gap:16px; margin-top:4px;">
                    <div style="text-align:center; padding:36px 20px; color:var(--text-muted);">
                        <span style="font-size:2.5rem; display:block; margin-bottom:8px;" aria-hidden="true">💭</span>
                        Enter an item price and select your target category and goal to calculate the financial and behavioral impact.
                    </div>
                </div>
            </div>
        </div>
    `;
}
