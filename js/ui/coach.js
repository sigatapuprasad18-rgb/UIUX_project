/* MindWallet — AI Financial Coach & Cognitive HCI (js/ui/coach.js) */
import { store, escapeHtml } from '../store.js';

class CoachCardManager {
    constructor() {
        this.queue = [];
        this.currentCard = null;
        this.timer = null;
        this.startTime = 0;
        this.remainingTime = 10000;
        this.isPaused = false;
        this.containerId = 'floating-feedback-container';
    }

    /**
     * Show or queue a coach card
     * @param {Object} options
     * @param {string} options.title - Header text
     * @param {string} options.message - Descriptive text explaining what changed and why
     * @param {string} [options.icon='🤖'] - Visual icon
     * @param {'info'|'success'|'warning'|'critical'|'tip'} [options.type='info'] - Status theme
     * @param {boolean} [options.isWarning=false] - If true, persists until manually dismissed
     * @param {number} [options.duration=10000] - Timer duration in ms (minimum 10000)
     * @param {Object} [options.undoAction] - Optional undo definition { label, onUndo }
     * @param {string} [options.dismissLabel='Got It'] - Dismiss button label
     * @param {string} [options.permDismissKey] - Storage key to avoid showing tip again
     * @param {string} [options.actionRoute] - Optional route link (e.g. '#budget')
     * @param {string} [options.actionLabel] - Route link label
     */
    show(options) {
        if (!options || !options.message) return;

        // Strictly suppress coach cards on login view or unauthenticated sessions
        if (!store.getCurrentUser() || (window.app && window.app.currentView === 'login')) {
            return;
        }

        // Respect permanent dismissal for section tips
        if (options.permDismissKey && store.isDismissed(options.permDismissKey)) {
            return;
        }

        const cardItem = {
            id: 'coach-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            title: options.title || 'Financial Coach Update',
            message: options.message,
            icon: options.icon || (options.type === 'warning' ? '⚠️' : options.type === 'critical' ? '🚨' : options.type === 'tip' ? '💡' : '🤖'),
            type: options.type || 'info',
            isWarning: !!options.isWarning,
            duration: Math.max(10000, options.duration || 10000),
            undoAction: options.undoAction || null,
            dismissLabel: options.dismissLabel || 'Got It',
            permDismissKey: options.permDismissKey || null,
            actionRoute: options.actionRoute || null,
            actionLabel: options.actionLabel || null
        };

        if (this.currentCard) {
            this.queue.push(cardItem);
        } else {
            this.displayCard(cardItem);
        }
    }

    clearAll() {
        this.queue = [];
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.currentCard = null;
        const existing = document.getElementById('active-coach-card');
        if (existing) existing.remove();
    }

