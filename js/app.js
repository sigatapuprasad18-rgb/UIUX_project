/* MindWallet — Main Application Controller & Router */
import { store, escapeHtml, CATEGORY_ICONS } from './store.js';
import { api } from './api.js';
import { feedback } from './ui/feedback.js';
import { onboarding } from './ui/onboarding.js';
import { coach } from './ui/coach.js';

import { renderDashboard } from './views/dashboard.js';
import { renderActivity } from './views/activity.js';
import { renderPlan } from './views/plan.js';
import { renderInsights } from './views/insights.js';
import { renderSettings } from './views/settings.js';
import { renderLogin } from './views/login.js';
import { renderTxRows, filterAndSortTransactions } from './views/transactions.js';

class App {
    constructor() {
        const isSessionActive = sessionStorage.getItem('mindwallet_session_active') === 'true';
        this.currentView = (isSessionActive && store.getCurrentUser()) ? 'dashboard' : 'login';
        this.activeSubTab = {
            activity: 'transactions',
            plan: 'budget',
            insights: 'health'
        };
        this.txFilterState = {
            search: '',
            category: 'all',
            type: 'all',
            dateRange: 'all',
            necessity: 'all',
            sortBy: 'date',
            sortOrder: 'desc'
        };
        this.selectedReportMonth = null;
        this.activeModal = null;
        this.previousActiveElement = null;
        window.app = this;
        this.init();
    }

    init() {
        // Enforce default opening page: Must sign in & set up profile persona before accessing dashboard
        const isSessionActive = sessionStorage.getItem('mindwallet_session_active') === 'true';
        if (!isSessionActive || !store.getCurrentUser()) {
            store.logout();
            sessionStorage.removeItem('mindwallet_session_active');
            if (window.location.hash !== '#login') {
                window.location.hash = '#login';
            }
        }

        this.setupRouter();
        this.setupAccessibilityPanel();
        this.setupProfilePanel();
        this.setupDbSyncUI();
        this.setupGlobalEvents();
        this.setupGlobalSearch();
        this.updateNotificationsUI();
        this.applySettings(store.getSettings());
        this.updateUserProfileUI();
        this.updateTopbarPersonaSelect();
        this.updateSidebarA11y();
        window.addEventListener('resize', () => this.updateSidebarA11y());

        // Perform initial cloud sync only if authenticated
        if (store.getCurrentUser() && sessionStorage.getItem('mindwallet_session_active') === 'true') {
            store.syncWithCloud().then(synced => {
                if (synced) {
                    this.renderCurrentView();
                    this.updateNotificationsUI();
                }
            });
        }

        // First-visit interactive onboarding wizard (only if authenticated)
        if (!store.hasCompletedOnboarding() && store.getCurrentUser() && sessionStorage.getItem('mindwallet_session_active') === 'true') {
            setTimeout(() => {
                onboarding.open(1);
            }, 600);
        }

        // Check for urgent ASAP notifications only (suppress non-urgent popups so user isn't bombarded)
        setTimeout(() => {
            this.checkAndShowUrgentNotification();
        }, 800);
    }

    setupRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        const isSessionActive = sessionStorage.getItem('mindwallet_session_active') === 'true';
        const user = store.getCurrentUser();
        const isAuthenticated = !!(user && isSessionActive);

        const rawHash = window.location.hash.replace('#', '');

        // Route Gatekeeper: If unauthenticated, lock down ALL pages to #login
        if (!isAuthenticated) {
            this.currentView = 'login';
            if (window.location.hash !== '#login') {
                window.location.hash = '#login';
                return;
            }
            this.renderCurrentView();
            this.updateActiveNav('login');
            this.updateUserProfileUI();
            this.updateNotificationsUI();
            document.title = 'Sign In & Profile Setup — MindWallet';
            const content = document.getElementById('app-content');
            if (content) {
                const heading = content.querySelector('h1');
                if (heading) heading.focus();
            }
            return;
        }

        // Authenticated: default empty hash or #login redirects straight to dashboard
        if (!rawHash || rawHash === 'login') {
            this.currentView = 'dashboard';
            window.location.hash = '#dashboard';
            return;
        }

        // Map sub-routes / backward-compatible deep links to parent views & active sub-tabs
        let parentView = 'dashboard';
        let subTab = null;

        if (rawHash === 'settings') {
            parentView = 'settings';
        } else if (rawHash === 'activity' || rawHash === 'transactions' || rawHash === 'reports') {
            parentView = 'activity';
            subTab = rawHash === 'reports' ? 'reports' : (rawHash === 'transactions' ? 'transactions' : (this.activeSubTab.activity || 'transactions'));
            this.activeSubTab.activity = subTab;
        } else if (rawHash === 'plan' || rawHash === 'budget' || rawHash === 'savings' || rawHash === 'subscriptions') {
            parentView = 'plan';
            subTab = (rawHash === 'savings' || rawHash === 'subscriptions') ? rawHash : (rawHash === 'budget' ? 'budget' : (this.activeSubTab.plan || 'budget'));
            this.activeSubTab.plan = subTab;
        } else if (rawHash === 'insights' || rawHash === 'health' || rawHash === 'analytics' || rawHash === 'nudges' || rawHash === 'simulator') {
            parentView = 'insights';
            subTab = (rawHash === 'analytics' || rawHash === 'nudges' || rawHash === 'simulator') ? rawHash : (rawHash === 'health' ? 'health' : (this.activeSubTab.insights || 'health'));
            this.activeSubTab.insights = subTab;
        } else {
            parentView = 'dashboard';
        }

        this.currentView = parentView;
        this.renderCurrentView();
        this.updateActiveNav(parentView);
        this.updateUserProfileUI();
        this.updateNotificationsUI();

        const viewTitles = {
            dashboard: 'Overview Dashboard',
            activity: subTab === 'reports' ? 'Monthly Financial Statement' : 'Income & Expense Tracker',
            plan: subTab === 'savings' ? 'Savings Goals' : (subTab === 'subscriptions' ? 'Subscription Manager' : 'Budget Planner'),
            insights: subTab === 'analytics' ? 'Analytics & Trends' : (subTab === 'simulator' ? 'Purchase Simulator' : (subTab === 'nudges' ? 'Smart Insights' : 'Financial Health Score')),
            settings: 'Settings & Personas',
            login: 'Sign In & Profile Setup'
        };
        const titleName = viewTitles[parentView] || 'Overview Dashboard';
        document.title = `${titleName} — MindWallet`;

        // Move programmatic focus to new view's <h1> for screen reader announcements
        const content = document.getElementById('app-content');
        if (content) {
            const h1 = content.querySelector('h1');
            if (h1) {
                h1.setAttribute('tabindex', '-1');
                h1.focus();
            }
        }

