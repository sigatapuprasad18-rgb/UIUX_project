/* MindWallet View: Login & Authentication with Distinct Profile Archetype Selection */
import { store, escapeHtml, PERSONA_PRESETS } from '../store.js';

export function renderLogin() {
    const currentSettings = store.getSettings();
    const activePersonaKey = currentSettings.persona || 'student';

    return `
        <div style="display:flex; justify-content:center; align-items:flex-start; min-height: calc(100vh - 120px); padding:24px 16px;">
            <div class="card" style="width:100%; max-width:760px; padding:36px; box-shadow:var(--shadow-modal); border-radius:var(--radius-card);">
                
                <!-- Prototype Header Badge -->
                <div style="background:var(--status-info-bg); border:1px solid var(--status-info-border); padding:10px 14px; border-radius:10px; margin-bottom:24px; display:flex; align-items:center; gap:10px;">
                    <span style="font-size:1.3rem;" aria-hidden="true">ℹ️</span>
                    <div>
                        <div style="font-weight:700; font-size:var(--text-xs); color:var(--status-info-text); text-transform:uppercase; letter-spacing:0.04em;">DEMO EVALUATION PROTOTYPE</div>
                        <div style="font-size:var(--text-xs); color:var(--status-info-text); margin-top:2px;">
                            Client-side prototype with isolated account profiles. Each profile preserves its own transactions, budgets, and goals.
                        </div>
                    </div>
                </div>

                <div style="text-align:center; margin-bottom:24px;">
                    <div class="brand-mark" style="width:52px; height:52px; font-size:1.5rem; margin:0 auto 12px; border-radius:14px;"><span aria-hidden="true">💳</span></div>
                    <h1 style="font-size:1.75rem; font-weight:700;" tabindex="-1">Welcome to MindWallet</h1>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-top:4px;">Select your financial profile archetype to begin</p>
                </div>

                <!-- Profile Archetypes Grid -->
                <div style="margin-bottom:28px;">
                    <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
                        <span>👥</span> Choose User Profile Archetype
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:12px;">
                        
                        <!-- 1. Student Profile -->
                        <div class="card profile-select-card" style="padding:16px; border:2px solid ${activePersonaKey === 'student' ? 'var(--accent)' : 'var(--border)'}; border-radius:12px; background:var(--surface); cursor:pointer; transition:all 0.2s; position:relative;" onclick="window.app.handleQuickPersonaLogin('student')">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-size:2rem;" aria-hidden="true">🎓</span>
                                    <div>
                                        <div style="font-weight:700; font-size:1rem; color:var(--text);">Alex Morgan</div>
                                        <span class="badge" style="font-size:0.7rem; background:var(--status-info-bg); color:var(--status-info-text);">Student Profile</span>
                                    </div>
                                </div>
                                <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">₹18,000/mo</span>
                            </div>
                            <p style="font-size:0.82rem; color:var(--text-muted); margin:10px 0 12px 0; line-height:1.4;">
                                Pocket money, campus cafeteria, textbooks & supplies, and 24h cooling-off buffer on impulse wants.
                            </p>
                            <button type="button" class="btn btn-primary btn-sm" style="width:100%; justify-content:center; font-weight:600;">
                                Log In as Student (Alex) →
                            </button>
                        </div>

                        <!-- 2. Working Professional Profile -->
                        <div class="card profile-select-card" style="padding:16px; border:2px solid ${activePersonaKey === 'working_professional' ? 'var(--accent)' : 'var(--border)'}; border-radius:12px; background:var(--surface); cursor:pointer; transition:all 0.2s;" onclick="window.app.handleQuickPersonaLogin('working_professional')">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-size:2rem;" aria-hidden="true">💼</span>
                                    <div>
                                        <div style="font-weight:700; font-size:1rem; color:var(--text);">Priya Sharma</div>
                                        <span class="badge" style="font-size:0.7rem; background:var(--emerald-light); color:var(--emerald);">Working Professional</span>
                                    </div>
                                </div>
                                <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">₹85,000/mo</span>
                            </div>
                            <p style="font-size:0.82rem; color:var(--text-muted); margin:10px 0 12px 0; line-height:1.4;">
                                Corporate salary, apartment rent, SIP mutual funds, subscription audits & zero-based variance analysis.
                            </p>
                            <button type="button" class="btn btn-outline btn-sm" style="width:100%; justify-content:center; font-weight:600;">
                                Log In as Professional (Priya) →
                            </button>
                        </div>

                        <!-- 3. Senior Citizen / Elderly Profile -->
                        <div class="card profile-select-card" style="padding:16px; border:2px solid ${activePersonaKey === 'elderly_retiree' ? 'var(--accent)' : 'var(--border)'}; border-radius:12px; background:var(--surface); cursor:pointer; transition:all 0.2s;" onclick="window.app.handleQuickPersonaLogin('elderly_retiree')">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-size:2rem;" aria-hidden="true">👵</span>
                                    <div>
                                        <div style="font-weight:700; font-size:1rem; color:var(--text);">Eleanor Vance</div>
                                        <span class="badge" style="font-size:0.7rem; background:var(--orange-light); color:var(--orange);">Senior Citizen / Retiree</span>
                                    </div>
                                </div>
                                <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">₹36,000/mo</span>
                            </div>
                            <p style="font-size:0.82rem; color:var(--text-muted); margin:10px 0 12px 0; line-height:1.4;">
                                Fixed pension, pharmacy prescriptions, doctor consultations, with senior mode (≥52px touch targets).
                            </p>
                            <button type="button" class="btn btn-outline btn-sm" style="width:100%; justify-content:center; font-weight:600;">
                                Log In as Senior (Eleanor) →
                            </button>
                        </div>

                        <!-- 4. Big-Goal Saver Profile -->
                        <div class="card profile-select-card" style="padding:16px; border:2px solid ${activePersonaKey === 'goal_saver' ? 'var(--accent)' : 'var(--border)'}; border-radius:12px; background:var(--surface); cursor:pointer; transition:all 0.2s;" onclick="window.app.handleQuickPersonaLogin('goal_saver')">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-size:2rem;" aria-hidden="true">🎯</span>
                                    <div>
                                        <div style="font-weight:700; font-size:1rem; color:var(--text);">Rohan Mehta</div>
                                        <span class="badge" style="font-size:0.7rem; background:#EAF1FC; color:var(--navy);">Big-Goal Saver</span>
                                    </div>
                                </div>
                                <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">₹110,000/mo</span>
                            </div>
                            <p style="font-size:0.82rem; color:var(--text-muted); margin:10px 0 12px 0; line-height:1.4;">
                                House down-payment, travel expedition milestones, delayed gratification & purchase ETA delay simulator.
                            </p>
                            <button type="button" class="btn btn-outline btn-sm" style="width:100%; justify-content:center; font-weight:600;">
                                Log In as Saver (Rohan) →
                            </button>
                        </div>

                    </div>
                </div>

                <!-- Custom Sign In / Registration Options -->
                <div style="border-top:1px solid var(--border); padding-top:24px;">
                    <!-- Auth Mode Tabs -->
                    <div role="tablist" aria-label="Sign in or register" style="display:flex; background:var(--bg); padding:4px; border-radius:10px; margin-bottom:20px; border:1px solid var(--border); max-width:320px; margin-left:auto; margin-right:auto;">
                        <button id="tab-login" role="tab" aria-selected="true" aria-controls="form-login" tabindex="0" class="btn btn-sm" style="flex:1; background:var(--surface); color:var(--text); font-weight:700; box-shadow:var(--shadow-sm);" onclick="window.app.switchAuthTab('login')">
                            Custom Sign In
                        </button>
                        <button id="tab-register" role="tab" aria-selected="false" aria-controls="form-register" tabindex="-1" class="btn btn-sm" style="flex:1; background:transparent; color:var(--text-muted); font-weight:600;" onclick="window.app.switchAuthTab('register')">
                            Create Account
                        </button>
                    </div>

                    <!-- Inline Form Feedback / Alert Area -->
                    <div id="auth-alert" role="alert" aria-live="polite" style="display:none; padding:10px 14px; border-radius:8px; margin-bottom:16px; font-size:0.88rem; font-weight:600;"></div>

                    <!-- Sign In Form -->
                    <form id="form-login" role="tabpanel" aria-labelledby="tab-login" onsubmit="window.app.handleLoginSubmit(event)" novalidate style="max-width:480px; margin:0 auto;">
                        <div class="form-group" style="margin-bottom:14px;">
                            <label for="login-persona">Choose Profile Archetype to Sign In As</label>
                            <select id="login-persona" class="form-control" onchange="window.app.onLoginPersonaSelect(this.value)">
                                <option value="student">🎓 Alex Morgan — Student Profile (Stipend ₹18k, 24h Cooling-Off)</option>
                                <option value="working_professional">💼 Priya Sharma — Working Professional (Salary ₹85k, Zero-Based)</option>
                                <option value="elderly_retiree">👵 Eleanor Vance — Senior Citizen / Retiree (Pension ₹36k, Senior Mode)</option>
                                <option value="goal_saver">🎯 Rohan Mehta — Big-Goal Saver (Salary ₹110k, Milestones)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="login-email">Email Address <span style="color:var(--status-critical-text);">*</span></label>
                            <input type="email" id="login-email" class="form-control" autocomplete="email" placeholder="alex@mindwallet.local" value="alex@mindwallet.local" required />
                        </div>

                        <div class="form-group" style="margin-top:14px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label for="login-password">Password <span style="color:var(--status-critical-text);">*</span></label>
                                <button type="button" class="btn btn-ghost btn-sm" id="btnTogglePassword" onclick="window.app.togglePasswordVisibility('login-password', this)" style="padding:2px 8px; font-size:0.75rem; color:var(--text-muted); min-height:32px;" aria-label="Show password">
                                    <span aria-hidden="true">👁️</span> <span>Show</span>
                                </button>
                            </div>
                            <input type="password" id="login-password" class="form-control" autocomplete="current-password" placeholder="••••••••" value="demo123" required />
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; font-size:0.85rem;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                                <input type="checkbox" id="login-remember" checked /> Remember Me
                            </label>
                            <a href="javascript:void(0)" onclick="window.app ? window.app.toast('Demo Hint: Password can be anything (e.g. demo123)!', 'info') : null" style="color:var(--accent); font-weight:600;">Forgot Password?</a>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:20px; font-size:1rem; padding:12px;">
                            Sign In with Selected Profile →
                        </button>
                    </form>

                    <!-- Register Form (Hidden by default) -->
                    <form id="form-register" role="tabpanel" aria-labelledby="tab-register" style="display:none; max-width:480px; margin:0 auto;" onsubmit="window.app.handleRegisterSubmit(event)" novalidate>
                        <div class="form-group">
                            <label for="reg-name">Full Name <span style="color:var(--status-critical-text);">*</span></label>
                            <input type="text" id="reg-name" class="form-control" autocomplete="name" placeholder="e.g. Alex Morgan" required />
                        </div>

                        <div class="form-group" style="margin-top:12px;">
                            <label for="reg-email">Email Address <span style="color:var(--status-critical-text);">*</span></label>
                            <input type="email" id="reg-email" class="form-control" autocomplete="email" placeholder="alex@mindwallet.local" required />
                        </div>

                        <div class="form-group" style="margin-top:12px;">
                            <label for="reg-role">Choose Profile Archetype *</label>
                            <select id="reg-role" class="form-control">
                                <option value="student">🎓 Alex Morgan — Student (Stipend ₹18k, 24h Cooling-Off)</option>
                                <option value="working_professional">💼 Priya Sharma — Working Professional (Salary ₹85k, Zero-Based)</option>
                                <option value="elderly_retiree">👵 Eleanor Vance — Senior Citizen / Retiree (Pension ₹36k, Senior Mode)</option>
                                <option value="goal_saver">🎯 Rohan Mehta — Big-Goal Saver (Salary ₹110k, Milestones)</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:20px; font-size:1rem; padding:12px;">
                            Create Account & Personalize →
                        </button>
                    </form>
                </div>

            </div>
        </div>
    `;
}
