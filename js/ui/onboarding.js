/* MindWallet — 3-Step Interactive Onboarding & Profile Setup Wizard */
import { store, escapeHtml, resolvePersonaKey } from '../store.js';
import { PERSONA_PRESETS } from '../personas.js';
import { feedback } from './feedback.js';

class OnboardingWizard {
    constructor() {
        this.currentStep = 1;
        this.selectedPersona = 'student';
        this.income = 18000;
        this.currency = '₹';
        this.accessibility = {
            darkMode: false,
            highContrast: false,
            dyslexicFont: false,
            reducedMotion: false,
            colorblindMode: 'none' // none | protanopia | deuteranopia | tritanopia
        };
    }

    open(initialStep = 1) {
        this.currentStep = initialStep;
        const currentSettings = store.getSettings();
        this.selectedPersona = resolvePersonaKey(currentSettings.persona || 'student');
        const preset = PERSONA_PRESETS[this.selectedPersona] || PERSONA_PRESETS.student;
        this.income = currentSettings.monthlyIncome || preset.income || 45000;
        this.currency = currentSettings.currency || '₹';
        this.accessibility = {
            darkMode: !!currentSettings.darkMode,
            highContrast: !!currentSettings.highContrast || !!currentSettings.modifierLowVision,
            dyslexicFont: !!currentSettings.dyslexicFont || !!currentSettings.modifierDyslexia,
            reducedMotion: !!currentSettings.reducedMotion,
            colorblindMode: currentSettings.colorblindMode || 'none'
        };

        const modal = document.getElementById('modal-onboarding');
        if (!modal) return;

        this.render();
        modal.classList.add('open');
        if (window.app) {
            window.app.activeModal = modal;
        }

        // Focus first interactive control in wizard
        setTimeout(() => {
            const firstControl = modal.querySelector('button, input, select, [tabindex="0"]');
            firstControl?.focus();
        }, 60);
    }

    close() {
        const modal = document.getElementById('modal-onboarding');
        if (modal) modal.classList.remove('open');
        if (window.app && window.app.activeModal === modal) {
            window.app.activeModal = null;
        }
        store.setCompletedOnboarding(true);
    }

    render() {
        const card = document.getElementById('onboarding-modal-card');
        if (!card) return;

        card.innerHTML = `
            <div class="modal-header" style="border-bottom:none; padding-bottom:0;">
                <div>
                    <span style="font-size:0.75rem; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.08em;">Quick Setup (3 Steps)</span>
                    <h2 id="onboarding-wizard-title" style="font-size:1.35rem; font-weight:700; margin-top:2px;">
                        ${this.getStepTitle()}
                    </h2>
                </div>
                <button type="button" class="close-btn" aria-label="Skip or close wizard" onclick="window.onboarding.close()">&times;</button>
            </div>

            <!-- 3-Step Indicator Bar -->
            <div class="onboarding-steps" role="navigation" aria-label="Onboarding Progress" style="margin-top:14px;">
                <div class="step-item ${this.currentStep === 1 ? 'active' : this.currentStep > 1 ? 'completed' : ''}">
                    <div class="step-number" aria-current="${this.currentStep === 1 ? 'step' : 'false'}">1</div>
                    <span class="step-label">Persona</span>
                </div>
                <div class="step-item ${this.currentStep === 2 ? 'active' : this.currentStep > 2 ? 'completed' : ''}">
                    <div class="step-number" aria-current="${this.currentStep === 2 ? 'step' : 'false'}">2</div>
                    <span class="step-label">Income & Currency</span>
                </div>
                <div class="step-item ${this.currentStep === 3 ? 'active' : ''}">
                    <div class="step-number" aria-current="${this.currentStep === 3 ? 'step' : 'false'}">3</div>
                    <span class="step-label">Accessibility</span>
                </div>
            </div>

            <!-- Dynamic Step Content -->
            <div class="onboarding-body">
                ${this.renderStepContent()}
            </div>

            <!-- Footer Action Controls -->
            <div class="onboarding-footer">
                ${this.currentStep > 1 
                    ? `<button type="button" class="btn btn-outline" onclick="window.onboarding.prevStep()">← Back</button>` 
                    : `<button type="button" class="btn btn-outline" id="onboardingSkipBtn" onclick="window.onboarding.close()">Skip for Now</button>`}
                
                ${this.currentStep < 3 
                    ? `<button type="button" class="btn btn-primary" onclick="window.onboarding.nextStep()">Next Step →</button>` 
                    : `<button type="button" class="btn btn-primary" onclick="window.onboarding.finishWizard()">🚀 Apply & Enter Dashboard</button>`}
            </div>
        `;
    }