        // Manage floating notifications based on view
        if (parentView === 'login') {
            coach.clearAll();
            feedback.clearFloatingFeedback();
        }
    }

    switchSubTab(view, tab) {
        if (this.activeSubTab[view] !== undefined) {
            this.activeSubTab[view] = tab;
        }
        window.location.hash = `#${tab}`;
    }

    updateActiveNav(parentView) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${parentView}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });

        // Close mobile drawer on route change
        const sidebar = document.getElementById('sidebar');
        if (sidebar?.classList.contains('open')) {
            sidebar.classList.remove('open');
            this.updateSidebarA11y(false);
        }
    }

    updateSidebarA11y(isOpen) {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        if (!sidebar) return;

        const isSessionActive = sessionStorage.getItem('mindwallet_session_active') === 'true';
        const user = store.getCurrentUser();
        if (!user || !isSessionActive) {
            sidebar.setAttribute('inert', '');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            return;
        }

        const isMobile = window.innerWidth <= 992;
        if (isOpen === undefined) {
            isOpen = sidebar.classList.contains('open');
        }

        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }

        if (isMobile) {
            if (isOpen) {
                sidebar.removeAttribute('inert');
            } else {
                sidebar.setAttribute('inert', '');
            }
        } else {
            sidebar.removeAttribute('inert');
        }
    }

    updateUserProfileUI() {
        const isSessionActive = sessionStorage.getItem('mindwallet_session_active') === 'true';
        const user = store.getCurrentUser();
        const isAuthenticated = !!(user && isSessionActive);
        const body = document.body;

        if (isAuthenticated) {
            body.classList.remove('logged-out');
            const userBtn = document.getElementById('userProfileBtn');
            const badge = document.getElementById('userAvatarBadge');
            const nameLabel = document.getElementById('userNameLabel');
            const dropBadge = document.getElementById('dropdownAvatarBadge');
            const dropName = document.getElementById('dropdownUserName');
            const dropRole = document.getElementById('dropdownUserRole');

            if (userBtn) userBtn.style.display = 'flex';
            if (badge) badge.innerText = user.avatar || 'AM';
            if (nameLabel) nameLabel.innerText = user.name;
            if (dropBadge) dropBadge.innerText = user.avatar || 'AM';
            if (dropName) dropName.innerText = user.name;
            if (dropRole) dropRole.innerText = user.role || 'Member';
        } else {
            body.classList.add('logged-out');
            document.getElementById('notifDrawer')?.classList.remove('open');
            document.getElementById('profilePanel')?.classList.remove('open');
            document.getElementById('a11yPanel')?.classList.remove('open');
            this.updateSidebarA11y();
        }
    }

    renderCurrentView() {
        const content = document.getElementById('app-content');
        if (!content) return;

        const isSessionActive = sessionStorage.getItem('mindwallet_session_active') === 'true';
        const user = store.getCurrentUser();
        if (!user || !isSessionActive || this.currentView === 'login') {
            content.innerHTML = renderLogin();
            window.scrollTo(0, 0);
            return;
        }

        switch (this.currentView) {
            case 'dashboard': 
                content.innerHTML = renderDashboard(); 
                break;
            case 'activity': 
                content.innerHTML = renderActivity(this.activeSubTab.activity, this.selectedReportMonth); 
                break;
            case 'plan': 
                content.innerHTML = renderPlan(this.activeSubTab.plan); 
                break;
            case 'insights': 
                content.innerHTML = renderInsights(this.activeSubTab.insights, this.selectedReportMonth); 
                break;
            case 'settings': 
                content.innerHTML = renderSettings(); 
                break;
            default: 
                content.innerHTML = renderDashboard(); 
                break;
        }

        window.scrollTo(0, 0);
    }

    // --- Settings & Accessibility Controls ---
    setupAccessibilityPanel() {
        const a11yBtn = document.getElementById('a11yBtn');
        const a11yPanel = document.getElementById('a11yPanel');

        if (a11yBtn && a11yPanel) {
            a11yBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = a11yPanel.classList.toggle('open');
                a11yBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            document.addEventListener('click', (e) => {
                if (!a11yPanel.contains(e.target) && e.target !== a11yBtn) {
                    if (a11yPanel.classList.contains('open')) {
                        a11yPanel.classList.remove('open');
                        a11yBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }

        // Toolbar Button Bindings
        document.getElementById('toggleDarkMode')?.addEventListener('click', () => {
            const s = store.getSettings();
            store.updateSettings({ darkMode: !s.darkMode });
            this.applySettings(store.getSettings());
            feedback.showToast(`Dark Mode ${!s.darkMode ? 'Enabled' : 'Disabled'}`);
        });

        document.getElementById('toggleContrast')?.addEventListener('click', () => {
            const s = store.getSettings();
            store.updateSettings({ highContrast: !s.highContrast });
            this.applySettings(store.getSettings());
            feedback.showToast(`High Contrast ${!s.highContrast ? 'Enabled' : 'Disabled'}`);
        });

        document.getElementById('toggleDyslexicFont')?.addEventListener('click', () => {
            const s = store.getSettings();
            store.updateSettings({ dyslexicFont: !s.dyslexicFont });
            this.applySettings(store.getSettings());
            feedback.showToast(`Dyslexia Font ${!s.dyslexicFont ? 'Enabled' : 'Disabled'}`);
        });

        document.getElementById('toggleMotion')?.addEventListener('click', () => {
            const s = store.getSettings();
            store.updateSettings({ reducedMotion: !s.reducedMotion });
            this.applySettings(store.getSettings());
            feedback.showToast(`Reduced Motion ${!s.reducedMotion ? 'Enabled' : 'Disabled'}`);
        });

        document.getElementById('fontUp')?.addEventListener('click', () => this.adjustFontSize(1));
        document.getElementById('fontDown')?.addEventListener('click', () => this.adjustFontSize(-1));
        document.getElementById('fontReset')?.addEventListener('click', () => this.resetFontSize());

        document.getElementById('modeSelect')?.addEventListener('change', (e) => {
            this.setMode(e.target.value);
        });
    }

    adjustFontSize(delta) {
        const s = store.getSettings();
        const newStep = Math.max(-2, Math.min(4, (s.fontSizeStep || 0) + delta));
        store.updateSettings({ fontSizeStep: newStep });
        this.applySettings(store.getSettings());
        feedback.showToast(`Text Size: ${100 + newStep * 12.5}%`);
    }

    resetFontSize() {
        store.updateSettings({ fontSizeStep: 0 });
        this.applySettings(store.getSettings());
        feedback.showToast('Font size reset to default (100%)');
    }

    toggleDarkMode() {
        const s = store.getSettings();
        const val = !s.darkMode;
        store.updateSettings({ darkMode: val });
        this.applySettings(store.getSettings());
        this.renderCurrentView();
        feedback.showToast(`Dark Mode ${val ? 'Activated' : 'Turned Off'}`);
    }

    setMode(mode) {
        let highContrast = false;
        let fontSizeStep = 0;

        if (mode === 'accessible') {
            highContrast = true;
            fontSizeStep = 1;
        } else if (mode === 'senior') {
            fontSizeStep = 2;
        }

        store.updateSettings({ mode, highContrast, fontSizeStep });
        this.applySettings(store.getSettings());
        feedback.showToast(`Mode: ${mode.toUpperCase()}`);
    }

    updateTopbarPersonaSelect() {
        const topbarSelect = document.getElementById('topbarPersonaSelect');
        if (topbarSelect) {
            topbarSelect.value = store.getSettings().persona || 'student';
        }
    }

    openProfileSwitcherModal() {
        this.openModal('modal-profile-switcher');
    }

    switchProfile(personaKey) {
        this.closeModal();
        this.handlePersonaChange(personaKey);
    }

    handlePersonaChange(personaKey) {
        const previousPersona = store.getSettings().persona || 'student';
        if (previousPersona === personaKey) return;

        store.applyPersona(personaKey);

        this.applySettings(store.getSettings());
        this.renderCurrentView();
        this.updateUserProfileUI();
        this.updateTopbarPersonaSelect();
        this.updateNotificationsUI();

        const currentUser = store.getCurrentUser();
        const previousPreset = store.PERSONA_PRESETS?.[previousPersona] || { name: previousPersona.replace('_', ' ') };

        const revertProfile = () => {
            store.applyPersona(previousPersona, {}, true, true);
            this.applySettings(store.getSettings());
            this.renderCurrentView();
            this.updateUserProfileUI();
            this.updateTopbarPersonaSelect();
            this.updateNotificationsUI();
            coach.clearAll();
            feedback.showToast(`Reverted back to profile: ${previousPreset.name}.`, 'info');
        };

        coach.clearAll();
        feedback.clearFloatingFeedback();

        // Consolidated, non-intrusive feedback card that explains adaptations and provides Undo
        const changes = onboarding.getChangesDescription(personaKey);
        coach.onPersonaChanged(
            previousPreset.name || previousPersona.replace('_', ' '),
            currentUser?.name || personaKey.replace('_', ' '),
            changes,
            revertProfile
        );
    }

    handleCurrencyChange(curr) {
        store.updateSettings({ currency: curr });
        this.renderCurrentView();
        feedback.showToast(`Currency set to ${curr}`);
    }

    handleIncomeChange(amt) {
        const num = Number(amt);
        if (!isNaN(num) && num > 0) {
            store.updateSettings({ monthlyIncome: num });
            this.renderCurrentView();
            feedback.showToast('Monthly income baseline updated');
        }
    }

    handleColorblindChange(val) {
        store.updateSettings({ colorblindMode: val, modifierColorBlind: val !== 'none' });
        this.applySettings(store.getSettings());
        this.renderCurrentView();
        feedback.showToast(`Colorblind palette updated: ${val}`);
    }

    toggleDarkMode() {
        const s = store.getSettings();
        const nextState = !s.darkMode;
        store.updateSettings({ darkMode: nextState });
        this.applySettings(store.getSettings());
        this.renderCurrentView();
        feedback.showToast(`Dark Mode ${nextState ? 'Enabled' : 'Disabled'}`);
    }

    handleModifierToggle(key, isChecked) {
        store.updateSettings({ [key]: isChecked });
        this.applySettings(store.getSettings());
        this.renderCurrentView();
        feedback.showToast(`Preference updated: ${isChecked ? 'Enabled' : 'Disabled'}`);
    }

    applySettings(s) {
        const body = document.body;
        body.classList.remove(
            'high-contrast', 'reduced-motion', 'senior', 'simplified', 'dark-mode',
            'dyslexic-font', 'modifier-dyslexia', 'modifier-low-vision', 'modifier-color-blind', 
            'modifier-motor', 'modifier-cognitive', 'modifier-screen-reader',
            'colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia'
        );

        if (s.darkMode) body.classList.add('dark-mode');
        if (s.highContrast || s.modifierLowVision) body.classList.add('high-contrast', 'modifier-low-vision');
        if (s.dyslexicFont || s.modifierDyslexia) body.classList.add('dyslexic-font', 'modifier-dyslexia');
        if (s.reducedMotion) {
            body.classList.add('reduced-motion');
            document.documentElement.style.scrollBehavior = 'auto';
        } else {
            document.documentElement.style.scrollBehavior = '';
        }

        // Colorblind palette
        if (s.colorblindMode && s.colorblindMode !== 'none') {
            body.classList.add(`colorblind-${s.colorblindMode}`);
        } else if (s.modifierColorBlind) {
            body.classList.add('colorblind-deuteranopia');
        }

        if (s.mode === 'senior') body.classList.add('senior', 'simplified');
        if (s.mode === 'simplified') body.classList.add('simplified');

        // Accessibility Modifier classes
        if (s.modifierMotor) body.classList.add('modifier-motor');
        if (s.modifierCognitive) body.classList.add('modifier-cognitive');
        if (s.modifierScreenReader) body.classList.add('modifier-screen-reader');

        // Font scaling
        let scalePct = 100 + (s.fontSizeStep || 0) * 12.5;
        if (s.mode === 'senior' && (s.fontSizeStep === 0 || s.fontSizeStep === undefined || s.fontSizeStep === 2)) {
            scalePct = 125;
        }
        document.documentElement.style.fontSize = `${scalePct}%`;

        const darkBtn = document.getElementById('toggleDarkMode');
        if (darkBtn) darkBtn.setAttribute('aria-pressed', s.darkMode ? 'true' : 'false');

        const contrastBtn = document.getElementById('toggleContrast');
        if (contrastBtn) contrastBtn.setAttribute('aria-pressed', (s.highContrast || s.modifierLowVision) ? 'true' : 'false');

        const dyslexiaBtn = document.getElementById('toggleDyslexicFont');
        if (dyslexiaBtn) dyslexiaBtn.setAttribute('aria-pressed', (s.dyslexicFont || s.modifierDyslexia) ? 'true' : 'false');

        const motionBtn = document.getElementById('toggleMotion');
        if (motionBtn) motionBtn.setAttribute('aria-pressed', s.reducedMotion ? 'true' : 'false');

        this.updateTopbarPersonaSelect();
    }

    setupGlobalEvents() {
        // Mobile sidebar toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                const open = sidebar.classList.toggle('open');
                this.updateSidebarA11y(open);
                if (open) {
                    const firstLink = sidebar.querySelector('a, button');
                    if (firstLink) firstLink.focus();
                }
            });
        }

        // Close sidebar on click outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle?.contains(e.target)) {
                sidebar.classList.remove('open');
                this.updateSidebarA11y(false);
            }
        });

        // Notifications drawer toggle
        const notifBtn = document.getElementById('notifBtn');
        const notifDrawer = document.getElementById('notifDrawer');
        if (notifBtn && notifDrawer) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = notifDrawer.classList.toggle('open');
                notifBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            document.addEventListener('click', (e) => {
                if (!notifDrawer.contains(e.target) && e.target !== notifBtn) {
                    if (notifDrawer.classList.contains('open')) {
                        notifDrawer.classList.remove('open');
                        notifBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }

        document.getElementById('markAllNotifsReadBtn')?.addEventListener('click', () => {
            store.markAllNotificationsRead();
            this.updateNotificationsUI();
            feedback.showToast('All notifications marked as read', 'info');
        });

        // Quick Add Floating Action Button
        document.getElementById('fabQuickAdd')?.addEventListener('click', () => {
            this.openQuickAdd();
        });

        // Quick Add Type Segmented Toggle
        const quickExpenseBtn = document.getElementById('quick-type-expense');
        const quickIncomeBtn = document.getElementById('quick-type-income');
        const quickTypeInput = document.getElementById('quick-add-type');
        if (quickExpenseBtn && quickIncomeBtn && quickTypeInput) {
            quickExpenseBtn.addEventListener('click', () => {
                quickTypeInput.value = 'expense';
                quickExpenseBtn.classList.add('active');
                quickIncomeBtn.classList.remove('active');
            });
            quickIncomeBtn.addEventListener('click', () => {
                quickTypeInput.value = 'income';
                quickIncomeBtn.classList.add('active');
                quickExpenseBtn.classList.remove('active');
            });
        }

        // Global keydown: Escape & Focus Trap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.activeModal) {
                    if (this.activeModal.id === 'modal-action-dialog') {
                        feedback.closeDialog();
                    } else if (this.activeModal.id === 'modal-onboarding') {
                        onboarding.close();
                    } else {
                        this.closeModal();
                    }
                    return;
                }
                const a11yPanel = document.getElementById('a11yPanel');
                if (a11yPanel?.classList.contains('open')) {
                    a11yPanel.classList.remove('open');
                    document.getElementById('a11yBtn')?.focus();
                    return;
                }
                const notifDrawer = document.getElementById('notifDrawer');
                if (notifDrawer?.classList.contains('open')) {
                    notifDrawer.classList.remove('open');
                    document.getElementById('notifBtn')?.focus();
                    return;
                }
                const profilePanel = document.getElementById('profilePanel');
                if (profilePanel?.classList.contains('open')) {
                    profilePanel.classList.remove('open');
                    document.getElementById('userProfileBtn')?.focus();
                    return;
                }
                const sidebar = document.getElementById('sidebar');
                if (sidebar?.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    this.updateSidebarA11y(false);
                    document.getElementById('menuToggle')?.focus();
                    return;
                }
            }

            // Modal Focus Trap
            if (e.key === 'Tab' && this.activeModal) {
                const focusables = Array.from(this.activeModal.querySelectorAll('button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Action delegation for data buttons in views
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;
            const action = actionBtn.getAttribute('data-action');
            if (action === 'delete-transaction') {
                const id = actionBtn.getAttribute('data-id');
                if (id) this.deleteTransaction(id);
            } else if (action === 'quick-set-budget') {
                const cat = actionBtn.getAttribute('data-category');
                const limit = Number(actionBtn.getAttribute('data-limit'));
                if (cat) this.quickSetBudget(cat, limit);
            } else if (action === 'deposit-goal') {
                const id = actionBtn.getAttribute('data-id');
                const name = actionBtn.getAttribute('data-name');
                if (id) this.depositGoal(id, name);
            } else if (action === 'delete-subscription') {
                const id = actionBtn.getAttribute('data-id');
                const name = actionBtn.getAttribute('data-name');
                const amount = Number(actionBtn.getAttribute('data-amount'));
                if (id) this.deleteSubscription(id, name, amount);
            }
        });
    }

    // --- Modal Management with Focus Restoration ---
    openModal(modalId) {
        this.previousActiveElement = document.activeElement;
        const modal = document.getElementById(modalId) || document.getElementById(`modal-${modalId}`);
        if (modal) {
            modal.querySelectorAll('[role="alert"]').forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            modal.classList.add('open');
            this.activeModal = modal;
            const focusables = modal.querySelectorAll('input:not([type="hidden"]), select, textarea, button');
            if (focusables.length) {
                setTimeout(() => focusables[0].focus(), 50);
            }
        }
    }

    // --- Quick Add & Dashboard Disclosure Handlers ---
    openQuickAdd() {
        const dateInput = document.getElementById('quick-add-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        const amtInput = document.getElementById('quick-add-amount');
        if (amtInput) amtInput.value = '';
        const merchInput = document.getElementById('quick-add-merchant');
        if (merchInput) merchInput.value = '';
        const errEl = document.getElementById('quick-add-error');
        if (errEl) errEl.style.display = 'none';

        // Reset type toggle to expense default
        const typeInput = document.getElementById('quick-add-type');
        if (typeInput) typeInput.value = 'expense';
        document.getElementById('quick-type-expense')?.classList.add('active');
        document.getElementById('quick-type-income')?.classList.remove('active');

        this.openModal('sheet-quick-add');
        setTimeout(() => {
            amtInput?.focus();
        }, 60);
    }

    handleQuickAddTransaction(e) {
        e.preventDefault();
        const errEl = document.getElementById('quick-add-error');
        const amount = Number(document.getElementById('quick-add-amount')?.value);
        const category = document.getElementById('quick-add-category')?.value || 'Other';
        const type = document.getElementById('quick-add-type')?.value || 'expense';
        let merchant = document.getElementById('quick-add-merchant')?.value?.trim();
        const date = document.getElementById('quick-add-date')?.value || new Date().toISOString().split('T')[0];

        if (isNaN(amount) || amount <= 0) {
            if (errEl) {
                errEl.textContent = 'Please enter a valid amount greater than ₹0.';
                errEl.style.display = 'block';
            }
            document.getElementById('quick-add-amount')?.focus();
            return;
        }

        if (!merchant) {
            merchant = category;
        }

        if (errEl) errEl.style.display = 'none';

        const newTx = {
            merchant,
            category,
            amount,
            type,
            date,
            icon: CATEGORY_ICONS[category] || '⚡',
            iconBg: type === 'income' ? '#EAF1FC' : '#F4F6F8',
            iconColor: type === 'income' ? 'var(--navy)' : 'var(--text)'
        };

        this.processTransactionAdd(newTx);
    }

    processTransactionAdd(txData) {
        const category = txData.category || 'Other';
        const beforeHealth = store.getFinancialHealthScore().overall;
        const budgets = store.getBudgets();
        const catBudget = budgets.find(b => (b.category || '').toLowerCase() === category.toLowerCase()) || { limit: 10000 };
        const monthTxsBefore = store.getMonthTransactions();
        const beforeSpent = monthTxsBefore
            .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === category.toLowerCase())
            .reduce((s, t) => s + Number(t.amount), 0);
        const beforeCatPct = Math.round((beforeSpent / catBudget.limit) * 100);

        const newTx = store.addTransaction(txData);

        this.closeModal();
        this.renderCurrentView();
        this.updateNotificationsUI();

        const afterHealth = store.getFinancialHealthScore().overall;
        const monthTxsAfter = store.getMonthTransactions();
        const afterSpent = monthTxsAfter
            .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === category.toLowerCase())
            .reduce((s, t) => s + Number(t.amount), 0);
        const afterCatPct = Math.round((afterSpent / catBudget.limit) * 100);

        coach.onTransactionAdded(newTx, {
            health: beforeHealth,
            catPct: beforeCatPct,
            catSpent: beforeSpent,
            catLimit: catBudget.limit
        }, {
            health: afterHealth,
            catPct: afterCatPct,
            catSpent: afterSpent,
            catLimit: catBudget.limit
        });

        return newTx;
    }

    toggleDashboardDetails(targetId, btn) {
        const target = document.getElementById(targetId);
        if (!target) return;
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        const nextState = !isExpanded;
        btn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
        target.style.display = nextState ? 'block' : 'none';
        const spanText = btn.querySelector('span:first-child');
        if (spanText) {
            spanText.textContent = nextState ? 'Hide score factors' : 'Show score factors';
        }
    }

    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
        this.activeModal = null;
        if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
            this.previousActiveElement.focus();
            this.previousActiveElement = null;
        }
    }

    // --- MongoDB Atlas Cloud Database Integration ---
    setupDbSyncUI() {
        const btn = document.getElementById('dbSyncBtn');
        const dot = document.getElementById('dbSyncDot');
        const lbl = document.getElementById('dbSyncLabel');

        api.onStatusChange(status => {
            if (btn && dot && lbl) {
                if (status.isConnected) {
                    btn.classList.add('connected');
                    btn.classList.remove('offline');
                    btn.setAttribute('title', `MongoDB Atlas: Connected (${status.database || 'mindwallet'})`);
                    lbl.textContent = 'MongoDB Atlas';
                } else {
                    btn.classList.add('offline');
                    btn.classList.remove('connected');
                    btn.setAttribute('title', 'MongoDB Atlas: Offline (LocalStorage Active)');
                    lbl.textContent = 'Local Mode';
                }
            }
        });

        if (btn) {
            btn.addEventListener('click', () => {
                this.openDbModal();
            });
        }
    }

    async openDbModal() {
        const modal = document.getElementById('modal-db-sync');
        if (!modal) return;

        this.previousActiveElement = document.activeElement;
        modal.classList.add('open');
        this.activeModal = modal;

        // Fetch fresh health info from MongoDB Atlas
        const health = await api.checkHealth();
        const dot = document.getElementById('dbModalDot');
        const text = document.getElementById('dbModalStatusText');
        const cluster = document.getElementById('dbModalClusterName');
        const desc = document.getElementById('dbModalDesc');
        const usersEl = document.getElementById('dbStatUsers');
        const txsEl = document.getElementById('dbStatTxs');
        const budgetsEl = document.getElementById('dbStatBudgets');
        const goalsEl = document.getElementById('dbStatGoals');
        const latencyEl = document.getElementById('dbSyncLatency');

        if (health && health.database?.connected) {
            if (dot) dot.className = 'db-sync-dot connected';
            if (text) text.textContent = 'Connected & Operational';
            if (cluster) cluster.textContent = `${health.database.database} (Atlas)`;
            if (desc) desc.textContent = 'MindWallet is synced with your MongoDB Atlas cloud database. All actions persist across devices and browsers.';
            const counts = health.database.counts || {};
            if (usersEl) usersEl.textContent = counts.users || '4';
            if (txsEl) txsEl.textContent = counts.transactions || store.getTransactions().length;
            if (budgetsEl) budgetsEl.textContent = counts.budgets || store.getBudgets().length;
            if (goalsEl) goalsEl.textContent = counts.goals || store.getGoals().length;
            if (latencyEl) latencyEl.textContent = 'Connected (Cloud)';
        } else {
            if (dot) dot.className = 'db-sync-dot offline';
            if (text) text.textContent = 'Offline / LocalStorage Active';
            if (cluster) cluster.textContent = 'Local Fallback';
            if (desc) desc.textContent = 'MongoDB Atlas server is currently offline or unreachable. MindWallet is safely running in offline mode using localStorage.';
            if (usersEl) usersEl.textContent = '1';
            if (txsEl) txsEl.textContent = store.getTransactions().length;
            if (budgetsEl) budgetsEl.textContent = store.getBudgets().length;
            if (goalsEl) goalsEl.textContent = store.getGoals().length;
            if (latencyEl) latencyEl.textContent = 'Offline';
        }
    }

    async testDbConnection() {
        const start = performance.now();
        feedback.showToast('Testing MongoDB Atlas connection...', 'info');
        const health = await api.checkHealth();
        const elapsed = Math.round(performance.now() - start);

        if (health && health.database?.connected) {
            feedback.showToast(`MongoDB Atlas online! Response time: ${elapsed}ms`, 'success');
        } else {
            feedback.showToast('Unable to reach MongoDB Atlas server. Offline fallback active.', 'warning');
        }
        const latencyEl = document.getElementById('dbSyncLatency');
        if (latencyEl) latencyEl.textContent = health?.database?.connected ? `${elapsed}ms` : 'Offline';
    }

    async triggerManualSync() {
        feedback.showToast('Syncing with MongoDB Atlas...', 'info');
        const success = await store.syncWithCloud();
        if (success) {
            this.renderCurrentView();
            this.updateNotificationsUI();
            feedback.showToast('Cloud database synchronized successfully with MongoDB Atlas!', 'success');
            const syncTimeEl = document.getElementById('dbLastSyncTime');
            if (syncTimeEl) syncTimeEl.textContent = new Date().toLocaleTimeString();
        } else {
            feedback.showToast('Sync complete with local storage. MongoDB Atlas connection deferred.', 'info');
        }
    }

    // Accessible Action Dialog Delegation
    openActionDialog(config) {
        feedback.openDialog(config);
    }

    closeActionDialog() {
        feedback.closeDialog();
    }

    handleActionDialogSubmit(e) {
        feedback.handleDialogSubmit(e);
    }

    toast(msg, type = 'info', action = null) {
        feedback.showToast(msg, type, action);
    }

    // --- Transaction Handlers ---
    handleAddTransaction(e) {
        e.preventDefault();
        const errEl = document.getElementById('tx-error');
        const merchant = document.getElementById('tx-merchant').value.trim();
        const category = document.getElementById('tx-category').value;
        const amount = Number(document.getElementById('tx-amount').value);
        const type = document.getElementById('tx-type').value;
        const date = document.getElementById('tx-date').value || new Date().toISOString().split('T')[0];

        if (!merchant) {
            if (errEl) {
                errEl.textContent = 'Please enter a merchant or source name.';
                errEl.style.display = 'block';
            }
            document.getElementById('tx-merchant')?.focus();
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            if (errEl) {
                errEl.textContent = 'Please enter a valid amount greater than ₹0.';
                errEl.style.display = 'block';
            }
            document.getElementById('tx-amount')?.focus();
            return;
        }

        if (errEl) errEl.style.display = 'none';

        this.processTransactionAdd({
            merchant,
            category,
            amount,
            type,
            date,
            icon: CATEGORY_ICONS[category] || '💳',
            iconBg: type === 'income' ? '#EAF1FC' : '#F4F6F8',
            iconColor: type === 'income' ? 'var(--navy)' : 'var(--text)'
        });
    }

    deleteTransaction(id) {
        const tx = store.getTransactions().find(t => t.id === id);
        if (!tx) return;
        store.deleteTransaction(id);
        this.renderCurrentView();
        this.updateNotificationsUI();
        coach.onTransactionDeleted(tx);
    }

    filterTransactions() {
        // Read DOM inputs if available to keep filterState in sync
        const searchInput = document.getElementById('tx-search-input');
        if (searchInput) this.txFilterState.search = searchInput.value.trim();

        const catFilter = document.getElementById('tx-category-filter');
        if (catFilter) this.txFilterState.category = catFilter.value;

        const typeFilter = document.getElementById('tx-type-filter');
        if (typeFilter) this.txFilterState.type = typeFilter.value;

        const dateFilter = document.getElementById('tx-date-filter');
        if (dateFilter) this.txFilterState.dateRange = dateFilter.value;

        const necFilter = document.getElementById('tx-necessity-filter');
        if (necFilter) this.txFilterState.necessity = necFilter.value;

        const sortBySelect = document.getElementById('tx-sort-by');
        if (sortBySelect) this.txFilterState.sortBy = sortBySelect.value;

        const allTxs = store.getTransactions();
        const filtered = filterAndSortTransactions(allTxs, this.txFilterState);

        const tbody = document.getElementById('tx-table-body');
        if (tbody) {
            tbody.innerHTML = renderTxRows(filtered, store.getSettings().currency);
        }

        const countEl = document.getElementById('tx-count-indicator');
        if (countEl) {
            if (filtered.length === allTxs.length) {
                countEl.textContent = `Showing all ${allTxs.length} transactions`;
            } else {
                countEl.textContent = `Showing ${filtered.length} of ${allTxs.length} transactions`;
            }
        }

        this.updateSortControlsUI();
    }

    updateSortControlsUI() {
        const { sortBy, sortOrder } = this.txFilterState;
        const sortSelect = document.getElementById('tx-sort-by');
        if (sortSelect && sortSelect.value !== sortBy) {
            sortSelect.value = sortBy;
        }

        const sortBtn = document.getElementById('tx-sort-order-btn');
        const iconSpan = document.getElementById('tx-sort-order-icon');
        const labelSpan = document.getElementById('tx-sort-order-label');
        if (sortBtn && iconSpan && labelSpan) {
            const isAsc = sortOrder === 'asc';
            iconSpan.textContent = isAsc ? '↑' : '↓';
            labelSpan.textContent = isAsc ? 'Asc' : 'Desc';
            sortBtn.setAttribute('aria-label', `Toggle sort order: currently ${isAsc ? 'Ascending' : 'Descending'}`);
        }

        // Update table header aria-sort and icons
        ['merchant', 'date', 'amount'].forEach(col => {
            const th = document.getElementById(`th-sort-${col}`);
            if (!th) return;
            const icon = th.querySelector('.sort-icon');
            if (sortBy === col) {
                const isAsc = sortOrder === 'asc';
                th.setAttribute('aria-sort', isAsc ? 'ascending' : 'descending');
                if (icon) icon.textContent = isAsc ? '↑' : '↓';
            } else {
                th.setAttribute('aria-sort', 'none');
                if (icon) icon.textContent = '↕';
            }
        });
    }

    onTxSortChange(val) {
        this.txFilterState.sortBy = val;
        this.filterTransactions();
    }

    toggleTxSort(col) {
        if (this.txFilterState.sortBy === col) {
            this.txFilterState.sortOrder = this.txFilterState.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.txFilterState.sortBy = col;
            this.txFilterState.sortOrder = col === 'merchant' ? 'asc' : 'desc';
        }
        this.filterTransactions();
    }

    toggleTxSortOrder() {
        this.txFilterState.sortOrder = this.txFilterState.sortOrder === 'asc' ? 'desc' : 'asc';
        this.filterTransactions();
    }

    resetTransactionFilters() {
        this.txFilterState = {
            search: '',
            category: 'all',
            type: 'all',
            dateRange: 'all',
            necessity: 'all',
            sortBy: 'date',
            sortOrder: 'desc'
        };

        const searchInput = document.getElementById('tx-search-input');
        if (searchInput) searchInput.value = '';

        const catFilter = document.getElementById('tx-category-filter');
        if (catFilter) catFilter.value = 'all';

        const typeFilter = document.getElementById('tx-type-filter');
        if (typeFilter) typeFilter.value = 'all';

        const dateFilter = document.getElementById('tx-date-filter');
        if (dateFilter) dateFilter.value = 'all';

        const necFilter = document.getElementById('tx-necessity-filter');
        if (necFilter) necFilter.value = 'all';

        const sortBySelect = document.getElementById('tx-sort-by');
        if (sortBySelect) sortBySelect.value = 'date';

        this.filterTransactions();
    }

    // --- Budget Handlers ---
    handleSetBudget(e) {
        e.preventDefault();
        const errEl = document.getElementById('budget-error');
        const cat = document.getElementById('budget-category').value;
        const limit = Number(document.getElementById('budget-limit').value);

        if (isNaN(limit) || limit <= 0) {
            if (errEl) {
                errEl.textContent = 'Please enter a valid monthly limit greater than ₹0.';
                errEl.style.display = 'block';
            }
            document.getElementById('budget-limit')?.focus();
            return;
        }

        if (errEl) errEl.style.display = 'none';

        store.updateBudget(cat, limit);
        this.closeModal();
        this.renderCurrentView();
        this.updateNotificationsUI();
        feedback.showToast(`Budget limit updated for ${cat}!`, 'success');
    }

    quickSetBudget(category, currentLimit) {
        feedback.openDialog({
            title: `Adjust Budget: ${category}`,
            message: `Set the monthly spending threshold for ${category}.`,
            mode: 'prompt',
            inputType: 'number',
            inputValue: currentLimit,
            inputLabel: 'Monthly Threshold (₹)',
            confirmText: 'Save Budget',
            onConfirm: (val) => {
                const num = Number(val);
                if (!val || isNaN(num) || num <= 0) {
                    const errEl = document.getElementById('action-dialog-error');
                    if (errEl) {
                        errEl.textContent = 'Please enter a valid amount greater than ₹0.';
                        errEl.style.display = 'block';
                    }
                    return false;
                }
                store.updateBudget(category, num);
                this.renderCurrentView();
                coach.onBudgetUpdated(category, currentLimit, num);
                return true;
            }
        });
    }

    // --- Savings Goal Handlers ---
    handleAddGoal(e) {
        e.preventDefault();
        const errEl = document.getElementById('goal-error');
        const name = document.getElementById('goal-name').value.trim();
        const target = Number(document.getElementById('goal-target').value);
        const monthlyContribution = Number(document.getElementById('goal-monthly').value);
        const category = document.getElementById('goal-category').value;

        if (!name) {
            if (errEl) {
                errEl.textContent = 'Please enter a goal name.';
                errEl.style.display = 'block';
            }
            document.getElementById('goal-name')?.focus();
            return;
        }

        if (isNaN(target) || target <= 0) {
            if (errEl) {
                errEl.textContent = 'Please enter a target amount greater than ₹0.';
                errEl.style.display = 'block';
            }
            document.getElementById('goal-target')?.focus();
            return;
        }

        if (isNaN(monthlyContribution) || monthlyContribution <= 0) {
            if (errEl) {
                errEl.textContent = 'Please enter a monthly contribution greater than ₹0.';
                errEl.style.display = 'block';
            }
            document.getElementById('goal-monthly')?.focus();
            return;
        }

        if (errEl) errEl.style.display = 'none';

        store.addGoal({
            name,
            target,
            current: 0,
            monthlyContribution,
            category,
            icon: CATEGORY_ICONS[category] || '🎯'
        });

        this.closeModal();
        this.renderCurrentView();
        this.updateNotificationsUI();
        feedback.showToast(`Savings Goal "${name}" created!`, 'success');
    }

    depositGoal(id, name) {
        feedback.openDialog({
            title: `Deposit to ${name}`,
            message: `Enter the amount to deposit into your "${name}" fund today.`,
            mode: 'prompt',
            inputType: 'number',
            inputValue: '1000',
            inputLabel: 'Deposit Amount (₹)',
            confirmText: 'Add Deposit',
            onConfirm: (val) => {
                const num = Number(val);
                if (!val || isNaN(num) || num <= 0) {
                    const errEl = document.getElementById('action-dialog-error');
                    if (errEl) {
                        errEl.textContent = 'Please enter a deposit greater than ₹0.';
                        errEl.style.display = 'block';
                    }
                    return false;
                }
                const g = store.updateGoalDeposit(id, num);
                this.renderCurrentView();
                const newPct = g ? Math.min(100, Math.round((g.current / g.target) * 100)) : 100;
                coach.onGoalDeposited(id, name, num, newPct);
                return true;
            }
        });
    }

    // --- Subscription Handlers ---
    handleAddSubscription(e) {
        e.preventDefault();
        const errEl = document.getElementById('sub-error');
        const name = document.getElementById('sub-name').value.trim();
        const category = document.getElementById('sub-category').value;
        const amount = Number(document.getElementById('sub-amount').value);
        const cycle = document.getElementById('sub-cycle').value;
        const nextBilling = document.getElementById('sub-next').value;

        if (!name) {
            if (errEl) {
                errEl.textContent = 'Please enter a service name.';
                errEl.style.display = 'block';
            }
            document.getElementById('sub-name')?.focus();
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            if (errEl) {
                errEl.textContent = 'Please enter a recurring charge greater than ₹0.';
                errEl.style.display = 'block';
            }
            document.getElementById('sub-amount')?.focus();
            return;
        }

        if (!nextBilling) {
            if (errEl) {
                errEl.textContent = 'Please select a renewal date.';
                errEl.style.display = 'block';
            }
            document.getElementById('sub-next')?.focus();
            return;
        }

        if (errEl) errEl.style.display = 'none';

        store.addSubscription({
            name,
            category,
            amount,
            cycle,
            nextBilling,
            status: 'Active',
            icon: CATEGORY_ICONS[category] || '📦'
        });

        this.closeModal();
        this.renderCurrentView();
        this.updateNotificationsUI();
        feedback.showToast(`Subscription "${name}" tracked!`, 'success');
    }

    deleteSubscription(id, name, amount) {
        const sub = store.getSubscriptions().find(s => s.id === id);
        if (!sub) return;
        feedback.openDialog({
            title: 'Delete Subscription',
            message: `Are you sure you want to stop tracking "${name}" (₹${amount.toLocaleString()})?`,
            mode: 'confirm',
            confirmText: 'Delete Subscription',
            isDanger: true,
            onConfirm: () => {
                store.deleteSubscription(id);
                this.renderCurrentView();
                this.updateNotificationsUI();
                coach.onSubscriptionDeleted(sub);
                return true;
            }
        });
    }

    // --- Purchase Simulator Engine with Before/After Health Score ---
    runSimulation(e) {
        e.preventDefault();
        const errEl = document.getElementById('sim-error');
        const name = document.getElementById('sim-item').value.trim();
        const price = Number(document.getElementById('sim-price').value);
        const category = document.getElementById('sim-category').value;
        const priority = document.getElementById('sim-priority').value;
        const selectedGoalId = document.getElementById('sim-goal')?.value || null;

        if (!name) {
            if (errEl) {
                errEl.textContent = 'Please enter an item name.';
                errEl.style.display = 'block';
            }
            document.getElementById('sim-item')?.focus();
            return;
        }

        if (isNaN(price) || price <= 0) {
            if (errEl) {
                errEl.textContent = 'Please enter a price greater than ₹0.';
                errEl.style.display = 'block';
            }
            document.getElementById('sim-price')?.focus();
            return;
        }

        if (errEl) errEl.style.display = 'none';

        const sim = store.simulatePurchase(price, category, priority, selectedGoalId);
        const currency = store.getSettings().currency;

        const cardContent = document.getElementById('sim-result-content');
        if (cardContent) {
            const isNegative = sim.moneyLeftAfter < 0;
            const healthDiff = sim.healthAfter - sim.healthBefore;

            cardContent.innerHTML = `
                <div style="background:var(--bg); padding:16px 20px; border-radius:12px; border-left:5px solid ${isNegative ? 'var(--status-critical)' : 'var(--accent)'}; border:1px solid var(--border);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div>
                            <span style="font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase; font-weight:700;">Simulated Purchase</span>
                            <h3 style="font-size:1.25rem; font-weight:700; margin:2px 0 0;">${escapeHtml(name)}</h3>
                        </div>
                        <span class="${sim.recommendationClass}">
                            ${sim.recommendation}
                        </span>
                    </div>
                    <div style="font-size:1.6rem; font-weight:700; color:var(--navy); margin-top:6px;">
                        ${currency}${sim.price.toLocaleString()}
                    </div>
                </div>

                <!-- Price Impact & Net Balance Metrics -->
                <div class="grid-2">
                    <div style="background:var(--bg); padding:14px; border-radius:10px; border:1px solid var(--border);">
                        <div style="font-size:var(--text-xs); color:var(--text-muted); font-weight:600;">Price Impact on Income</div>
                        <div style="font-size:1.3rem; font-weight:700; color:var(--text); margin-top:4px;">
                            ${sim.priceImpactPct}% <span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);">of monthly income</span>
                        </div>
                    </div>

                    <div style="background:var(--bg); padding:14px; border-radius:10px; border:1px solid var(--border);">
                        <div style="font-size:var(--text-xs); color:var(--text-muted); font-weight:600;">Net Balance After Purchase</div>
                        <div style="font-size:1.3rem; font-weight:700; color:${sim.moneyLeftAfter < 0 ? 'var(--status-critical-text)' : 'var(--status-healthy-text)'}; margin-top:4px;">
                            ${currency}${sim.moneyLeftAfter.toLocaleString()}
                        </div>
                    </div>
                </div>

                <!-- Health Score Before vs After Metric -->
                <div class="grid-2">
                    <div style="background:var(--bg); padding:14px; border-radius:10px; border:1px solid var(--border);">
                        <div style="font-size:var(--text-xs); color:var(--text-muted); font-weight:600;">Financial Health Score Impact</div>
                        <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                            <span style="font-size:1.3rem; font-weight:700;">${sim.healthBefore}</span>
                            <span style="font-size:1.1rem; color:var(--text-muted);">➔</span>
                            <span style="font-size:1.3rem; font-weight:700; color:${healthDiff < 0 ? 'var(--status-critical-text)' : 'var(--status-healthy-text)'};">${sim.healthAfter}</span>
                            <span class="status-pill ${healthDiff < 0 ? 'critical' : 'healthy'}" style="font-size:0.75rem;">
                                ${healthDiff <= 0 ? healthDiff : '+' + healthDiff} pts
                            </span>
                        </div>
                    </div>

                    <div style="background:var(--bg); padding:14px; border-radius:10px; border:1px solid var(--border);">
                        <div style="font-size:var(--text-xs); color:var(--text-muted); font-weight:600;">Delay on "${escapeHtml(sim.goalName)}"</div>
                        <div style="font-size:1.3rem; font-weight:700; color:var(--status-warning-text); margin-top:4px;">
                            +${sim.delayDays} Days
                        </div>
                    </div>
                </div>

                <!-- Category Budget Impact -->
                <div style="background:var(--bg); padding:14px; border-radius:10px; border:1px solid var(--border);">
                    <div style="font-size:var(--text-xs); color:var(--text-muted); font-weight:600; margin-bottom:4px;">
                        ${escapeHtml(category)} Category Budget Impact
                    </div>
                    <div style="font-size:var(--text-sm);">
                        Remaining before purchase: <strong>${currency}${sim.remainingCatBudgetBefore.toLocaleString()}</strong> ➔ 
                        After: <strong style="color:${sim.remainingCatBudgetAfter < 0 ? 'var(--status-critical-text)' : 'var(--status-healthy-text)'};">${currency}${sim.remainingCatBudgetAfter.toLocaleString()}</strong>
                        ${sim.willExceedBudget ? '<span class="status-pill critical" style="margin-left:6px;">Exceeds Budget</span>' : ''}
                    </div>
                </div>

                ${sim.coolingActive ? `
                    <div style="background:#FFFBEB; border:1px solid #FCD34D; border-left:4px solid #F59E0B; padding:12px 16px; border-radius:10px; font-size:var(--text-xs);">
                        <div style="font-weight:700; color:#92400E; display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                            <span aria-hidden="true">⏱️</span> ${sim.coolingHours}-Hour Deliberation Window Active
                        </div>
                        <div style="color:#78350F; line-height:1.45;">
                            Alex's Impulse Control profile recommends pausing before buying non-essential items. Deliberating for 24 hours protects your savings cushion and reinforces positive spending discipline!
                        </div>
                    </div>
                ` : ''}

                <!-- Cognitive HCI Guidance -->
                <div style="background:var(--navy-light); border:1px solid var(--border-strong); padding:16px; border-radius:12px;">
                    <div style="font-size:var(--text-sm); font-weight:700; display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                        <span aria-hidden="true">💡</span> Cognitive HCI Decision Recommendation
                    </div>
                    <p style="font-size:var(--text-sm); color:var(--text); margin:0; line-height:1.45;">
                        ${sim.hciAdvice}
                    </p>
                </div>
            `;
        }
    }

    // --- Global Real-Time Search Engine ---
    setupGlobalSearch() {
        const input = document.getElementById('global-search');
        const dropdown = document.getElementById('global-search-results');
        if (!input || !dropdown) return;

        let selectedIndex = -1;

        const hideDropdown = () => {
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
            selectedIndex = -1;
        };

        const performSearch = (q) => {
            const query = q.trim().toLowerCase();
            if (query.length < 1) {
                hideDropdown();
                return;
            }

            const txs = store.getTransactions().filter(t => 
                (t.merchant || '').toLowerCase().includes(query) || 
                (t.category || '').toLowerCase().includes(query) ||
                String(t.amount).includes(query)
            ).slice(0, 4);

            const budgets = store.getBudgets().filter(b => 
                (b.category || '').toLowerCase().includes(query) ||
                String(b.limit).includes(query)
            ).slice(0, 3);

            const goals = store.getGoals().filter(g => 
                (g.name || '').toLowerCase().includes(query) || 
                (g.category || '').toLowerCase().includes(query)
            ).slice(0, 3);

            if (!txs.length && !budgets.length && !goals.length) {
                dropdown.innerHTML = `<div style="padding:12px; text-align:center; color:var(--text-muted); font-size:var(--text-sm);">No results for "${escapeHtml(q)}"</div>`;
                dropdown.style.display = 'block';
                return;
            }

            const currency = store.getSettings().currency;
            let html = '';

            if (txs.length) {
                html += `<div class="search-results-group">Transactions</div>`;
                txs.forEach(t => {
                    html += `
                        <div class="search-result-item" role="option" data-type="tx" data-query="${escapeHtml(t.merchant)}" tabindex="0">
                            <div class="search-result-item-left">
                                <span aria-hidden="true">${t.icon || '💳'}</span>
                                <strong>${escapeHtml(t.merchant)}</strong>
                                <span class="search-result-meta">(${escapeHtml(t.category)})</span>
                            </div>
                            <span style="font-weight:700; color:${t.type === 'income' ? 'var(--emerald)' : 'var(--text)'};">
                                ${t.type === 'income' ? '+' : '-'}${currency}${Number(t.amount).toLocaleString()}
                            </span>
                        </div>
                    `;
                });
            }

            if (budgets.length) {
                html += `<div class="search-results-group">Budgets</div>`;
                budgets.forEach(b => {
                    html += `
                        <div class="search-result-item" role="option" data-type="budget" tabindex="0">
                            <div class="search-result-item-left">
                                <span aria-hidden="true">${b.icon || '📌'}</span>
                                <strong>${escapeHtml(b.category)} Budget</strong>
                            </div>
                            <span class="search-result-meta">Limit: ${currency}${b.limit.toLocaleString()}/mo</span>
                        </div>
                    `;
                });
            }

            if (goals.length) {
                html += `<div class="search-results-group">Savings Goals</div>`;
                goals.forEach(g => {
                    html += `
                        <div class="search-result-item" role="option" data-type="goal" tabindex="0">
                            <div class="search-result-item-left">
                                <span aria-hidden="true">${g.icon || '🎯'}</span>
                                <strong>${escapeHtml(g.name)}</strong>
                            </div>
                            <span class="search-result-meta">Target: ${currency}${g.target.toLocaleString()}</span>
                        </div>
                    `;
                });
            }

            dropdown.innerHTML = html;
            dropdown.style.display = 'block';

            dropdown.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const type = item.getAttribute('data-type');
                    if (type === 'tx') {
                        window.location.hash = '#transactions';
                        setTimeout(() => {
                            const txSearch = document.getElementById('tx-search-input');
                            if (txSearch) {
                                txSearch.value = item.getAttribute('data-query') || '';
                                this.filterTransactions();
                            }
                        }, 100);
                    } else if (type === 'budget') {
                        window.location.hash = '#budget';
                    } else if (type === 'goal') {
                        window.location.hash = '#savings';
                    }
                    hideDropdown();
                    input.value = '';
                });
            });
        };

        input.addEventListener('input', (e) => performSearch(e.target.value));

        input.addEventListener('keydown', (e) => {
            const items = dropdown.querySelectorAll('.search-result-item');
            if (dropdown.style.display === 'block' && items.length) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex + 1) % items.length;
                    items.forEach((it, idx) => it.classList.toggle('selected', idx === selectedIndex));
                    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                    items.forEach((it, idx) => it.classList.toggle('selected', idx === selectedIndex));
                    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (selectedIndex >= 0 && items[selectedIndex]) {
                        items[selectedIndex].click();
                    } else if (items[0]) {
                        items[0].click();
                    }
                } else if (e.key === 'Escape') {
                    hideDropdown();
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== input) {
                hideDropdown();
            }
        });
    }

    // --- Urgent ASAP Notifications Engine (Strict Minimal) ---
    checkAndShowUrgentNotification() {
        const isSessionActive = sessionStorage.getItem('mindwallet_session_active') === 'true';
        if (!store.getCurrentUser() || !isSessionActive || this.currentView === 'login') {
            return;
        }

        const urgentNotifs = store.getUrgentNotifications();
        if (urgentNotifs.length > 0) {
            // Only pop up the single most critical item (e.g. budget exceeded or subscription due today)
            const top = urgentNotifs[0];
            feedback.showToast(`${top.icon || '🚨'} ${top.title}: ${top.message}`, 'danger');
        }
    }

    // --- Dynamic Notifications Drawer & Badge ---
    updateNotificationsUI() {
        const badgeDot = document.getElementById('notifBadgeDot');
        const badgeText = document.getElementById('notifBadgeText');
        const drawerContent = document.getElementById('notifDrawerContent');
        const isSessionActive = sessionStorage.getItem('mindwallet_session_active') === 'true';

        if (!store.getCurrentUser() || !isSessionActive || this.currentView === 'login') {
            if (badgeDot) badgeDot.style.display = 'none';
            if (drawerContent) drawerContent.innerHTML = `<p class="notif-empty-msg" style="padding:24px 16px; text-align:center; color:var(--text-muted); font-size:var(--text-sm);">Please sign in to view alerts.</p>`;
            return;
        }

        const notifs = store.getNotifications();
        const unreadCount = store.getUnreadNotificationCount();

        if (badgeDot) {
            badgeDot.style.display = unreadCount > 0 ? 'block' : 'none';
        }
        if (badgeText) {
            badgeText.textContent = `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`;
        }

        if (drawerContent) {
            if (!notifs.length) {
                drawerContent.innerHTML = `<p class="notif-empty-msg" style="padding:24px 16px; text-align:center; color:var(--text-muted); font-size:var(--text-sm);">No active alerts. All budgets and subscriptions on track!</p>`;
            } else {
                const levelBadges = {
                    critical: '<span class="status-pill critical" style="font-size:0.68rem; padding:2px 6px;">Alert</span>',
                    warning: '<span class="status-pill warning" style="font-size:0.68rem; padding:2px 6px;">Warning</span>',
                    info: '<span class="status-pill info" style="font-size:0.68rem; padding:2px 6px;">Upcoming</span>',
                    success: '<span class="status-pill healthy" style="font-size:0.68rem; padding:2px 6px;">Milestone</span>'
                };
                drawerContent.innerHTML = notifs.map(n => {
                    const level = n.level || 'info';
                    const badge = levelBadges[level] || '';
                    return `
                        <a href="${n.route || '#dashboard'}" class="notif-item notif-${level}" onclick="document.getElementById('notifDrawer')?.classList.remove('open')">
                            <div class="notif-item-header">
                                <div class="notif-item-title">
                                    <span class="notif-item-icon" aria-hidden="true">${n.icon || '🔔'}</span>
                                    <span>${escapeHtml(n.title)}</span>
                                </div>
                                ${badge}
                            </div>
                            <div class="notif-item-message">${escapeHtml(n.message)}</div>
                        </a>
                    `;
                }).join('');
            }
        }
    }

    handleReportMonthChange(monthStr) {
        this.selectedReportMonth = monthStr;
        this.renderCurrentView();
    }

    setupProfilePanel() {
        const profileBtn = document.getElementById('userProfileBtn');
        const profilePanel = document.getElementById('profilePanel');

        if (profileBtn && profilePanel) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = profilePanel.classList.toggle('open');
                profileBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            document.addEventListener('click', (e) => {
                if (!profilePanel.contains(e.target) && e.target !== profileBtn) {
                    if (profilePanel.classList.contains('open')) {
                        profilePanel.classList.remove('open');
                        profileBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }
    }

    switchAuthTab(tab) {
        const formLogin = document.getElementById('form-login');
        const formRegister = document.getElementById('form-register');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');

        if (tab === 'login') {
            if (formLogin) formLogin.style.display = 'block';
            if (formRegister) formRegister.style.display = 'none';
            if (tabLogin) { tabLogin.style.background = 'var(--surface)'; tabLogin.style.color = 'var(--text)'; }
            if (tabRegister) { tabRegister.style.background = 'transparent'; tabRegister.style.color = 'var(--text-muted)'; }
        } else {
            if (formLogin) formLogin.style.display = 'none';
            if (formRegister) formRegister.style.display = 'block';
            if (tabRegister) { tabRegister.style.background = 'var(--surface)'; tabRegister.style.color = 'var(--text)'; }
            if (tabLogin) { tabLogin.style.background = 'transparent'; tabLogin.style.color = 'var(--text-muted)'; }
        }
    }

    togglePasswordVisibility(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        if (btn) {
            btn.innerHTML = isPassword ? '<span aria-hidden="true">🙈</span> <span>Hide</span>' : '<span aria-hidden="true">👁️</span> <span>Show</span>';
            btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        }
    }

    onLoginPersonaSelect(personaKey) {
        const emailInput = document.getElementById('login-email');
        const emailMap = {
            student: 'alex@mindwallet.local',
            working_professional: 'priya@mindwallet.local',
            elderly_retiree: 'eleanor@mindwallet.local',
            goal_saver: 'rohan@mindwallet.local'
        };
        if (emailInput && emailMap[personaKey]) {
            emailInput.value = emailMap[personaKey];
        }
    }

    handleQuickPersonaLogin(personaKey) {
        sessionStorage.setItem('mindwallet_session_active', 'true');
        store.applyPersona(personaKey, {}, false);
        this.applySettings(store.getSettings());
        this.updateUserProfileUI();
        this.updateSidebarA11y();
        this.updateTopbarPersonaSelect();
        const user = store.getCurrentUser();
        feedback.showToast(`Welcome! Profile set up as ${user?.name || personaKey}`, 'success');
        window.location.hash = '#dashboard';
        this.handleRoute();
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        const alertEl = document.getElementById('auth-alert');
        try {
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            const personaRole = document.getElementById('login-persona')?.value || null;

            const user = store.login(email, pass, personaRole);
            sessionStorage.setItem('mindwallet_session_active', 'true');
            if (alertEl) alertEl.style.display = 'none';
            this.applySettings(store.getSettings());
            this.updateUserProfileUI();
            this.updateSidebarA11y();
            feedback.showToast(`Welcome back, ${user.name}!`, 'success');
            window.location.hash = '#dashboard';
            this.handleRoute();
        } catch (err) {
            if (alertEl) {
                alertEl.style.display = 'block';
                alertEl.style.background = 'var(--status-critical-bg)';
                alertEl.style.color = 'var(--status-critical-text)';
                alertEl.style.border = '1px solid var(--status-critical-border)';
                alertEl.textContent = err.message || 'Login failed. Please check your credentials.';
            }
        }
    }

    handleRegisterSubmit(e) {
        e.preventDefault();
        const alertEl = document.getElementById('auth-alert');
        try {
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const personaRole = document.getElementById('reg-role').value;

            const user = store.register(name, email, personaRole, personaRole);
            sessionStorage.setItem('mindwallet_session_active', 'true');
            if (alertEl) alertEl.style.display = 'none';

            this.applySettings(store.getSettings());
            this.updateUserProfileUI();
            this.updateSidebarA11y();
            this.updateTopbarPersonaSelect();

            feedback.showToast(`Account created for ${user.name}!`, 'success');
            window.location.hash = '#dashboard';
            this.handleRoute();

            setTimeout(() => {
                onboarding.open(1);
            }, 600);
        } catch (err) {
            if (alertEl) {
                alertEl.style.display = 'block';
                alertEl.style.background = 'var(--status-critical-bg)';
                alertEl.style.color = 'var(--status-critical-text)';
                alertEl.style.border = '1px solid var(--status-critical-border)';
                alertEl.textContent = err.message || 'Registration failed.';
            }
        }
    }

    handleGuestLoginSubmit() {
        sessionStorage.setItem('mindwallet_session_active', 'true');
        const user = store.loginAsGuest();
        this.updateUserProfileUI();
        this.updateSidebarA11y();
        feedback.showToast(`Signed in as Demo User (${user.name})`, 'info');
        window.location.hash = '#dashboard';
        this.handleRoute();
    }

    handleLogout() {
        feedback.openDialog({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out of MindWallet?',
            mode: 'confirm',
            confirmText: 'Sign Out',
            isDanger: true,
            onConfirm: () => {
                coach.clearAll();
                feedback.clearFloatingFeedback();
                sessionStorage.removeItem('mindwallet_session_active');
                store.logout();
                document.getElementById('profilePanel')?.classList.remove('open');
                this.updateUserProfileUI();
                this.updateSidebarA11y();
                feedback.showToast('Signed out successfully.', 'info');
                window.location.hash = '#login';
                this.handleRoute();
                return true;
            }
        });
    }

    handleExportData() {
        try {
            const dataStr = store.exportData();
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const dateStr = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `mindwallet_backup_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            feedback.showToast('Backup downloaded successfully (JSON).', 'success');
        } catch (err) {
            console.error('Export failed', err);
            feedback.showToast('Failed to export backup.', 'danger');
        }
    }

    handleImportDataFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result;
                store.importData(content);
                this.applySettings(store.getSettings());
                this.updateUserProfileUI();
                this.updateTopbarPersonaSelect();
                this.renderCurrentView();
                this.updateNotificationsUI();
                feedback.showToast('Data imported successfully!', 'success');
            } catch (err) {
                console.error('Import error', err);
                feedback.showToast(`Import error: ${err.message}`, 'danger');
            }
        };
        reader.onerror = () => {
            feedback.showToast('Failed to read selected file.', 'danger');
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    resetData() {
        feedback.openDialog({
            title: 'Factory Reset All Data',
            message: 'Are you sure you want to restore the initial starter data? All custom transactions, budgets, goals, and customized settings will be reset to defaults.',
            mode: 'confirm',
            confirmText: 'Reset Everything',
            isDanger: true,
            onConfirm: () => {
                store.resetAllData();
                this.applySettings(store.getSettings());
                this.renderCurrentView();
                this.updateUserProfileUI();
                this.updateTopbarPersonaSelect();
                this.updateNotificationsUI();
                feedback.showToast('Sample data reset to clean baseline.', 'warning');
                return true;
            }
        });
    }
}

// Global initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}
