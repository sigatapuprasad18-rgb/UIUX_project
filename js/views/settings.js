/* MindWallet View: Settings */
import { store } from '../store.js';

export function renderSettings() {
    const settings = store.getSettings();

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1>Settings & Preferences</h1>
                <p class="page-subtitle">Configure accessibility, visual modes, and system defaults.</p>
            </div>
        </div>

        <div class="grid-2">
            <!-- Mode Preset Settings -->
            <div class="card">
                <h2 class="card-title">User Mode Presets</h2>
                <div class="form-group" style="margin-top:12px;">
                    <label for="settings-mode">Active Interface Mode</label>
                    <select id="settings-mode" class="form-control" onchange="window.app.setModeFromSettings(this.value)">
                        <option value="standard" ${settings.mode === 'standard' ? 'selected' : ''}>Standard Mode (Default Layout)</option>
                        <option value="accessible" ${settings.mode === 'accessible' ? 'selected' : ''}>Accessible Mode (High Contrast + Scaling)</option>
                        <option value="senior" ${settings.mode === 'senior' ? 'selected' : ''}>Senior Mode (20px Font + Large Touch Targets)</option>
                        <option value="simplified" ${settings.mode === 'simplified' ? 'selected' : ''}>Simplified Mode (Minimal Cognitive Load)</option>
                    </select>
                </div>
            </div>

            <!-- Reset Data Card -->
            <div class="card">
                <h2 class="card-title">Data & System Control</h2>
                <p class="card-subtitle">Reset pre-seeded transactions, goals, and budgets.</p>
                <div style="margin-top:16px;">
                    <button class="btn btn-danger" onclick="window.app.resetData()">
                        <span>⚠️ Reset All Sample Data</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}