    getStepTitle() {
        switch (this.currentStep) {
            case 1: return '1. Choose Your Financial Persona';
            case 2: return '2. Set Monthly Income & Currency';
            case 3: return '3. Accessibility & Theme Preferences';
            default: return 'Personalize MindWallet';
        }
    }

    renderStepContent() {
        switch (this.currentStep) {
            case 1: return this.renderStep1();
            case 2: return this.renderStep2();
            case 3: return this.renderStep3();
            default: return '';
        }
    }

    renderStep1() {
        const personas = [
            {
                id: 'student',
                name: 'Alex Morgan',
                title: 'Alex (Student Profile)',
                badge: 'Stipend & 24h Cooling-Off',
                icon: '🎓',
                desc: 'Stipend budgeting, textbook & campus transit funds, low cognitive load, and 24h deliberation cooling-off buffer on non-essential purchases.'
            },
            {
                id: 'working_professional',
                name: 'Priya Sharma',
                title: 'Priya (Working Professional)',
                badge: 'Zero-Based & Corporate Salary',
                icon: '💼',
                desc: 'Corporate salary, apartment rent, SIP mutual fund tracking, subscription audits, and granular category variance analysis.'
            },
            {
                id: 'elderly_retiree',
                name: 'Eleanor Vance',
                title: 'Eleanor (Senior Citizen)',
                badge: 'Fixed Pension & Senior Accessibility',
                icon: '👵',
                desc: 'Predictable pension, pharmacy prescriptions, doctor consultations, with senior mode (≥52px touch targets, clear high-legibility fonts).'
            },
            {
                id: 'goal_saver',
                name: 'Rohan Mehta',
                title: 'Rohan (Big-Goal Saver)',
                badge: 'Milestones & Delayed Gratification',
                icon: '🎯',
                desc: 'High-income roadmap prioritizing dream home down-payment, travel expeditions, and purchase simulator ETA delay analysis.'
            }
        ];

        return `
            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:12px;">
                Select the preset that aligns with your financial personality. MindWallet adapts its dashboard layout, coach tone, and starter data accordingly.
            </p>
            <div class="persona-grid" role="radiogroup" aria-label="Select persona">
                ${personas.map(p => `
                    <div class="persona-card ${this.selectedPersona === p.id ? 'selected' : ''}" 
                         role="radio" 
                         aria-checked="${this.selectedPersona === p.id}" 
                         tabindex="0"
                         onclick="window.onboarding.selectPersona('${p.id}')"
                         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); window.onboarding.selectPersona('${p.id}');}">
                        <div class="persona-card-title">
                            <span aria-hidden="true">${p.icon}</span>
                            <span>${escapeHtml(p.title)}</span>
                        </div>
                        <div class="persona-card-desc">
                            ${escapeHtml(p.desc)}
                        </div>
                        <span class="status-pill info" style="margin-top:6px; align-self:flex-start;">${escapeHtml(p.badge)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderStep2() {
        return `
            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:14px;">
                Enter your approximate monthly take-home income and preferred currency symbol. These anchor your cashflow calculations and budget limits.
            </p>
            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:18px;">
                <div class="form-group">
                    <label for="onboarding-income" style="font-weight:700; font-size:0.9rem;">Estimated Monthly Income</label>
                    <div style="position:relative; margin-top:6px;">
                        <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-weight:700; color:var(--text); font-size:1.2rem;">${escapeHtml(this.currency)}</span>
                        <input type="number" id="onboarding-income" class="form-control" value="${this.income}" min="1000" step="500" 
                               oninput="window.onboarding.income = Number(this.value)" 
                               style="padding-left:36px; font-size:1.25rem; font-weight:700; height:46px;" />
                    </div>
                    <span style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">(Default for ${escapeHtml(this.selectedPersona)}: ${this.currency}${Number(this.income).toLocaleString()})</span>
                </div>

                <div class="form-group" style="margin-top:16px;">
                    <label for="onboarding-currency" style="font-weight:700; font-size:0.9rem;">Preferred Currency</label>
                    <select id="onboarding-currency" class="form-control" style="height:44px; margin-top:6px;" onchange="window.onboarding.setCurrency(this.value)">
                        <option value="₹" ${this.currency === '₹' ? 'selected' : ''}>₹ INR (Indian Rupee)</option>
                        <option value="$" ${this.currency === '$' ? 'selected' : ''}>$ USD (US Dollar)</option>
                        <option value="€" ${this.currency === '€' ? 'selected' : ''}>€ EUR (Euro)</option>
                        <option value="£" ${this.currency === '£' ? 'selected' : ''}>£ GBP (British Pound)</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderStep3() {
        return `
            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:12px;">
                Configure sensory, cognitive, and visual accommodations. Your preferences survive persona changes.
            </p>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <!-- Dark Mode -->
                <label class="modifier-item" style="cursor:pointer;">
                    <input type="checkbox" id="ob-darkmode" ${this.accessibility.darkMode ? 'checked' : ''} onchange="window.onboarding.accessibility.darkMode = this.checked" />
                    <div>
                        <div class="modifier-label"><span aria-hidden="true">🌙</span> Dark Mode</div>
                        <div class="modifier-desc">Deep navy slate background with high readability text.</div>
                    </div>
                </label>

                <!-- High Contrast -->
                <label class="modifier-item" style="cursor:pointer;">
                    <input type="checkbox" id="ob-contrast" ${this.accessibility.highContrast ? 'checked' : ''} onchange="window.onboarding.accessibility.highContrast = this.checked" />
                    <div>
                        <div class="modifier-label"><span aria-hidden="true">👁️</span> High Contrast (WCAG AAA)</div>
                        <div class="modifier-desc">7:1+ contrast borders, vivid emerald accents, and stark outlines.</div>
                    </div>
                </label>

                <!-- Dyslexia Font -->
                <label class="modifier-item" style="cursor:pointer;">
                    <input type="checkbox" id="ob-dyslexia" ${this.accessibility.dyslexicFont ? 'checked' : ''} onchange="window.onboarding.accessibility.dyslexicFont = this.checked" />
                    <div>
                        <div class="modifier-label"><span aria-hidden="true">📖</span> Dyslexic-Friendly Typography</div>
                        <div class="modifier-desc">Generous letter tracking (0.05em), relaxed line-height, and bottom-weighted glyphs.</div>
                    </div>
                </label>

                <!-- Reduced Motion -->
                <label class="modifier-item" style="cursor:pointer;">
                    <input type="checkbox" id="ob-motion" ${this.accessibility.reducedMotion ? 'checked' : ''} onchange="window.onboarding.accessibility.reducedMotion = this.checked" />
                    <div>
                        <div class="modifier-label"><span aria-hidden="true">⏸️</span> Reduced Motion</div>
                        <div class="modifier-desc">Disables transitions, transforms, and celebratory gauge animations.</div>
                    </div>
                </label>

                <!-- Colorblind Palette Selection -->
                <div style="background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:12px 14px;">
                    <label for="ob-colorblind" style="font-weight:600; font-size:0.88rem; display:flex; align-items:center; gap:6px;">
                        <span aria-hidden="true">🎨</span> Colorblind-Safe Palette
                    </label>
                    <select id="ob-colorblind" class="form-control" style="height:38px; margin-top:6px;" onchange="window.onboarding.accessibility.colorblindMode = this.value">
                        <option value="none" ${this.accessibility.colorblindMode === 'none' ? 'selected' : ''}>Standard (WCAG 2.2 AA)</option>
                        <option value="protanopia" ${this.accessibility.colorblindMode === 'protanopia' ? 'selected' : ''}>Protanopia (Red-Weak: Blue / Amber / Violet)</option>
                        <option value="deuteranopia" ${this.accessibility.colorblindMode === 'deuteranopia' ? 'selected' : ''}>Deuteranopia (Green-Weak: Blue / Amber / Violet)</option>
                        <option value="tritanopia" ${this.accessibility.colorblindMode === 'tritanopia' ? 'selected' : ''}>Tritanopia (Blue-Weak: Teal / Orange / Rose)</option>
                    </select>
                </div>
            </div>
        `;
    }

    selectPersona(id) {
        this.selectedPersona = id;
        const preset = PERSONA_PRESETS[id] || PERSONA_PRESETS.stressed_spender;
        this.income = preset.income || 45000;
        this.currency = preset.currency || '₹';
        this.render();
    }

    setCurrency(curr) {
        this.currency = curr;
        this.render();
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.render();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.render();
        }
    }

    finishWizard() {
        const previousPersona = store.getSettings().persona || 'stressed_spender';
        const newPersona = this.selectedPersona;

        // Apply Persona with starter data & custom overrides preserved
        store.applyPersona(newPersona, {
            lowVision: this.accessibility.highContrast,
            dyslexia: this.accessibility.dyslexicFont,
            colorBlind: this.accessibility.colorblindMode !== 'none'
        });

        // Persist explicit income, currency, and accessibility preferences
        store.updateSettings({
            monthlyIncome: this.income,
            currency: this.currency,
            darkMode: this.accessibility.darkMode,
            highContrast: this.accessibility.highContrast,
            dyslexicFont: this.accessibility.dyslexicFont,
            reducedMotion: this.accessibility.reducedMotion,
            colorblindMode: this.accessibility.colorblindMode,
            modifierDyslexia: this.accessibility.dyslexicFont,
            modifierLowVision: this.accessibility.highContrast,
            modifierColorBlind: this.accessibility.colorblindMode !== 'none'
        });

        store.setCompletedOnboarding(true);
        this.close();

        // Refresh UI
        if (window.app) {
            window.app.applySettings(store.getSettings());
            window.app.renderCurrentView();
            window.app.updateUserProfileUI();
            window.app.updateTopbarPersonaSelect?.();
        }

        // Display "What Changed" Popover
        const changes = this.getChangesDescription(newPersona);
        feedback.showWhatChangedPopover(
            previousPersona.replace('_', ' '),
            newPersona.replace('_', ' '),
            changes,
            () => {
                store.applyPersona(previousPersona, {}, true, true);
                if (window.app) {
                    window.app.applySettings(store.getSettings());
                    window.app.renderCurrentView();
                    window.app.updateUserProfileUI();
                    window.app.updateTopbarPersonaSelect?.();
                    window.app.updateNotificationsUI?.();
                }
                feedback.showToast(`Reverted back to ${previousPersona}.`, 'info');
            }
        );

        feedback.showToast(`Welcome! MindWallet personalized for ${newPersona.replace('_', ' ')}.`, 'success');
    }

    getChangesDescription(persona) {
        const resolved = resolvePersonaKey(persona);
        const changes = [];
        if (resolved === 'student') {
            changes.push('Dashboard configured with "Can I afford this?" impulse check upfront.');
            changes.push('24-hour cooling-off timer enabled for non-essential "Want" purchases.');
            changes.push('Stipend starter records loaded for Alex Morgan with supportive coach guidance.');
        } else if (resolved === 'working_professional') {
            changes.push('Zero-based budgeting layout with granular category variance analysis.');
            changes.push('Detailed category thresholds loaded for Priya Sharma with fast keyboard entry emphasis.');
            changes.push('Analytical coaching tone and investment tracking active.');
        } else if (resolved === 'elderly_retiree') {
            changes.push('Senior mode activated with ≥52px touch targets and enlarged typography.');
            changes.push('Fixed pension pacing, pharmacy sinking fund, and doctor budget loaded for Eleanor Vance.');
            changes.push('Gentle, reassuring coaching guidance active with zero financial jargon.');
        } else if (resolved === 'goal_saver') {
            changes.push('Goal-first dashboard with milestone celebrations and down-payment tracker upfront.');
            changes.push('Expedition and property goals loaded for Rohan Mehta.');
            changes.push('Pre-purchase simulator checks impact on goal completion timeline.');
        } else {
            changes.push('Custom profile configuration applied.');
        }

        if (this.accessibility.darkMode) changes.push('Dark mode theme applied.');
        if (this.accessibility.highContrast) changes.push('High-contrast WCAG AAA borders and colors enabled.');
        if (this.accessibility.dyslexicFont) changes.push('Dyslexia-friendly letter and line spacing applied.');
        if (this.accessibility.reducedMotion) changes.push('Animations and transition motion suppressed.');
        if (this.accessibility.colorblindMode !== 'none') changes.push(`Colorblind-safe palette (${this.accessibility.colorblindMode}) enabled.`);

        return changes;
    }
}

export const onboarding = new OnboardingWizard();
window.onboarding = onboarding;
