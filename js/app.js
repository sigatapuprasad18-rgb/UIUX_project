/* MindWallet — Main Application Controller & Router */
import { store } from './store.js';
import { renderDashboard } from './views/dashboard.js';
import { renderTransactions, renderTxRows } from './views/transactions.js';
import { renderBudget } from './views/budget.js';
import { renderSavings } from './views/savings.js';
import { renderHealth } from './views/health.js';
import { renderSubscriptions } from './views/subscriptions.js';
import { renderAnalytics } from './views/analytics.js';
import { renderInsights } from './views/insights.js';
import { renderSimulator } from './views/simulator.js';
import { renderReports } from './views/reports.js';
import { renderSettings } from './views/settings.js';

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.setupRouter();
        this.setupAccessibilityPanel();
        this.setupGlobalEvents();
        this.applySettings(store.getSettings());
    }

    setupRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        this.currentView = hash;
        this.renderCurrentView();
        this.updateActiveNav(hash);
    }

    updateActiveNav(hash) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${hash}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        // Close sidebar on mobile route change
        document.getElementById('sidebar')?.classList.remove('open');
    }

    renderCurrentView() {
        const content = document.getElementById('app-content');
        if (!content) return;

        switch (this.currentView) {
            case 'dashboard': content.innerHTML = renderDashboard(); break;
            case 'transactions': content.innerHTML = renderTransactions(); break;
            case 'budget': content.innerHTML = renderBudget(); break;
            case 'savings': content.innerHTML = renderSavings(); break;
            case 'health': content.innerHTML = renderHealth(); break;
            case 'subscriptions': content.innerHTML = renderSubscriptions(); break;
            case 'analytics': content.innerHTML = renderAnalytics(); break;
            case 'insights': content.innerHTML = renderInsights(); break;
            case 'simulator': content.innerHTML = renderSimulator(); break;
            case 'reports': content.innerHTML = renderReports(); break;
            case 'settings': content.innerHTML = renderSettings(); break;
            default: content.innerHTML = renderDashboard(); break;
        }

        window.scrollTo(0, 0);
    }

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
                    a11yPanel.classList.remove('open');
                    a11yBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Toggles
        document.getElementById('toggleContrast')?.addEventListener('click', () => {
            const settings = store.getSettings();
            const val = !settings.highContrast;
            store.updateSettings({ highContrast: val });
            this.applySettings(store.getSettings());
        });

        document.getElementById('toggleMotion')?.addEventListener('click', () => {
            const settings = store.getSettings();
            const val = !settings.reducedMotion;
            store.updateSettings({ reducedMotion: val });
            this.applySettings(store.getSettings());
        });

        document.getElementById('fontUp')?.addEventListener('click', () => {
            const settings = store.getSettings();
            if (settings.fontSizeStep < 4) {
                store.updateSettings({ fontSizeStep: settings.fontSizeStep + 1 });
                this.applySettings(store.getSettings());
            }
        });

        document.getElementById('fontDown')?.addEventListener('click', () => {
            const settings = store.getSettings();
            if (settings.fontSizeStep > -2) {
                store.updateSettings({ fontSizeStep: settings.fontSizeStep - 1 });
                this.applySettings(store.getSettings());
            }
        });

        document.getElementById('modeSelect')?.addEventListener('change', (e) => {
            this.setMode(e.target.value);
        });
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
        this.toast(`Mode updated: ${mode.toUpperCase()}`);
    }

    setModeFromSettings(mode) {
        this.setMode(mode);
        const sel = document.getElementById('modeSelect');
        if (sel) sel.value = mode;
    }

    applySettings(s) {
        const body = document.body;
        body.classList.remove('high-contrast', 'reduced-motion', 'senior', 'simplified');

        if (s.highContrast) body.classList.add('high-contrast');
        if (s.reducedMotion) body.classList.add('reduced-motion');
        if (s.mode === 'senior') body.classList.add('senior', 'simplified');
        if (s.mode === 'simplified') body.classList.add('simplified');

        document.documentElement.style.setProperty('--base-size', (16 + (s.fontSizeStep || 0) * 2) + 'px');

        const contrastBtn = document.getElementById('toggleContrast');
        if (contrastBtn) contrastBtn.setAttribute('aria-pressed', s.highContrast ? 'true' : 'false');

        const motionBtn = document.getElementById('toggleMotion');
        if (motionBtn) motionBtn.setAttribute('aria-pressed', s.reducedMotion ? 'true' : 'false');
    }

    setupGlobalEvents() {
        // Mobile sidebar toggle
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar?.classList.toggle('open');
        });

        // Notifications drawer
        const notifBtn = document.getElementById('notifBtn');
        const notifDrawer = document.getElementById('notifDrawer');
        if (notifBtn && notifDrawer) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifDrawer.classList.toggle('open');
                store.markAllNotificationsRead();
                const badge = notifBtn.querySelector('.badge-dot');
                if (badge) badge.style.display = 'none';
            });

            document.addEventListener('click', (e) => {
                if (!notifDrawer.contains(e.target) && e.target !== notifBtn) {
                    notifDrawer.classList.remove('open');
                }
            });
        }

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // Modal Control
    openModal(modalId) {
        const modal = document.getElementById(`modal-${modalId}`);
        if (modal) modal.classList.add('open');
    }

    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    }

    // Transaction Actions
    handleAddTransaction(e) {
        e.preventDefault();
        const merchant = document.getElementById('tx-merchant').value;
        const category = document.getElementById('tx-category').value;
        const amount = Number(document.getElementById('tx-amount').value);
        const type = document.getElementById('tx-type').value;
        const date = document.getElementById('tx-date').value || new Date().toISOString().split('T')[0];

        const icons = { Groceries: '🛒', Housing: '🏠', Utilities: '⚡', Subscriptions: '🎬', Entertainment: '🎟️', Transport: '🚇', Income: '💼' };
        
        store.addTransaction({
            merchant,
            category,
            amount,
            type,
            date,
            icon: icons[category] || '💳',
            iconBg: type === 'income' ? '#EAF1FC' : '#F4F6F8',
            iconColor: type === 'income' ? 'var(--navy)' : 'var(--text)'
        });

        this.closeModal();
        this.renderCurrentView();
        this.toast('Transaction recorded successfully!', 'success');
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            store.deleteTransaction(id);
            this.renderCurrentView();
            this.toast('Transaction deleted', 'warning');
        }
    }

    filterTransactions() {
        const query = (document.getElementById('tx-search-input')?.value || '').toLowerCase();
        const cat = document.getElementById('tx-category-filter')?.value || 'all';
        const type = document.getElementById('tx-type-filter')?.value || 'all';

        let txs = store.getTransactions();

        if (query) {
            txs = txs.filter(t => t.merchant.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
        }

        if (cat !== 'all') {
            txs = txs.filter(t => t.category.toLowerCase() === cat.toLowerCase());
        }

        if (type !== 'all') {
            txs = txs.filter(t => t.type === type);
        }

        const tbody = document.getElementById('tx-table-body');
        if (tbody) {
            tbody.innerHTML = renderTxRows(txs, store.getSettings().currency);
        }
    }

    // Budget Actions
    handleSetBudget(e) {
        e.preventDefault();
        const cat = document.getElementById('budget-category').value;
        const limit = Number(document.getElementById('budget-limit').value);

        store.updateBudget(cat, limit);
        this.closeModal();
        this.renderCurrentView();
        this.toast(`Budget limit updated for ${cat}!`, 'success');
    }

    quickSetBudget(category, currentLimit) {
        const newLimit = prompt(`Enter new monthly budget limit for ${category}:`, currentLimit);
        if (newLimit && !isNaN(newLimit)) {
            store.updateBudget(category, Number(newLimit));
            this.renderCurrentView();
            this.toast(`Updated ${category} budget to ${store.getSettings().currency}${Number(newLimit).toLocaleString()}`, 'success');
        }
    }

    // Savings Actions
    handleAddGoal(e) {
        e.preventDefault();
        const name = document.getElementById('goal-name').value;
        const target = Number(document.getElementById('goal-target').value);
        const monthlyContribution = Number(document.getElementById('goal-monthly').value);
        const category = document.getElementById('goal-category').value;

        store.addGoal({
            name,
            target,
            current: 0,
            monthlyContribution,
            category,
            icon: '🎯'
        });

        this.closeModal();
        this.renderCurrentView();
        this.toast(`Savings Goal "${name}" created!`, 'success');
    }

    depositGoal(id, name) {
        const amt = prompt(`Enter deposit amount for "${name}":`, '1000');
        if (amt && !isNaN(amt)) {
            store.updateGoalDeposit(id, Number(amt));
            this.renderCurrentView();
            this.toast(`Deposited ${store.getSettings().currency}${Number(amt).toLocaleString()} into ${name}!`, 'success');
        }
    }

    // Subscription Actions
    handleAddSubscription(e) {
        e.preventDefault();
        const name = document.getElementById('sub-name').value;
        const category = document.getElementById('sub-category').value;
        const amount = Number(document.getElementById('sub-amount').value);
        const cycle = document.getElementById('sub-cycle').value;
        const nextBilling = document.getElementById('sub-next').value;

        store.addSubscription({
            name,
            category,
            amount,
            cycle,
            nextBilling,
            status: 'Active',
            icon: '📦'
        });

        this.closeModal();
        this.renderCurrentView();
        this.toast(`Subscription "${name}" added!`, 'success');
    }

    deleteSubscription(id, name, amount) {
        if (confirm(`Cancel/Pause subscription for "${name}"? This will save ${store.getSettings().currency}${amount}/cycle.`)) {
            store.deleteSubscription(id);
            this.renderCurrentView();
            this.toast(`Subscription canceled! You saved ${store.getSettings().currency}${amount}`, 'success');
        }
    }

    // Purchase Simulator Engine
    runSimulation(e) {
        e.preventDefault();
        const name = document.getElementById('sim-item').value;
        const price = Number(document.getElementById('sim-price').value);
        const category = document.getElementById('sim-category').value;
        const priority = document.getElementById('sim-priority').value;

        const sim = store.simulatePurchase(price, category, priority);
        const currency = store.getSettings().currency;

        const cardContent = document.getElementById('sim-result-content');
        if (cardContent) {
            cardContent.innerHTML = `
                <div style="background:var(--bg); padding:16px; border-radius:12px; border-left:4px solid var(--emerald);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="font-size:1.1rem; font-weight:700;">${name}</h3>
                        <span class="${sim.recommendationClass}" style="font-size:0.9rem; font-weight:700; padding:4px 12px; border-radius:20px; background:var(--surface);">
                            ${sim.recommendation}
                        </span>
                    </div>
                    <div style="font-size:1.5rem; font-weight:700; color:var(--navy); margin-top:6px;">
                        ${currency}${sim.price.toLocaleString()}
                    </div>
                </div>

                <div class="grid-2">
                    <div style="background:var(--bg); padding:14px; border-radius:10px;">
                        <div style="font-size:0.8rem; color:var(--text-muted);">Net Balance After Purchase</div>
                        <div style="font-size:1.2rem; font-weight:700; color:${sim.netAfter < 0 ? 'var(--red)' : 'var(--text)'};">
                            ${currency}${sim.netAfter.toLocaleString()}
                        </div>
                    </div>
                    <div style="background:var(--bg); padding:14px; border-radius:10px;">
                        <div style="font-size:0.8rem; color:var(--text-muted);">Savings Goal Delay</div>
                        <div style="font-size:1.2rem; font-weight:700; color:var(--orange);">
                            +${sim.delayDays} Days
                        </div>
                    </div>
                </div>

                <div style="background:var(--navy-light); border:1px solid rgba(16,35,63,0.1); padding:16px; border-radius:12px;">
                    <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:4px;">💡 Cognitive HCI Feedback</h4>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">
                        ${sim.hciAdvice}
                    </p>
                </div>
            `;
        }
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data back to initial sample state?')) {
            store.resetAllData();
            this.applySettings(store.getSettings());
            this.renderCurrentView();
            this.toast('All sample data has been reset!', 'warning');
        }
    }

    toast(msg, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>💬</span><span>${msg}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
