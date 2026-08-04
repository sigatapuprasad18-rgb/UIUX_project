/* MindWallet View: Login & Authentication */
import { store } from '../store.js';

export function renderLogin() {
    return `
        <div style="display:flex; justify-content:center; align-items:center; min-height: calc(100vh - 160px); padding:20px;">
            <div class="card" style="width:100%; max-width:460px; padding:36px; box-shadow:var(--shadow-lg); border-radius:var(--radius-lg);">
                <div style="text-align:center; margin-bottom:24px;">
                    <div class="brand-mark" style="width:52px; height:52px; font-size:1.5rem; margin:0 auto 12px; border-radius:14px;">💳</div>
                    <h1 style="font-size:1.6rem; font-weight:700;">Welcome to MindWallet</h1>
                    <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">Money Made Simple. Sign in to manage your wallet.</p>
                </div>

                <!-- Auth Mode Tabs -->
                <div style="display:flex; background:var(--bg); padding:4px; border-radius:10px; margin-bottom:24px;">
                    <button id="tab-login" class="btn btn-sm" style="flex:1; background:var(--surface); color:var(--text); font-weight:600; box-shadow:var(--shadow-sm);" onclick="window.app.switchAuthTab('login')">
                        Sign In
                    </button>
                    <button id="tab-register" class="btn btn-sm" style="flex:1; background:transparent; color:var(--text-muted); font-weight:600;" onclick="window.app.switchAuthTab('register')">
                        Create Account
                    </button>
                </div>

                <!-- Sign In Form -->
                <form id="form-login" onsubmit="window.app.handleLoginSubmit(event)">
                    <div class="form-group">
                        <label for="login-email">Email Address</label>
                        <input type="email" id="login-email" class="form-control" placeholder="peter.parker@midtown.edu" value="peter.parker@midtown.edu" required />
                    </div>

                    <div class="form-group" style="margin-top:16px;">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" class="form-control" placeholder="••••••••" value="password123" required />
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; font-size:0.85rem;">
                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                            <input type="checkbox" checked /> Remember Me
                        </label>
                        <a href="javascript:void(0)" onclick="alert('Demo reset instructions: Click Demo Guest Sign-In below!')" style="color:var(--emerald); font-weight:600;">Forgot Password?</a>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:24px; font-size:1rem; padding:12px;">
                        Sign In →
                    </button>
                </form>

                <!-- Register Form (Hidden by default) -->
                <form id="form-register" style="display:none;" onsubmit="window.app.handleRegisterSubmit(event)">
                    <div class="form-group">
                        <label for="reg-name">Full Name</label>
                        <input type="text" id="reg-name" class="form-control" placeholder="e.g. Peter Parker" required />
                    </div>

                    <div class="form-group" style="margin-top:14px;">
                        <label for="reg-email">Email Address</label>
                        <input type="email" id="reg-email" class="form-control" placeholder="name@domain.com" required />
                    </div>

                    <div class="form-group" style="margin-top:14px;">
                        <label for="reg-role">User Persona / Role</label>
                        <select id="reg-role" class="form-control">
                            <option value="Student">Student</option>
                            <option value="Young Professional">Young Professional</option>
                            <option value="Freelancer">Freelancer</option>
                            <option value="Senior User">Senior User</option>
                        </select>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:24px; font-size:1rem; padding:12px;">
                        Create Account & Enter →
                    </button>
                </form>

                <!-- Quick Demo Access Divider -->
                <div style="position:relative; text-align:center; margin:28px 0 16px;">
                    <hr style="border:none; border-top:1px solid var(--border);" />
                    <span style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:var(--surface); padding:0 12px; font-size:0.78rem; color:var(--text-muted); font-weight:600;">
                        OR EVALUATE DEMO
                    </span>
                </div>

                <button class="btn btn-secondary" style="width:100%; font-size:0.92rem; padding:11px;" onclick="window.app.handleGuestLoginSubmit()">
                    ⚡ 1-Click Demo Guest Sign-In
                </button>
            </div>
        </div>
    `;
}