    displayCard(cardItem) {
        // Strictly suppress display if user navigated to login or logged out
        if (!store.getCurrentUser() || (window.app && window.app.currentView === 'login')) {
            this.clearAll();
            return;
        }

        this.currentCard = cardItem;
        const container = document.getElementById(this.containerId) || document.body;

        // Dismiss any existing contextual suggestion to prevent bottom-right clutter
        const existingSuggestion = container.querySelector('.floating-feedback-card');
        if (existingSuggestion) existingSuggestion.remove();

        // Clean up any existing card element
        const existing = document.getElementById('active-coach-card');
        if (existing) existing.remove();

        const card = document.createElement('div');
        card.id = 'active-coach-card';
        card.className = `coach-card coach-type-${cardItem.type} ${cardItem.isWarning ? 'is-warning-card' : ''}`;
        card.setAttribute('role', 'status');
        card.setAttribute('aria-live', 'polite');
        card.setAttribute('tabindex', '0');

        let undoHtml = '';
        if (cardItem.undoAction) {
            undoHtml = `
                <button type="button" class="btn btn-outline btn-sm coach-undo-btn" aria-label="Undo action: ${escapeHtml(cardItem.undoAction.label || 'Undo')}">
                    <span aria-hidden="true">↩️</span> ${escapeHtml(cardItem.undoAction.label || 'Undo')}
                </button>
            `;
        }

        let routeHtml = '';
        if (cardItem.actionRoute) {
            routeHtml = `
                <a href="${cardItem.actionRoute}" class="btn btn-primary btn-sm coach-action-btn">
                    ${escapeHtml(cardItem.actionLabel || 'Inspect')} →
                </a>
            `;
        }

        let permDismissHtml = '';
        if (cardItem.permDismissKey) {
            permDismissHtml = `
                <button type="button" class="btn btn-ghost btn-sm coach-perm-dismiss" style="font-size:0.75rem; color:var(--text-muted);">
                    Don't show again
                </button>
            `;
        }

        card.innerHTML = `
            <div class="coach-card-header">
                <div class="coach-card-title-group">
                    <span class="coach-card-icon" aria-hidden="true">${cardItem.icon}</span>
                    <strong class="coach-card-title">${escapeHtml(cardItem.title)}</strong>
                </div>
                <button type="button" class="close-btn coach-dismiss-x" aria-label="Dismiss coach recommendation">&times;</button>
            </div>
            <div class="coach-card-body">
                ${cardItem.message}
            </div>
            <div class="coach-card-actions">
                ${permDismissHtml}
                <div style="display:flex; gap:8px; align-items:center;">
                    ${undoHtml}
                    ${routeHtml}
                    <button type="button" class="btn btn-secondary btn-sm coach-dismiss-btn">
                        ${escapeHtml(cardItem.dismissLabel)}
                    </button>
                </div>
            </div>
            ${!cardItem.isWarning ? '<div class="coach-progress-bar" aria-hidden="true"><div class="coach-progress-inner"></div></div>' : ''}
        `;

        container.appendChild(card);

        // Polite live announcement for screen readers
        const a11yLive = document.getElementById('a11y-live');
        if (a11yLive) {
            // Strip HTML for clean voiceover
            const plainText = (cardItem.message || '').replace(/<[^>]*>/g, '');
            a11yLive.textContent = `Coach notice: ${cardItem.title}. ${plainText}`;
        }

        // Attach action handlers
        card.querySelector('.coach-dismiss-x')?.addEventListener('click', () => this.dismissCurrent());
        card.querySelector('.coach-dismiss-btn')?.addEventListener('click', () => this.dismissCurrent());
        card.querySelector('.coach-action-btn')?.addEventListener('click', () => this.dismissCurrent());

        if (cardItem.permDismissKey) {
            card.querySelector('.coach-perm-dismiss')?.addEventListener('click', () => {
                store.dismissSuggestion(cardItem.permDismissKey, true);
                this.dismissCurrent();
            });
        }

        if (cardItem.undoAction) {
            card.querySelector('.coach-undo-btn')?.addEventListener('click', () => {
                this.dismissCurrent();
                if (typeof cardItem.undoAction.onUndo === 'function') {
                    cardItem.undoAction.onUndo();
                } else {
                    const restoredMsg = store.undoLastAction();
                    if (window.app && typeof window.app.renderCurrentView === 'function') {
                        window.app.renderCurrentView();
                    }
                    this.show({
                        title: 'Action Reversed',
                        message: restoredMsg,
                        type: 'info',
                        duration: 8000
                    });
                }
            });
        }

        // If not a permanent warning, setup timer & progress bar with hover/focus pause
        if (!cardItem.isWarning) {
            this.setupTimer(card, cardItem.duration);
        }
    }

