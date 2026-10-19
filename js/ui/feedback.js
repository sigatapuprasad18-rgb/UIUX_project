/* MindWallet — Feedback & Notification UI Components (Floating Windows & Accessible Dialogs) */
import { store, escapeHtml } from '../store.js';

class FeedbackUI {
    constructor() {
        this.undoTimeout = null;
        this.activeDialogTrigger = null;
        this.dialogCallback = null;
    }

    /**
     * Action Toast with Real 8-Second Undo
     * @param {string} message - User-facing description
     * @param {'info'|'success'|'warning'|'danger'} type - Status theme
     * @param {Object} [undoAction] - Optional custom undo action override { label, onUndo }
     */
    showToast(message, type = 'info', undoAction = null) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        // Announce to screen reader polite live region
        const liveRegion = document.getElementById('a11y-live');
        if (liveRegion) {
            liveRegion.textContent = message;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('tabindex', '0');

        const hasUndo = undoAction || store.hasUndoAction();
        let actionBtnHtml = '';

        if (hasUndo) {
            const btnLabel = undoAction?.label || 'Undo';
            actionBtnHtml = `
                <button type="button" class="btn btn-sm toast-action-btn" aria-label="Undo last action: ${escapeHtml(message)}" style="background:#FFFFFF; color:var(--navy); font-weight:700; margin-left:8px; padding:4px 12px; border-radius:6px; cursor:pointer;">
                    ↩️ ${btnLabel}
                </button>
            `;
        }

        const iconMap = {
            success: '✅',
            warning: '⚠️',
            danger: '🚨',
            info: '💬'
        };

        toast.innerHTML = `
            <span aria-hidden="true">${iconMap[type] || '💬'}</span>
            <span class="toast-msg">${escapeHtml(message)}</span>
            ${actionBtnHtml}
            <button type="button" class="toast-dismiss-btn" aria-label="Dismiss notification">&times;</button>
        `;
        container.appendChild(toast);

        let remainingTime = hasUndo ? 8000 : 5000;
        let startTime = Date.now();
        let timer = null;

        const startTimer = () => {
            startTime = Date.now();
            timer = setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 250);
            }, remainingTime);
        };

        const pauseTimer = () => {
            if (timer) {
                clearTimeout(timer);
                remainingTime -= (Date.now() - startTime);
                if (remainingTime < 1000) remainingTime = 1000;
            }
        };

        toast.addEventListener('mouseenter', pauseTimer);
        toast.addEventListener('mouseleave', startTimer);
        toast.addEventListener('focusin', pauseTimer);
        toast.addEventListener('focusout', startTimer);

        toast.querySelector('.toast-dismiss-btn')?.addEventListener('click', () => {
            if (timer) clearTimeout(timer);
            toast.remove();
        });

        if (hasUndo) {
            toast.querySelector('.toast-action-btn')?.addEventListener('click', () => {
                if (timer) clearTimeout(timer);
                toast.remove();

                if (undoAction?.onUndo) {
                    undoAction.onUndo();
                } else {
                    const restoredDesc = store.undoLastAction();
                    if (window.app && typeof window.app.renderCurrentView === 'function') {
                        window.app.renderCurrentView();
                    }
                    this.showToast(`Undone: ${restoredDesc}`, 'success');
                }
            });
        }

        startTimer();
    }

    /**
     * Contextual Suggestion Card (Bottom-Right, Dismissible, Rule-Based)
     */
    checkAndShowContextualSuggestion() {
        const container = document.getElementById('floating-feedback-container');
        if (!container) return;

        // If a suggestion card or popover is already showing, do not stack
        if (container.querySelector('.floating-feedback-card') || container.querySelector('.what-changed-popover')) {
            return;
        }

        const suggestion = store.getContextualSuggestion();
        if (!suggestion) return;

        const card = document.createElement('div');
        card.className = 'floating-feedback-card';
        card.setAttribute('role', 'region');
        card.setAttribute('aria-label', 'Contextual Financial Suggestion');

        card.innerHTML = `
            <div class="floating-feedback-header">
                <div class="floating-feedback-title">
                    <span aria-hidden="true">${suggestion.icon || '💡'}</span>
                    <span>${escapeHtml(suggestion.title)}</span>
                </div>
                <button type="button" class="close-btn" aria-label="Close suggestion" style="font-size:1.1rem; padding:2px 6px;">&times;</button>
            </div>
            <div class="floating-feedback-body">
                ${escapeHtml(suggestion.message)}
            </div>
            <div class="floating-feedback-actions">
                <button type="button" class="btn btn-outline btn-sm btn-dismiss-perm" style="font-size:0.78rem;">Don't show again</button>
                <button type="button" class="btn btn-secondary btn-sm btn-dismiss-temp">Not now</button>
                ${suggestion.actionRoute ? `<a href="${suggestion.actionRoute}" class="btn btn-primary btn-sm btn-act-now">${escapeHtml(suggestion.actionText || 'Take Action')}</a>` : ''}
            </div>
        `;

        container.appendChild(card);

        // Announce politely
        const liveRegion = document.getElementById('a11y-live');
        if (liveRegion) {
            liveRegion.textContent = `Suggestion: ${suggestion.title}. ${suggestion.message}`;
        }

        card.querySelector('.close-btn')?.addEventListener('click', () => {
            store.dismissSuggestion(suggestion.id, false);
            card.remove();
        });

        card.querySelector('.btn-dismiss-temp')?.addEventListener('click', () => {
            store.dismissSuggestion(suggestion.id, false);
            card.remove();
        });

        card.querySelector('.btn-dismiss-perm')?.addEventListener('click', () => {
            store.dismissSuggestion(suggestion.id, true);
            card.remove();
            this.showToast('Suggestion preference saved.', 'info');
        });

        card.querySelector('.btn-act-now')?.addEventListener('click', () => {
            card.remove();
        });
    }

    /**
     * "What Changed" Popover after persona or modifier switch
     * @param {string} previousPersona 
     * @param {string} newPersona 
     * @param {Array<string>} changesList - List of human-readable changes
     * @param {Function} onRevert - Callback to revert change
     */
    showWhatChangedPopover(previousPersona, newPersona, changesList, onRevert) {
        const container = document.getElementById('floating-feedback-container');
        if (!container) return;

        // Clean up previous
        container.querySelectorAll('.what-changed-popover').forEach(el => el.remove());

        const popover = document.createElement('div');
        popover.className = 'what-changed-popover';
        popover.setAttribute('role', 'region');
        popover.setAttribute('aria-label', 'Persona layout and setting changes');

        const itemsHtml = changesList.map(c => `<li>${escapeHtml(c)}</li>`).join('');

        popover.innerHTML = `
            <div class="floating-feedback-header">
                <div class="floating-feedback-title">
                    <span aria-hidden="true">🔄</span>
                    <span>Switched to ${escapeHtml(newPersona)}</span>
                </div>
                <button type="button" class="close-btn" aria-label="Close what changed notification">&times;</button>
            </div>
            <p style="font-size:0.83rem; color:var(--text-muted); margin:6px 0 2px;">
                The following interface adaptations were applied:
            </p>
            <ul class="what-changed-list">
                ${itemsHtml}
            </ul>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                <button type="button" class="btn btn-outline btn-sm btn-revert" style="color:var(--danger-text); border-color:var(--border-strong);">
                    <span aria-hidden="true">↩️</span> Revert to ${escapeHtml(previousPersona)}
                </button>
                <button type="button" class="btn btn-primary btn-sm btn-keep">
                    Looks Good
                </button>
            </div>
        `;

        container.appendChild(popover);

        popover.querySelector('.close-btn')?.addEventListener('click', () => popover.remove());
        popover.querySelector('.btn-keep')?.addEventListener('click', () => popover.remove());

        popover.querySelector('.btn-revert')?.addEventListener('click', () => {
            popover.remove();
            if (typeof onRevert === 'function') {
                onRevert();
            }
        });

        // Auto close after 16 seconds if user doesn't interact
        setTimeout(() => {
            if (popover.parentNode) popover.remove();
        }, 16000);
    }

    /**
     * Accessible Modal Dialog replacing browser window.confirm and window.prompt
     */
    openDialog({
        title,
        message,
        mode = 'confirm', // 'confirm' | 'prompt'
        inputType = 'text',
        inputValue = '',
        inputLabel = 'Value',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        isDanger = false,
        onConfirm
    }) {
        this.activeDialogTrigger = document.activeElement;
        const modal = document.getElementById('modal-action-dialog');
        if (!modal) return;

        const titleEl = document.getElementById('action-dialog-title');
        const descEl = document.getElementById('action-dialog-desc');
        const errorEl = document.getElementById('action-dialog-error');
        const inputGroup = document.getElementById('action-dialog-input-group');
        const inputEl = document.getElementById('action-dialog-input');
        const labelEl = document.getElementById('action-dialog-input-label');
        const confirmBtn = document.getElementById('action-dialog-confirm');
        const cancelBtn = document.getElementById('action-dialog-cancel');

        titleEl.textContent = title;
        descEl.textContent = message;

        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }

        if (mode === 'prompt') {
            inputGroup.style.display = 'block';
            inputEl.type = inputType;
            inputEl.value = inputValue;
            labelEl.textContent = inputLabel;
            inputEl.setAttribute('aria-label', inputLabel);
        } else {
            inputGroup.style.display = 'none';
        }

        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;

        if (isDanger) {
            confirmBtn.className = 'btn btn-danger';
        } else {
            confirmBtn.className = 'btn btn-primary';
        }

        modal.classList.add('open');
        if (window.app) {
            window.app.activeModal = modal;
        }

        // Focus management
        setTimeout(() => {
            if (mode === 'prompt' && inputEl) {
                inputEl.focus();
                inputEl.select();
            } else {
                confirmBtn.focus();
            }
        }, 50);

        this.dialogCallback = onConfirm;
    }

    closeDialog() {
        const modal = document.getElementById('modal-action-dialog');
        if (modal) modal.classList.remove('open');
        if (window.app && window.app.activeModal === modal) {
            window.app.activeModal = null;
        }
        this.dialogCallback = null;

        // Restore focus to triggering control
        if (this.activeDialogTrigger && typeof this.activeDialogTrigger.focus === 'function') {
            this.activeDialogTrigger.focus();
            this.activeDialogTrigger = null;
        }
    }

    handleDialogSubmit(e) {
        e.preventDefault();
        const inputGroup = document.getElementById('action-dialog-input-group');
        const isPrompt = inputGroup && inputGroup.style.display !== 'none';
        const inputEl = document.getElementById('action-dialog-input');
        const value = isPrompt ? inputEl.value : true;

        if (this.dialogCallback) {
            const success = this.dialogCallback(value);
            if (success === false) return; // Keep dialog open if validation failed
        }
        this.closeDialog();
    }
}

export const feedback = new FeedbackUI();
