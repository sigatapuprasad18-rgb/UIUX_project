/* MindWallet View: Purchase Simulator */
import { store } from '../store.js';

export function renderSimulator() {
    const currency = store.getSettings().currency;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Purchase Simulator</h1>
                <p class="page-subtitle">"Can I Afford This?" — HCI impulse evaluation before committing money.</p>
            </div>
        </div>

        <div class="grid-2">
            <!-- Form Card -->
            <div class="card">
                <h2 class="card-title">Simulate a Planned Purchase</h2>
                <form id="simulator-form" onsubmit="window.app.runSimulation(event)">
                    <div class="form-group" style="margin-top:12px;">
                        <label for="sim-item">Item / Service Name</label>
                        <input type="text" id="sim-item" class="form-control" placeholder="e.g. PlayStation 5, Designer Shoes" required />
                    </div>

                    <div class="form-grid" style="margin-top:12px;">
                        <div class="form-group">
                            <label for="sim-price">Price (${currency})</label>
                            <input type="number" id="sim-price" class="form-control" placeholder="45000" min="1" required />
                        </div>
                        <div class="form-group">
                            <label for="sim-category">Category</label>
                            <select id="sim-category" class="form-control">
                                <option value="Shopping">Shopping</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Tech">Tech Upgrade</option>
                                <option value="Travel">Travel</option>
                                <option value="Dining out">Dining out</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group" style="margin-top:12px;">
                        <label for="sim-priority">Priority Level</label>
                        <select id="sim-priority" class="form-control">
                            <option value="Want">Want (Non-essential / Discretionary)</option>
                            <option value="Need">Need (Essential / Mandatory)</option>
                        </select>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:20px;">
                        ⚡ Calculate Decision Impact
                    </button>
                </form>
            </div>

            <!-- Result Output Card -->
            <div class="card" id="sim-result-card">
                <h2 class="card-title">Simulation Decision Analysis</h2>
                <div id="sim-result-content" style="display:flex; flex-direction:column; gap:16px; margin-top:8px;">
                    <div style="text-align:center; padding:32px; color:var(--text-muted);">
                        Enter a planned item price and click <strong>Calculate Decision Impact</strong> to see affordability evaluation.
                    </div>
                </div>
            </div>
        </div>
    `;
}