    setupTimer(cardEl, duration) {
        this.remainingTime = duration;
        this.startTime = Date.now();
        this.isPaused = false;

        const progressInner = cardEl.querySelector('.coach-progress-inner');
        if (progressInner) {
            progressInner.style.transition = `width ${duration}ms linear`;
            requestAnimationFrame(() => {
                progressInner.style.width = '0%';
            });
        }

        const start = () => {
            if (this.timer) clearTimeout(this.timer);
            this.startTime = Date.now();
            this.isPaused = false;
            if (progressInner) {
                progressInner.style.transition = `width ${this.remainingTime}ms linear`;
                progressInner.style.width = '0%';
            }
            this.timer = setTimeout(() => {
                this.dismissCurrent();
            }, this.remainingTime);
        };

        const pause = () => {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            if (!this.isPaused) {
                this.remainingTime -= (Date.now() - this.startTime);
                if (this.remainingTime < 1000) this.remainingTime = 1000;
                this.isPaused = true;
                if (progressInner) {
                    const computedWidth = window.getComputedStyle(progressInner).width;
                    progressInner.style.transition = 'none';
                    progressInner.style.width = computedWidth;
                }
            }
        };

        cardEl.addEventListener('mouseenter', pause);
        cardEl.addEventListener('mouseleave', () => {
            if (this.isPaused) start();
        });
        cardEl.addEventListener('focusin', pause);
        cardEl.addEventListener('focusout', () => {
            if (this.isPaused) start();
        });

        start();
    }

