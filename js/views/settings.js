/* MindWallet View: Settings & Profile Preferences */
import { store, escapeHtml, PERSONA_PRESETS, resolvePersonaKey } from '../store.js';

export function renderSettings() {
    const settings = store.getSettings();
    const currentPersona = resolvePersonaKey(settings.persona || 'student');
    const activePreset = PERSONA_PRESETS[currentPersona] || PERSONA_PRESETS.student;

    return `
        <div class="page-header">
            <div class="page-title-group">
                <h1 tabindex="-1">Settings & User Profiles</h1>
                <p class="page-subtitle">Configure your financial profile archetype, accessibility accommodations, and currency anchors.</p>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <button type="button" class="btn btn-secondary" onclick="window.app.openProfileSwitcherModal()">
                    <span aria-hidden="true">🔄</span> Switch Profile Archetype
                </button>
                <button type="button" class="btn btn-primary" onclick="window.onboarding ? window.onboarding.open(1) : null">
                    <span aria-hidden="true">🧙</span> Launch Setup Wizard
                </button>
            </div>
        </div>

        <div class="grid-2">
            <!-- Active Profile Archetype Card -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">Active User Profile</h2>
                        <p class="card-subtitle">Each profile archetype preserves its own records, starter benchmarks, and interface pacing.</p>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:14px; background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:14px; margin-top:10px;">
                    <span style="font-size:2.2rem;" aria-hidden="true">${activePreset.icon || '👤'}</span>
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:1.05rem; color:var(--text);">${escapeHtml(activePreset.name)}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${escapeHtml(activePreset.badge || activePreset.role)}</div>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm" onclick="window.app.openProfileSwitcherModal()">
                        Change Profile →
                    </button>
                </div>

                <div class="form-group" style="margin-top:14px;">
                    <label for="settings-persona">Switch Profile Archetype</label>
                    <select id="settings-persona" class="form-control" onchange="window.app.handlePersonaChange(this.value)">
                        <option value="student" ${currentPersona === 'student' ? 'selected' : ''}>🎓 Alex Morgan — Student (Stipend ₹18k, 24h Cooling-Off)</option>
                        <option value="working_professional" ${currentPersona === 'working_professional' ? 'selected' : ''}>💼 Priya Sharma — Working Professional (Salary ₹85k, Zero-Based)</option>
                        <option value="elderly_retiree" ${currentPersona === 'elderly_retiree' ? 'selected' : ''}>👵 Eleanor Vance — Senior Citizen / Retiree (Pension ₹36k, Senior Mode)</option>
                        <option value="goal_saver" ${currentPersona === 'goal_saver' ? 'selected' : ''}>🎯 Rohan Mehta — Big-Goal Saver (Salary ₹110k, Milestones)</option>
                    </select>
                </div>
                
                <!-- Active Profile Feature Highlights -->
                <div style="background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:12px; margin-top:14px; font-size:var(--text-xs); line-height:1.6;">
                    <div style="font-weight:700; color:var(--text); margin-bottom:4px; font-size:var(--text-sm);">
                        Profile Parameters (${escapeHtml(activePreset.name)})
                    </div>
                    <div>🎯 <strong>Dashboard Focus:</strong> ${currentPersona === 'student' ? 'Can I Afford This? / Impulse Control upfront' : (currentPersona === 'working_professional' ? 'Zero-based variance analysis & subscription audits upfront' : (currentPersona === 'elderly_retiree' ? 'Healthcare balance & fixed pension pacing' : 'Goal progress & milestone celebrations upfront'))}</div>
                    <div>🧠 <strong>Coach Tone:</strong> ${escapeHtml(activePreset.coachTone || 'Supportive')} guidance</div>
                    <div>⏱️ <strong>Cooling-off Timer:</strong> ${activePreset.coolingOffEnabled ? `${activePreset.coolingOffHours}h deliberation buffer for want items` : 'Immediate evaluation'}</div>
                    ${activePreset.seniorAccommodations ? '<div>👵 <strong>Senior Mode:</strong> ≥52px touch targets & enlarged text scaling active</div>' : ''}
                </div>
            </div>

            <!-- Currency & Financial Baseline -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">Financial Anchors</h2>
                        <p class="card-subtitle">Base currency and monthly income baseline used across metrics</p>
                    </div>
                </div>
                <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap:12px; margin-top:8px;">
                    <div class="form-group">
                        <label for="settings-currency">Base Currency</label>
                        <select id="settings-currency" class="form-control" onchange="window.app.handleCurrencyChange(this.value)">
                            <option value="₹" ${settings.currency === '₹' ? 'selected' : ''}>₹ INR (Rupee)</option>
                            <option value="$" ${settings.currency === '$' ? 'selected' : ''}>$ USD (Dollar)</option>
                            <option value="€" ${settings.currency === '€' ? 'selected' : ''}>€ EUR (Euro)</option>
                            <option value="£" ${settings.currency === '£' ? 'selected' : ''}>£ GBP (Pound)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="settings-income">Monthly Income</label>
                        <input type="number" id="settings-income" class="form-control" value="${settings.monthlyIncome || activePreset.income || 45000}" step="1000" min="1000" onchange="window.app.handleIncomeChange(this.value)" />
                    </div>
                </div>
                <div style="font-size:var(--text-xs); color:var(--text-muted); margin-top:8px;">
                    Income adjusts diagnostic ratios such as subscription burden and emergency runway.
                </div>
            </div>

            <!-- Theme & Accessibility Accommodations -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">Accessibility Accommodations</h2>
                        <p class="card-subtitle">Accommodations persist across all personas and views</p>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" id="pref-darkmode" ${settings.darkMode ? 'checked' : ''} onchange="window.app.toggleDarkMode()" />
                        <span style="font-size:var(--text-sm); font-weight:600;">🌙 Dark Mode Theme</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" id="pref-mod-lowvision" ${settings.highContrast ? 'checked' : ''} onchange="window.app.handleModifierToggle('highContrast', this.checked)" />
                        <span style="font-size:var(--text-sm); font-weight:600;">👁️ High Contrast (7:1+ stark borders)</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" id="pref-mod-dyslexia" ${settings.dyslexicFont ? 'checked' : ''} onchange="window.app.handleModifierToggle('dyslexicFont', this.checked)" />
                        <span style="font-size:var(--text-sm); font-weight:600;">📖 Dyslexia-Friendly Typography & Letter Spacing</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" id="pref-reduced-motion" ${settings.reducedMotion ? 'checked' : ''} onchange="window.app.handleModifierToggle('reducedMotion', this.checked)" />
                        <span style="font-size:var(--text-sm); font-weight:600;">⏸️ Reduced Motion (Disable transitions & animations)</span>
                    </label>
                </div>

                <div class="form-group" style="margin-top:14px; border-top:1px solid var(--border); padding-top:12px;">
                    <label for="settings-colorblind" style="font-weight:600; font-size:var(--text-sm);">🎨 Colorblind-Safe Palette</label>
                    <select id="settings-colorblind" class="form-control" style="margin-top:4px;" onchange="window.app.handleColorblindChange(this.value)">
                        <option value="none" ${(settings.colorblindMode || 'none') === 'none' ? 'selected' : ''}>Standard (WCAG 2.2 AA)</option>
                        <option value="protanopia" ${settings.colorblindMode === 'protanopia' ? 'selected' : ''}>Protanopia (Red-Weak: Blue / Amber / Violet)</option>
                        <option value="deuteranopia" ${settings.colorblindMode === 'deuteranopia' ? 'selected' : ''}>Deuteranopia (Green-Weak: Blue / Amber / Violet)</option>
                        <option value="tritanopia" ${settings.colorblindMode === 'tritanopia' ? 'selected' : ''}>Tritanopia (Blue-Weak: Teal / Orange / Rose)</option>
                    </select>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px solid var(--border); padding-top:12px;">
                    <div>
                        <div style="font-weight:600; font-size:var(--text-sm);">Text Size Multiplier</div>
                        <div style="font-size:var(--text-xs); color:var(--text-muted);">Current: <strong>${100 + (settings.fontSizeStep || 0) * 12.5}%</strong></div>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="window.app.adjustFontSize(-1)" title="Decrease text size">A-</button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="window.app.resetFontSize()" title="Reset text size">Reset</button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="window.app.adjustFontSize(1)" title="Increase text size">A+</button>
                    </div>
                </div>
            </div>

            <!-- Data & System Reset -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">Data Hygiene & Backup</h2>
                        <p class="card-subtitle">Export local data, restore from backup, or reset to clean baseline.</p>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:12px; margin-top:14px;">
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="window.app.handleExportData()">
                            <span aria-hidden="true">📥</span> Export Backup (JSON)
                        </button>
                        <label class="btn btn-outline btn-sm" style="cursor:pointer; margin:0;">
                            <span aria-hidden="true">📤</span> Import Backup (JSON)
                            <input type="file" id="importDataFileInput" accept=".json,application/json" style="display:none;" onchange="window.app.handleImportDataFile(event)" />
                        </label>
                    </div>
                    <div style="border-top:1px solid var(--border); padding-top:12px; margin-top:4px;">
                        <button type="button" class="btn btn-danger btn-sm" onclick="window.app.resetData()">
                            <span aria-hidden="true">⚠️</span> Factory Reset All Sample Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