    dismissCurrent() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        const card = document.getElementById('active-coach-card');
        if (card) {
            card.classList.add('coach-fade-out');
            setTimeout(() => {
                card.remove();
                this.currentCard = null;
                // Dequeue next card if available
                if (this.queue.length > 0) {
                    const next = this.queue.shift();
                    setTimeout(() => this.displayCard(next), 250);
                }
            }, 200);
        } else {
            this.currentCard = null;
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                this.displayCard(next);
            }
        }
    }

    // --- Dedicated Trigger Methods ---

    /**
     * Triggered after adding a transaction (showing budget % and health score delta)
     */
    onTransactionAdded(tx, beforeState, afterState) {
        const currency = store.getSettings().currency || '₹';
        const isExpense = tx.type === 'expense';
        const scoreDelta = afterState.health - beforeState.health;
        const deltaFormatted = scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`;

        let changeDetail = '';
        let isWarning = false;

        if (isExpense) {
            const catName = escapeHtml(tx.category);
            changeDetail = `<strong>${catName}</strong> budget capacity reached <strong>${afterState.catPct}%</strong> (${currency}${afterState.catSpent.toLocaleString()} of ${currency}${afterState.catLimit.toLocaleString()}).`;
            if (afterState.catPct >= 90) {
                isWarning = true;
            }
        } else {
            changeDetail = `Added <strong>+${currency}${Number(tx.amount).toLocaleString()}</strong> income to monthly cashflow.`;
        }

        const healthMsg = `Health Score: <strong>${beforeState.health} → ${afterState.health}</strong> (${deltaFormatted} pts).`;

        this.show({
            title: isExpense ? 'Expense Recorded' : 'Income Logged',
            message: `${changeDetail} ${healthMsg}`,
            icon: isExpense ? '💳' : '💼',
            type: isWarning ? 'warning' : 'success',
            isWarning,
            duration: 12000,
            undoAction: {
                label: 'Undo Transaction',
                onUndo: () => {
                    store.deleteTransaction(tx.id);
                    if (window.app && typeof window.app.renderCurrentView === 'function') {
                        window.app.renderCurrentView();
                        window.app.updateNotificationsUI();
                    }
                    this.show({
                        title: 'Transaction Undone',
                        message: `Reversed ${currency}${tx.amount} entry for ${escapeHtml(tx.merchant || tx.category)}.`,
                        type: 'info',
                        duration: 8000
                    });
                }
            }
        });
    }

    /**
     * Triggered after deleting a transaction
     */
    onTransactionDeleted(tx) {
        const currency = store.getSettings().currency || '₹';
        this.show({
            title: 'Transaction Removed',
            message: `Deleted ${currency}${Number(tx.amount).toLocaleString()} (${escapeHtml(tx.merchant || tx.category)}).`,
            icon: '🗑️',
            type: 'info',
            duration: 10000,
            undoAction: {
                label: 'Restore',
                onUndo: () => {
                    store.addTransaction(tx);
                    if (window.app && typeof window.app.renderCurrentView === 'function') {
                        window.app.renderCurrentView();
                        window.app.updateNotificationsUI();
                    }
                }
            }
        });
    }

    /**
     * Triggered after updating a budget limit
     */
    onBudgetUpdated(category, oldLimit, newLimit) {
        const currency = store.getSettings().currency || '₹';
        this.show({
            title: `${escapeHtml(category)} Budget Updated`,
            message: `Monthly threshold changed from ${currency}${oldLimit.toLocaleString()} to <strong>${currency}${newLimit.toLocaleString()}</strong>.`,
            icon: '📊',
            type: 'info',
            duration: 10000,
            undoAction: {
                label: 'Revert Limit',
                onUndo: () => {
                    store.updateBudget(category, oldLimit);
                    if (window.app && typeof window.app.renderCurrentView === 'function') {
                        window.app.renderCurrentView();
                    }
                }
            }
        });
    }

    /**
     * Triggered after depositing to a savings goal
     */
    onGoalDeposited(goalId, goalName, amount, newPct) {
        const currency = store.getSettings().currency || '₹';
        this.show({
            title: 'Goal Deposit Added',
            message: `Deposited <strong>${currency}${amount.toLocaleString()}</strong> into "${escapeHtml(goalName)}". Goal is now <strong>${newPct}%</strong> funded!`,
            icon: '🎯',
            type: 'success',
            duration: 12000,
            undoAction: {
                label: 'Undo Deposit',
                onUndo: () => {
                    store.undoLastAction();
                    if (window.app && typeof window.app.renderCurrentView === 'function') {
                        window.app.renderCurrentView();
                    }
                }
            }
        });
    }

    /**
     * Triggered after changing a persona or mode
     */
    onPersonaChanged(previousPersona, newPersona, changesList, onRevert) {
        const changesText = changesList && changesList.length 
            ? changesList.slice(0, 3).map(c => escapeHtml(c)).join(' • ')
            : 'Interface defaults and layout priorities adapted.';

        this.show({
            title: `Persona Adapted: ${escapeHtml(newPersona)}`,
            message: changesText,
            icon: '👤',
            type: 'info',
            duration: 14000,
            undoAction: {
                label: `Revert to ${previousPersona}`,
                onUndo: onRevert
            }
        });
    }

    /**
     * Triggered upon first visit to a new section (with "Don't show again")
     */
    onSectionVisit(sectionKey) {
        if (!sectionKey || sectionKey === 'login' || !store.getCurrentUser() || (window.app && window.app.currentView === 'login')) {
            return;
        }

        const visitedKey = `mindwallet_visited_${sectionKey}`;
        if (localStorage.getItem(visitedKey) === 'true') {
            return;
        }

        const tips = {
            dashboard: {
                title: 'Welcome to Your Dashboard',
                message: 'Your Tier 1 overview shows "Money Left" after living expenses and prioritized next best actions.',
                icon: '🏠'
            },
            activity: {
                title: 'Activity Tracker Tip',
                message: 'Track income, expenses, and view monthly statements. Every log action supports real 8-second undo.',
                icon: '💳'
            },
            plan: {
                title: 'Financial Planning Tip',
                message: 'Balance category thresholds, savings goals, and recurring subscriptions to prevent paycheck leakage.',
                icon: '📊'
            },
            insights: {
                title: 'Cognitive Insights Tip',
                message: 'Multi-factor health diagnostics and pre-purchase simulator with cooling-off deliberation buffer.',
                icon: '💡'
            },
            settings: {
                title: 'Settings & Personas Tip',
                message: 'Customize personas, dyslexic font, high contrast, and colorblind-safe palettes without losing data.',
                icon: '⚙️'
            }
        };

        const tip = tips[sectionKey];
        if (!tip) return;

        localStorage.setItem(visitedKey, 'true');

        setTimeout(() => {
            this.show({
                title: tip.title,
                message: tip.message,
                icon: tip.icon,
                type: 'tip',
                duration: 12000,
                dismissLabel: 'Got It',
                permDismissKey: `tip_perm_${sectionKey}`
            });
        }, 1200);
    }
}

export const coach = new CoachCardManager();
window.coach = coach;
