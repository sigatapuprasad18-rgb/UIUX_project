/* MindWallet — Central Store & Persistence Layer (Async-Ready Data Store) */
import { PERSONA_PRESETS, getPersona, getAllPersonas, resolvePersonaKey } from './personas.js';
import { api } from './api.js';

export { PERSONA_PRESETS, getPersona, getAllPersonas, resolvePersonaKey, api };

const STORAGE_KEYS = {
    TRANSACTIONS: 'mindwallet_transactions',
    BUDGETS: 'mindwallet_budgets',
    GOALS: 'mindwallet_goals',
    SUBSCRIPTIONS: 'mindwallet_subscriptions',
    NOTIFICATIONS: 'mindwallet_notifications',
    SETTINGS: 'mindwallet_settings',
    AUTH: 'mindwallet_auth',
    DEPOSITS: 'mindwallet_deposits',
    DISMISSED_SUGGESTIONS: 'mindwallet_dismissed_suggestions',
    SIMULATION_LOG: 'mindwallet_simulation_log',
    READ_NOTIFICATIONS: 'mindwallet_read_notifications',
    ONBOARDING_COMPLETED: 'mindwallet_onboarding_completed'
};

const getRelativeDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
};

export const CATEGORY_ICONS = {
    'Income': '💼',
    'Salary / Income': '💼',
    'Groceries': '🛒',
    'Housing': '🏠',
    'Utilities': '⚡',
    'Dining out': '🍔',
    'Subscriptions': '🔁',
    'Entertainment': '🎟️',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Tech': '💻',
    'Health': '🏋️',
    'Healthcare': '🏥',
    'Investments': '📈',
    'Savings Transfer': '🎯',
    'Travel': '🏔️',
    'Safety': '🛡️',
    'Books & Supplies': '📚',
    'Gifts & Family': '🎁',
    'Home & Gardening': '🌸',
    'Other': '💳'
};

const INITIAL_SETTINGS = {
    persona: 'student',
    monthlyIncome: 18000,
    currency: '₹',
    mode: 'standard', // standard | accessible | senior | simplified
    highContrast: false,
    darkMode: false,
    reducedMotion: false,
    fontSizeStep: 0,
    soundEnabled: true,
    dyslexicFont: false,
    colorblindMode: 'none', // none | protanopia | deuteranopia | tritanopia
    coolingOffHours: 24,
    coolingOffEnabled: true,
    dashboardEmphasis: 'afford',
    coachTone: 'supportive',
    modifierLowVision: false,
    modifierColorBlind: false,
    modifierMotor: false,
    modifierCognitive: false,
    modifierScreenReader: false,
    modifierDyslexia: false
};

class Store {
    constructor() {
        this.undoStack = [];
        this.lastAction = null;
        this.init();
    }

    init() {
        const storedSettings = this.safeParse(STORAGE_KEYS.SETTINGS, null);
        const activePersona = resolvePersonaKey(storedSettings?.persona || 'student');
        const defaultPreset = PERSONA_PRESETS[activePersona] || PERSONA_PRESETS.student;

        if (!storedSettings) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...INITIAL_SETTINGS, persona: activePersona, monthlyIncome: defaultPreset.income || 18000 }));
        } else if (storedSettings.persona !== activePersona) {
            storedSettings.persona = activePersona;
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storedSettings));
        }

        // Initialize dedicated, isolated profile snapshots for all 4 personas if not yet present
        const allProfiles = ['student', 'working_professional', 'elderly_retiree', 'goal_saver'];
        allProfiles.forEach(pKey => {
            const snapKey = `mindwallet_profile_${pKey}_data`;
            if (!localStorage.getItem(snapKey)) {
                const preset = PERSONA_PRESETS[pKey] || PERSONA_PRESETS.student;
                const snap = {
                    transactions: preset.starterData.transactions,
                    budgets: preset.starterData.budgets,
                    goals: preset.starterData.goals,
                    subscriptions: preset.starterData.subscriptions,
                    deposits: [
                        {
                            id: `dep-${pKey}-1`,
                            goalId: preset.starterData?.goals?.[0]?.id || 'g-1',
                            goalName: preset.starterData?.goals?.[0]?.name || 'Primary Reserve',
                            amount: pKey === 'student' ? 1500 : (pKey === 'working_professional' ? 10000 : (pKey === 'elderly_retiree' ? 2000 : 25000)),
                            date: getRelativeDate(-2)
                        }
                    ],
                    simulationLog: []
                };
                localStorage.setItem(snapKey, JSON.stringify(snap));
            }
        });

        // Load active persona's isolated data into active storage
        this.loadProfileSnapshot(activePersona);
    }

    safeParse(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            if (parsed === null || parsed === undefined) return fallback;
            // Validate expected type matches fallback structure
            if (Array.isArray(fallback) && !Array.isArray(parsed)) {
                console.warn(`[MindWallet Store] Key "${key}" expected Array, got ${typeof parsed}. Falling back.`);
                return fallback;
            }
            if (fallback && typeof fallback === 'object' && !Array.isArray(fallback) && (typeof parsed !== 'object' || Array.isArray(parsed))) {
                console.warn(`[MindWallet Store] Key "${key}" expected Object, got ${typeof parsed}. Falling back.`);
                return fallback;
            }
            return parsed;
        } catch (e) {
            console.warn(`[MindWallet Store] Parse failed for "${key}". Falling back.`, e);
            return fallback;
        }
    }

    // --- Undo Management (Stack of up to 10 Reversible Actions) ---
    recordAction(action) {
        const item = {
            ...action,
            id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            timestamp: Date.now()
        };
        this.undoStack.push(item);
        if (this.undoStack.length > 10) {
            this.undoStack.shift();
        }
        this.lastAction = item;
        return item;
    }

    hasUndoAction() {
        if (!this.undoStack.length) return false;
        const top = this.undoStack[this.undoStack.length - 1];
        return (Date.now() - top.timestamp) < 60000; // 60s active window
    }

    peekLastAction() {
        return this.undoStack.length ? this.undoStack[this.undoStack.length - 1] : null;
    }

    undoLastAction() {
        if (!this.undoStack.length) return 'No action to undo';
        const action = this.undoStack.pop();
        this.lastAction = this.undoStack.length ? this.undoStack[this.undoStack.length - 1] : null;

        if (action.type === 'add-transaction') {
            const txs = this.getTransactions();
            const idx = txs.findIndex(t => t.id === action.data.id);
            if (idx !== -1) {
                txs.splice(idx, 1);
                localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
            }
            return `Transaction "${action.data.merchant || action.data.category}" reversed`;
        } else if (action.type === 'delete-transaction') {
            const txs = this.getTransactions();
            txs.unshift(action.data);
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
            return `Transaction "${action.data.merchant || action.data.category}" restored`;
        } else if (action.type === 'delete-subscription') {
            const subs = this.getSubscriptions();
            subs.push(action.data);
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
            return `Subscription "${action.data.name}" restored`;
        } else if (action.type === 'update-budget') {
            const budgets = this.getBudgets();
            const b = budgets.find(item => item.category.toLowerCase() === action.category.toLowerCase());
            if (b) {
                b.limit = action.previousLimit;
                localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
            }
            return `Budget for ${action.category} restored to ₹${action.previousLimit.toLocaleString()}`;
        } else if (action.type === 'deposit-goal') {
            const goals = this.getGoals();
            const g = goals.find(item => item.id === action.id);
            if (g) {
                g.current = Math.max(0, g.current - action.amount);
                localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
            }
            const deposits = this.safeParse(STORAGE_KEYS.DEPOSITS, []);
            const depIdx = deposits.findIndex(d => d.goalId === action.id && d.amount === action.amount);
            if (depIdx !== -1) {
                deposits.splice(depIdx, 1);
                localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
            }
            // Reverse corresponding transaction
            const txs = this.getTransactions();
            const txIdx = txs.findIndex(t => t.id === action.txId || (t.merchant === `Deposit: ${action.name}` && Number(t.amount) === action.amount));
            if (txIdx !== -1) {
                txs.splice(txIdx, 1);
                localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
            }
            this.saveCurrentProfileSnapshot();
            return `Deposit of ₹${action.amount.toLocaleString()} into "${action.name}" reversed`;
        } else if (action.type === 'change-persona' || action.type === 'change-mode') {
            if (action.previousPersona) {
                this.applyPersona(action.previousPersona, {}, true, true);
            }
            if (action.previousSettings) {
                const mergedSettings = { ...this.getSettings(), ...action.previousSettings, persona: action.previousPersona };
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
            }
            const revertedName = PERSONA_PRESETS[action.previousPersona]?.name || (action.previousPersona ? action.previousPersona.replace('_', ' ') : 'previous configuration');
            return `Reverted to profile: ${revertedName}`;
        }

        return 'Action reversed';
    }

    // --- Transactions API ---
    getTransactions() {
        const activePersona = resolvePersonaKey(this.getSettings().persona || 'student');
        const fallback = PERSONA_PRESETS[activePersona]?.starterData?.transactions || PERSONA_PRESETS.student.starterData.transactions;
        return this.safeParse(STORAGE_KEYS.TRANSACTIONS, fallback);
    }

    getMonthTransactions(targetDate = new Date()) {
        const allTxs = this.getTransactions();
        if (!allTxs.length) return [];

        const d = targetDate instanceof Date ? targetDate : new Date(targetDate);
        const year = d.getFullYear();
        const month = d.getMonth();

        const currentMonthTxs = allTxs.filter(t => {
            if (!t.date) return false;
            const parts = t.date.split('-');
            if (parts.length < 2) return false;
            const tYear = parseInt(parts[0], 10);
            const tMonth = parseInt(parts[1], 10) - 1;
            return tYear === year && tMonth === month;
        });

        // If targetDate was default new Date() and yielded 0 transactions, but profile transactions exist,
        // match the active/most recent transaction month so budget, dashboard, and analytics stay alive!
        if (currentMonthTxs.length === 0 && allTxs.length > 0) {
            const sorted = [...allTxs].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            const latestDate = sorted[0]?.date;
            if (latestDate) {
                const parts = latestDate.split('-');
                if (parts.length >= 2) {
                    const fallbackYear = parseInt(parts[0], 10);
                    const fallbackMonth = parseInt(parts[1], 10) - 1;
                    return allTxs.filter(t => {
                        if (!t.date) return false;
                        const p = t.date.split('-');
                        return parseInt(p[0], 10) === fallbackYear && (parseInt(p[1], 10) - 1) === fallbackMonth;
                    });
                }
            }
        }

        return currentMonthTxs;
    }

    addTransaction(tx) {
        const txs = this.getTransactions();
        tx.id = tx.id || 'tx-' + Date.now();
        tx.icon = tx.icon || CATEGORY_ICONS[tx.category] || '💳';
        txs.unshift(tx);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
        this.saveCurrentProfileSnapshot();

        // Record for undo
        this.recordAction({
            type: 'add-transaction',
            data: tx
        });
        this.syncWithCloud();
        return tx;
    }

    deleteTransaction(id) {
        const txs = this.getTransactions();
        const index = txs.findIndex(t => t.id === id);
        if (index === -1) return null;

        const removedTx = txs.splice(index, 1)[0];
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
        this.saveCurrentProfileSnapshot();

        // Record for 8s undo
        this.recordAction({
            type: 'delete-transaction',
            data: removedTx
        });
        this.syncWithCloud();
        return removedTx;
    }

    // --- Budgets API ---
    getBudgets() {
        const activePersona = resolvePersonaKey(this.getSettings().persona || 'student');
        const fallback = PERSONA_PRESETS[activePersona]?.starterData?.budgets || PERSONA_PRESETS.student.starterData.budgets;
        return this.safeParse(STORAGE_KEYS.BUDGETS, fallback);
    }

    updateBudget(category, limit) {
        const budgets = this.getBudgets();
        const index = budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());
        const previousLimit = index !== -1 ? budgets[index].limit : limit;

        if (index !== -1) {
            budgets[index].limit = Number(limit);
        } else {
            budgets.push({
                id: 'b-' + Date.now(),
                category,
                limit: Number(limit),
                icon: CATEGORY_ICONS[category] || '📌'
            });
        }
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
        this.saveCurrentProfileSnapshot();

        this.recordAction({
            type: 'update-budget',
            category,
            previousLimit,
            newLimit: limit
        });
        this.syncWithCloud();
        return budgets;
    }

    // --- Goals API ---
    getGoals() {
        const activePersona = resolvePersonaKey(this.getSettings().persona || 'student');
        const fallback = PERSONA_PRESETS[activePersona]?.starterData?.goals || PERSONA_PRESETS.student.starterData.goals;
        return this.safeParse(STORAGE_KEYS.GOALS, fallback);
    }

    addGoal(goal) {
        const goals = this.getGoals();
        goal.id = goal.id || 'g-' + Date.now();
        goal.icon = goal.icon || CATEGORY_ICONS[goal.category] || '🎯';
        goals.push(goal);
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        this.saveCurrentProfileSnapshot();
        this.syncWithCloud();
        return goal;
    }

    updateGoalDeposit(id, amount) {
        const goals = this.getGoals();
        const g = goals.find(item => item.id === id);
        if (g) {
            const depositAmt = Number(amount);
            g.current += depositAmt;
            localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));

            // Record this month deposit entry
            const deposits = this.safeParse(STORAGE_KEYS.DEPOSITS, []);
            deposits.unshift({
                id: 'dep-' + Date.now(),
                goalId: id,
                goalName: g.name,
                amount: depositAmt,
                date: new Date().toISOString().split('T')[0]
            });
            localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));

            // Automatically log matching expense transaction so Activity, Plan, and Dashboard stay in sync
            const depTx = {
                id: 'tx-dep-' + Date.now(),
                merchant: `Deposit: ${g.name}`,
                category: 'Savings Transfer',
                amount: depositAmt,
                type: 'expense',
                date: new Date().toISOString().split('T')[0],
                icon: '🎯',
                iconBg: '#E4F5EE',
                iconColor: 'var(--emerald)',
                necessity: 'essential',
                notes: `Savings goal contribution towards ${g.name}`
            };
            const txs = this.getTransactions();
            txs.unshift(depTx);
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

            this.saveCurrentProfileSnapshot();

            this.recordAction({
                type: 'deposit-goal',
                id,
                name: g.name,
                amount: depositAmt,
                txId: depTx.id
            });
            this.syncWithCloud();
        }
        return g;
    }

    getSavedThisMonth(targetDate = new Date()) {
        const deposits = this.safeParse(STORAGE_KEYS.DEPOSITS, []);
        const d = targetDate instanceof Date ? targetDate : new Date(targetDate);
        const curYearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        return deposits
            .filter(dep => (dep.date || '').startsWith(curYearMonth))
            .reduce((sum, dep) => sum + Number(dep.amount), 0);
    }

    // --- Subscriptions API ---
    getSubscriptions() {
        const activePersona = resolvePersonaKey(this.getSettings().persona || 'student');
        const fallback = PERSONA_PRESETS[activePersona]?.starterData?.subscriptions || PERSONA_PRESETS.student.starterData.subscriptions;
        return this.safeParse(STORAGE_KEYS.SUBSCRIPTIONS, fallback);
    }

    getMonthlySubscriptionCost() {
        const subs = this.getSubscriptions();
        return subs.reduce((acc, s) => {
            const amt = Number(s.amount) || 0;
            return acc + (s.cycle === 'Annual' ? amt / 12 : amt);
        }, 0);
    }

    addSubscription(sub) {
        const subs = this.getSubscriptions();
        sub.id = sub.id || 's-' + Date.now();
        sub.icon = sub.icon || CATEGORY_ICONS[sub.category] || '📦';
        subs.push(sub);
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
        this.saveCurrentProfileSnapshot();
        this.syncWithCloud();
        return sub;
    }

    deleteSubscription(id) {
        const subs = this.getSubscriptions();
        const index = subs.findIndex(s => s.id === id);
        if (index === -1) return null;

        const removedSub = subs.splice(index, 1)[0];
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
        this.saveCurrentProfileSnapshot();

        this.recordAction({
            type: 'delete-subscription',
            data: removedSub
        });
        this.syncWithCloud();
        return removedSub;
    }

    // --- Settings & Personas API ---
    getSettings() {
        return this.safeParse(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    }

    updateSettings(partial) {
        const current = this.getSettings();
        const merged = { ...current, ...partial };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
        return merged;
    }

    // --- Per-Profile Snapshot & Data Isolation ---
    saveProfileSnapshot(profileKey) {
        if (!profileKey) return;
        const resolved = resolvePersonaKey(profileKey);
        const snapshot = {
            transactions: this.safeParse(STORAGE_KEYS.TRANSACTIONS, []),
            budgets: this.safeParse(STORAGE_KEYS.BUDGETS, []),
            goals: this.safeParse(STORAGE_KEYS.GOALS, []),
            subscriptions: this.safeParse(STORAGE_KEYS.SUBSCRIPTIONS, []),
            deposits: this.safeParse(STORAGE_KEYS.DEPOSITS, []),
            simulationLog: this.safeParse(STORAGE_KEYS.SIMULATION_LOG, [])
        };
        try {
            localStorage.setItem(`mindwallet_profile_${resolved}_data`, JSON.stringify(snapshot));
        } catch (e) {
            console.warn(`[MindWallet Store] Failed to save snapshot for ${resolved}:`, e);
        }
    }

    saveCurrentProfileSnapshot() {
        const currentPersona = resolvePersonaKey(this.getSettings().persona || 'student');
        this.saveProfileSnapshot(currentPersona);
    }

    loadProfileSnapshot(profileKey, starterData = null) {
        const resolved = resolvePersonaKey(profileKey);
        const raw = localStorage.getItem(`mindwallet_profile_${resolved}_data`);
        let data = null;
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch (e) {
                console.warn(`[MindWallet Store] Parse error for profile ${resolved}:`, e);
            }
        }

        if (!data || !Array.isArray(data.transactions) || data.transactions.length === 0) {
            const fallbackPreset = PERSONA_PRESETS[resolved] || PERSONA_PRESETS.student;
            const starter = starterData || fallbackPreset.starterData;
            data = {
                transactions: starter?.transactions || [],
                budgets: starter?.budgets || [],
                goals: starter?.goals || [],
                subscriptions: starter?.subscriptions || [],
                deposits: [
                    { id: 'dep-1', goalId: starter?.goals?.[0]?.id || 'g-1', goalName: starter?.goals?.[0]?.name || 'Savings Goal', amount: 3000, date: getRelativeDate(-2) }
                ],
                simulationLog: []
            };
            try {
                localStorage.setItem(`mindwallet_profile_${resolved}_data`, JSON.stringify(data));
            } catch (e) {
                console.warn(`[MindWallet Store] Could not initialize storage for profile ${resolved}:`, e);
            }
        }

        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions || []));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets || []));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals || []));
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data.subscriptions || []));
        localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(data.deposits || []));
        localStorage.setItem(STORAGE_KEYS.SIMULATION_LOG, JSON.stringify(data.simulationLog || []));
    }

    applyPersona(personaKey, modifiers = {}, preserveCustom = true, isReverting = false) {
        const currentSettings = this.getSettings();
        const currentProfileKey = resolvePersonaKey(currentSettings.persona || 'student');

        // 1. Snapshot outgoing profile state
        this.saveProfileSnapshot(currentProfileKey);

        // 2. Resolve destination persona preset
        const resolvedKey = resolvePersonaKey(personaKey);
        const preset = PERSONA_PRESETS[resolvedKey] || PERSONA_PRESETS.student;

        // 3. Load or initialize target profile snapshot
        this.loadProfileSnapshot(resolvedKey, preset.starterData);

        // 4. Custom settings that survive profile switching
        const preserved = preserveCustom ? {
            darkMode: currentSettings.darkMode,
            highContrast: currentSettings.highContrast,
            reducedMotion: currentSettings.reducedMotion,
            dyslexicFont: currentSettings.dyslexicFont,
            colorblindMode: currentSettings.colorblindMode,
            fontSizeStep: currentSettings.fontSizeStep,
            currency: currentSettings.currency || preset.currency || '₹'
        } : {};

        // 5. Update active user profile
        const user = {
            id: 'usr-' + resolvedKey,
            name: preset.name,
            email: `${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@mindwallet.local`,
            role: preset.role,
            avatar: preset.avatar
        };
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));

        // 6. Senior mode accommodations
        let activeMode = currentSettings.mode || 'standard';
        let fontSizeStep = currentSettings.fontSizeStep !== undefined ? currentSettings.fontSizeStep : 0;
        if (preset.seniorAccommodations) {
            activeMode = 'senior';
            fontSizeStep = Math.max(fontSizeStep, 2);
        } else if (currentProfileKey === 'elderly_retiree' && activeMode === 'senior') {
            activeMode = 'standard';
            if (fontSizeStep === 2) fontSizeStep = 0;
        }

        // 7. Update settings object
        const newSettings = {
            ...currentSettings,
            persona: resolvedKey,
            mode: activeMode,
            fontSizeStep,
            coolingOffHours: preset.coolingOffHours !== undefined ? preset.coolingOffHours : 24,
            coolingOffEnabled: preset.coolingOffEnabled !== undefined ? preset.coolingOffEnabled : true,
            dashboardEmphasis: preset.dashboardEmphasis || 'standard',
            coachTone: preset.coachTone || 'supportive',
            monthlyIncome: preset.income || currentSettings.monthlyIncome || 45000,
            ...preserved,
            modifierLowVision: modifiers.lowVision !== undefined ? !!modifiers.lowVision : currentSettings.modifierLowVision,
            modifierColorBlind: modifiers.colorBlind !== undefined ? !!modifiers.colorBlind : currentSettings.modifierColorBlind,
            modifierMotor: modifiers.motor !== undefined ? !!modifiers.motor : currentSettings.modifierMotor,
            modifierCognitive: modifiers.cognitive !== undefined ? !!modifiers.cognitive : currentSettings.modifierCognitive,
            modifierScreenReader: modifiers.screenReader !== undefined ? !!modifiers.screenReader : currentSettings.modifierScreenReader,
            modifierDyslexia: modifiers.dyslexia !== undefined ? !!modifiers.dyslexia : currentSettings.modifierDyslexia
        };

        if (modifiers.lowVision) {
            newSettings.highContrast = true;
        }
        if (modifiers.dyslexia) {
            newSettings.dyslexicFont = true;
        }

        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));

        if (!isReverting) {
            this.recordAction({
                type: 'change-persona',
                previousPersona: currentProfileKey,
                previousSettings: currentSettings,
                newPersona: resolvedKey
            });
        }

        return { user, settings: newSettings };
    }

    hasCompletedOnboarding() {
        return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
    }

    setCompletedOnboarding(val = true) {
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, val ? 'true' : 'false');
    }

    getCurrentUser() {
        return this.safeParse(STORAGE_KEYS.AUTH, null);
    }

    login(email, password, personaKey = null) {
        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            throw new Error('Please enter a valid email address format (e.g. name@domain.com).');
        }
        if (!password || password.trim().length === 0) {
            throw new Error('Please enter your account password.');
        }

        const resolvedKey = personaKey ? resolvePersonaKey(personaKey) : (this.getSettings().persona || 'student');
        const preset = PERSONA_PRESETS[resolvedKey] || PERSONA_PRESETS.student;

        // Apply profile snapshot & persona configurations
        this.applyPersona(resolvedKey, {}, true);

        const usernamePart = email.split('@')[0] || 'User';
        const formattedName = usernamePart.replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) || preset.name;
        const user = {
            id: 'usr-' + resolvedKey,
            name: formattedName,
            email: email.trim(),
            role: preset.role,
            avatar: (formattedName.substring(0, 2)).toUpperCase()
        };
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
        this.syncWithCloud();
        return user;
    }

    register(name, email, role, personaKey = null) {
        if (!name || name.trim().length < 2) {
            throw new Error('Please enter your full name.');
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            throw new Error('Please enter a valid email address.');
        }

        const resolvedKey = personaKey ? resolvePersonaKey(personaKey) : (role ? resolvePersonaKey(role) : 'student');
        const preset = PERSONA_PRESETS[resolvedKey] || PERSONA_PRESETS.student;

        this.applyPersona(resolvedKey, {}, true);

        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
        const user = {
            id: 'usr-' + resolvedKey,
            name: name.trim(),
            email: email.trim(),
            role: preset.role || role || 'Member',
            avatar: initials
        };
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
        this.syncWithCloud();
        return user;
    }

    /**
     * Seamless two-way synchronization between client store and MongoDB Atlas
     */
    async syncWithCloud() {
        try {
            const user = this.getCurrentUser();
            const persona = resolvePersonaKey(this.getSettings().persona || 'student');
            const payload = {
                userId: user?.id || 'guest',
                persona,
                transactions: this.getTransactions(),
                budgets: this.getBudgets(),
                goals: this.getGoals(),
                subscriptions: this.getSubscriptions(),
                settings: this.getSettings()
            };

            const res = await api.syncAll(payload);
            if (res && res.cloudData) {
                const { cloudData } = res;
                if (Array.isArray(cloudData.transactions) && cloudData.transactions.length > 0) {
                    const localTxs = this.getTransactions();
                    if (!localTxs || localTxs.length === 0) {
                        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(cloudData.transactions));
                    } else {
                        // Enrich local transactions with cloud IDs without resurrecting removed entries
                        let updated = false;
                        localTxs.forEach(ltx => {
                            const match = cloudData.transactions.find(ctx => ctx.merchant === ltx.merchant && ctx.date === ltx.date && Number(ctx.amount) === Number(ltx.amount));
                            if (match && match._id && ltx.id !== match._id.toString()) {
                                ltx.cloudId = match._id.toString();
                                updated = true;
                            }
                        });
                        if (updated) {
                            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(localTxs));
                        }
                    }
                }
                if (Array.isArray(cloudData.budgets) && cloudData.budgets.length > 0) {
                    const localBudgets = this.getBudgets();
                    if (!localBudgets || localBudgets.length === 0) {
                        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(cloudData.budgets));
                    }
                }
                if (Array.isArray(cloudData.goals) && cloudData.goals.length > 0) {
                    const localGoals = this.getGoals();
                    if (!localGoals || localGoals.length === 0) {
                        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(cloudData.goals));
                    }
                }
                if (Array.isArray(cloudData.subscriptions) && cloudData.subscriptions.length > 0) {
                    const localSubs = this.getSubscriptions();
                    if (!localSubs || localSubs.length === 0) {
                        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(cloudData.subscriptions));
                    }
                }
                this.saveCurrentProfileSnapshot();
                return true;
            }
            return false;
        } catch (e) {
            console.warn('Background MongoDB Atlas sync deferred:', e);
            return false;
        }
    }

    loginAsGuest(personaKey = 'student') {
        const resolvedKey = resolvePersonaKey(personaKey);
        const preset = PERSONA_PRESETS[resolvedKey] || PERSONA_PRESETS.student;
        this.applyPersona(resolvedKey, {}, true);
        const guestUser = {
            id: 'usr-guest-' + resolvedKey,
            name: preset.name,
            email: `${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@mindwallet.local`,
            role: preset.role,
            avatar: preset.avatar
        };
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(guestUser));
        return guestUser;
    }

    logout() {
        this.saveCurrentProfileSnapshot();
        localStorage.removeItem(STORAGE_KEYS.AUTH);
    }

    resetAllData() {
        const preset = PERSONA_PRESETS.stressed_spender;
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(preset.starterData.transactions));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(preset.starterData.budgets));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(preset.starterData.goals));
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(preset.starterData.subscriptions));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({
            id: 'usr-1',
            name: preset.name,
            email: 'alex@mindwallet.local',
            role: preset.role,
            avatar: preset.avatar
        }));
        localStorage.removeItem(STORAGE_KEYS.DISMISSED_SUGGESTIONS);
        localStorage.removeItem(STORAGE_KEYS.DEPOSITS);
        localStorage.removeItem(STORAGE_KEYS.READ_NOTIFICATIONS);
        localStorage.removeItem(STORAGE_KEYS.SIMULATION_LOG);
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        this.undoStack = [];
        this.lastAction = null;
    }

    exportData() {
        const payload = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            transactions: this.getTransactions(),
            budgets: this.getBudgets(),
            goals: this.getGoals(),
            subscriptions: this.getSubscriptions(),
            settings: this.getSettings(),
            user: this.getCurrentUser(),
            deposits: this.safeParse(STORAGE_KEYS.DEPOSITS, [])
        };
        return JSON.stringify(payload, null, 2);
    }

    importData(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') {
            throw new Error('Import data must be a valid JSON string.');
        }
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (e) {
            throw new Error('Invalid JSON format: unable to parse backup file.');
        }

        if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid backup structure: root must be a JSON object.');
        }

        if (!Array.isArray(parsed.transactions) && !Array.isArray(parsed.budgets) && !parsed.settings) {
            throw new Error('Unrecognized backup format: file lacks MindWallet data schemas.');
        }

        // Commit atomically
        if (Array.isArray(parsed.transactions)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.transactions));
        }
        if (Array.isArray(parsed.budgets)) {
            localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(parsed.budgets));
        }
        if (Array.isArray(parsed.goals)) {
            localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(parsed.goals));
        }
        if (Array.isArray(parsed.subscriptions)) {
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(parsed.subscriptions));
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...INITIAL_SETTINGS, ...parsed.settings }));
        }
        if (parsed.user && typeof parsed.user === 'object') {
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(parsed.user));
        }
        if (Array.isArray(parsed.deposits)) {
            localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(parsed.deposits));
        }

        this.undoStack = [];
        this.lastAction = null;
        return true;
    }

    // --- Financial Calculations Engine ---
    getSummary() {
        const txs = this.getTransactions();
        let totalIncome = 0;
        let totalExpense = 0;

        txs.forEach(t => {
            if (t.type === 'income') totalIncome += Number(t.amount);
            else totalExpense += Number(t.amount);
        });

        const netBalance = totalIncome - totalExpense;
        const goals = this.getGoals();
        const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);

        return {
            totalIncome,
            totalExpense,
            netBalance,
            totalSaved
        };
    }

    /**
     * Tier 1 Monthly Summary:
     * Calculates income and expenses strictly for the specified/current calendar month
     * using getMonthTransactions().
     */
    getMonthSummary(targetDate = new Date()) {
        const txs = this.getMonthTransactions(targetDate);
        let monthlyIncome = 0;
        let monthlyExpense = 0;

        txs.forEach(t => {
            if (t.type === 'income') monthlyIncome += Number(t.amount);
            else monthlyExpense += Number(t.amount);
        });

        // Ensure realistic base if seed data for current month has no income
        if (monthlyIncome === 0) {
            const allTxs = this.getTransactions();
            const incomeTx = allTxs.find(t => t.type === 'income');
            monthlyIncome = incomeTx ? Number(incomeTx.amount) : 28000;
        }

        const moneyLeftThisMonth = monthlyIncome - monthlyExpense;
        const savedThisMonth = this.getSavedThisMonth(targetDate);

        return {
            monthlyIncome,
            monthlyExpense,
            moneyLeftThisMonth,
            savedThisMonth
        };
    }

    /**
     * Dynamic Financial Health Score (0 - 100)
     * Factors (all derived from current month data, without hardcoded baseline):
     * 1. Savings Rate (25%)
     * 2. Budget Discipline (25%)
     * 3. Emergency Cushion (20%)
     * 4. Subscription Burden (15%)
     * 5. Dynamic Impulse Control (15%) computed from discretionary spending vs limits + simulator usage
     */
    getFinancialHealthScore() {
        const mSummary = this.getMonthSummary();
        const income = mSummary.monthlyIncome || 1;
        const expense = mSummary.monthlyExpense;

        // 1. Savings Rate (0-25 pts)
        const savingsRate = Math.max(0, (income - expense) / income);
        const savingsScore = Math.min(25, Math.round(savingsRate * 100 * 0.8));

        // 2. Budget Discipline (0-25 pts) — scoped strictly to current month transactions
        const budgets = this.getBudgets();
        const monthTxs = this.getMonthTransactions();
        let overBudgetCount = 0;
        const atRiskBudgets = [];

        budgets.forEach(b => {
            const spent = monthTxs
                .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === b.category.toLowerCase())
                .reduce((acc, t) => acc + Number(t.amount), 0);
            if (spent > b.limit) {
                overBudgetCount++;
                atRiskBudgets.push({ category: b.category, spent, limit: b.limit, overBy: spent - b.limit });
            }
        });
        const budgetScore = Math.max(0, Math.min(25, 25 - (overBudgetCount * 7)));

        // 3. Emergency Cushion (0-20 pts)
        const emergencyGoal = this.getGoals().find(g => (g.name || '').toLowerCase().includes('emergency')) || { current: 30000, target: 100000 };
        const emergencyRatio = Math.min(1, emergencyGoal.current / (emergencyGoal.target || 1));
        const emergencyScore = Math.round(emergencyRatio * 20);

        // 4. Subscription Burden (0-15 pts) — uses centralized getMonthlySubscriptionCost()
        const monthlySubBurn = this.getMonthlySubscriptionCost();
        const subRatio = monthlySubBurn / income;
        const subScore = subRatio > 0.1 ? 5 : subRatio > 0.05 ? 10 : 15;

        // 5. Dynamic Impulse Control (0-15 pts)
        // Computed purely from real data: discretionary category spending adherence + pre-purchase simulator checks
        const impulseCategories = ['shopping', 'entertainment', 'dining out'];
        const discretionarySpent = monthTxs
            .filter(t => t.type === 'expense' && impulseCategories.includes((t.category || '').toLowerCase()))
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const discretionaryBudget = budgets
            .filter(b => impulseCategories.includes((b.category || '').toLowerCase()))
            .reduce((sum, b) => sum + Number(b.limit), 0) || 1;

        const discRatio = discretionarySpent / discretionaryBudget;
        let discAdherenceScore = 10;
        if (discRatio > 1) {
            discAdherenceScore = Math.max(0, Math.round(10 - (discRatio - 1) * 10));
        } else {
            discAdherenceScore = Math.round(10 - (discRatio * 4));
        }

        const simLog = this.safeParse(STORAGE_KEYS.SIMULATION_LOG, []);
        const wantSimCount = simLog.filter(s => s.priority === 'Want').length;
        const deliberationBonus = Math.min(5, wantSimCount * 2);
        const impulseScore = Math.min(15, Math.max(0, discAdherenceScore + deliberationBonus));

        const totalScore = Math.min(100, savingsScore + budgetScore + emergencyScore + subScore + impulseScore);

        let status = 'Excellent';
        let color = 'var(--emerald)';
        if (totalScore < 60) {
            status = 'Needs Attention';
            color = 'var(--danger-text)';
        } else if (totalScore < 80) {
            status = 'Good';
            color = 'var(--warning-text)';
        }

        // Computed dynamic guidance based on the lowest scoring factor
        let recommendedAction = '';
        const factorRatios = [
            { name: 'savings', ratio: savingsScore / 25, score: savingsScore, max: 25 },
            { name: 'budget', ratio: budgetScore / 25, score: budgetScore, max: 25 },
            { name: 'emergency', ratio: emergencyScore / 20, score: emergencyScore, max: 20 },
            { name: 'subscription', ratio: subScore / 15, score: subScore, max: 15 },
            { name: 'impulse', ratio: impulseScore / 15, score: impulseScore, max: 15 }
        ];
        factorRatios.sort((a, b) => a.ratio - b.ratio);
        const weakest = factorRatios[0];

        if (weakest.name === 'savings' && weakest.ratio < 0.8) {
            const savingsPct = income > 0 ? Math.round((mSummary.moneyLeftThisMonth / income) * 100) : 0;
            recommendedAction = `Current retained savings is ${savingsPct}%. Strive to preserve at least 20% (₹${Math.round(income * 0.2).toLocaleString()}) this month before non-essential spending.`;
        } else if (weakest.name === 'budget' && weakest.ratio < 0.8) {
            if (atRiskBudgets.length > 0) {
                const names = atRiskBudgets.map(b => `${b.category} (+₹${b.overBy.toLocaleString()})`).join(', ');
                recommendedAction = `Spending is over limit in: ${names}. Pause further purchases in these categories for the rest of the month.`;
            } else {
                recommendedAction = `Keep your category spending paced evenly to avoid budget penalties before month-end.`;
            }
        } else if (weakest.name === 'emergency' && weakest.ratio < 0.8) {
            const remainingNeeded = Math.max(0, (emergencyGoal.target || 100000) - emergencyGoal.current);
            recommendedAction = `Your Emergency Safety Cushion is at ${Math.round(emergencyRatio * 100)}% of target. Allocate ₹${remainingNeeded.toLocaleString()} to liquid reserves for security.`;
        } else if (weakest.name === 'subscription' && weakest.ratio < 0.8) {
            const subBurn = Math.round(monthlySubBurn);
            const subPct = Math.round((monthlySubBurn / income) * 100);
            recommendedAction = `Recurring subscriptions take ₹${subBurn.toLocaleString()}/mo (${subPct}% of income). Cancel unused memberships to keep under the 5% threshold.`;
        } else if (weakest.name === 'impulse' && weakest.ratio < 0.8) {
            const discSpent = discretionarySpent.toLocaleString();
            recommendedAction = `Discretionary spending (Shopping, Dining out) has reached ₹${discSpent}. Run the Purchase Simulator before buying any non-essential "Want" item.`;
        } else {
            recommendedAction = `Outstanding financial health! Maintain steady monthly savings deposits and regular budget pacing.`;
        }

        return {
            score: totalScore,
            status,
            color,
            recommendedAction,
            breakdown: {
                savingsScore,
                budgetScore,
                emergencyScore,
                subScore,
                impulseScore
            }
        };
    }

    /**
     * Purchase Simulator ("Can I Afford This?")
     * Computes health score before AND after, uses budget of selected category,
     * calculates price impact (% of monthly income), net balance after,
     * and calculates delay on user-selected goal.
     */
    simulatePurchase(price, category, priority, selectedGoalId = null) {
        const priceNum = Number(price);
        const mSummary = this.getMonthSummary();
        const healthBefore = this.getFinancialHealthScore().score;

        // Log simulation usage with priority for impulse control scoring
        const simLog = this.safeParse(STORAGE_KEYS.SIMULATION_LOG, []);
        simLog.unshift({ price: priceNum, category, priority: priority || 'Want', date: Date.now() });
        localStorage.setItem(STORAGE_KEYS.SIMULATION_LOG, JSON.stringify(simLog.slice(0, 20)));

        const moneyLeftAfter = mSummary.moneyLeftThisMonth - priceNum;
        const priceImpactPct = Math.round((priceNum / (mSummary.monthlyIncome || 1)) * 100);

        // Category Budget Assessment
        const budgets = this.getBudgets();
        const catBudget = budgets.find(b => b.category.toLowerCase() === (category || '').toLowerCase());
        const monthTxs = this.getMonthTransactions();
        const currentCatSpent = monthTxs
            .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === (category || '').toLowerCase())
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const catLimit = catBudget ? catBudget.limit : Math.round(mSummary.monthlyIncome * 0.15);
        const remainingCatBudgetBefore = catLimit - currentCatSpent;
        const remainingCatBudgetAfter = remainingCatBudgetBefore - priceNum;
        const willExceedBudget = remainingCatBudgetAfter < 0;

        // Goal Delay Assessment on chosen goal
        const goals = this.getGoals();
        let targetGoal = goals.find(g => g.id === selectedGoalId);
        if (!targetGoal) targetGoal = goals[0] || { name: 'Primary Savings Goal', monthlyContribution: 5000 };

        const monthlyContrib = Number(targetGoal.monthlyContribution) || 3000;
        const delayDays = Math.max(1, Math.round((priceNum / monthlyContrib) * 30));

        // Simulated Health Score After Purchase
        const simIncome = mSummary.monthlyIncome;
        const simExpense = mSummary.monthlyExpense + priceNum;
        const simSavingsRate = Math.max(0, (simIncome - simExpense) / simIncome);
        const simSavingsScore = Math.min(25, Math.round(simSavingsRate * 100 * 0.8));
        const healthAfter = Math.max(10, Math.min(100, healthBefore - (priceNum > mSummary.moneyLeftThisMonth ? 18 : willExceedBudget ? 10 : 4)));

        let recommendation = 'Proceed Safe';
        let recommendationClass = 'status-pill healthy';
        let hciAdvice = `This purchase fits comfortably within your monthly flow. You will retain ${this.getSettings().currency}${moneyLeftAfter.toLocaleString()} this month.`;

        if (moneyLeftAfter < 0) {
            recommendation = 'Avoid Purchase';
            recommendationClass = 'status-pill critical';
            hciAdvice = `Exceeds your money left this month! Buying this requires debt or draining your savings reserve.`;
        } else if (willExceedBudget) {
            recommendation = 'Avoid Purchase';
            recommendationClass = 'status-pill critical';
            hciAdvice = `Fits total cash, but severely exceeds your monthly ${category} limit by ${this.getSettings().currency}${Math.abs(remainingCatBudgetAfter).toLocaleString()}.`;
        } else if (priority === 'Want' && (priceNum > (mSummary.monthlyIncome * 0.10) || (remainingCatBudgetAfter / catLimit) < 0.2)) {
            recommendation = 'Wait 30 Days';
            recommendationClass = 'status-pill warning';
            hciAdvice = `This is a high-cost discretionary "Want". Applying a cooling-off deliberation buffer prevents impulse remorse.`;
        }

        const settings = this.getSettings();
        const coolingHours = settings.coolingOffEnabled ? (settings.coolingOffHours || 24) : 0;
        const coolingActive = settings.coolingOffEnabled && priority === 'Want';
        if (coolingActive && moneyLeftAfter >= 0 && !willExceedBudget) {
            recommendation = `${coolingHours}h Cool-Off`;
            recommendationClass = 'status-pill warning';
            hciAdvice = `As part of your impulse control pacing, pause for ${coolingHours} hours before completing this want. If you still want it tomorrow, purchase guilt-free!`;
        }

        return {
            price: priceNum,
            category,
            priority,
            priceImpactPct,
            moneyLeftAfter,
            healthBefore,
            healthAfter,
            remainingCatBudgetBefore,
            remainingCatBudgetAfter,
            willExceedBudget,
            goalName: targetGoal.name,
            delayDays,
            recommendation,
            recommendationClass,
            coolingActive,
            coolingHours,
            hciAdvice
        };
    }

    // --- Rule-Based Contextual Suggestions ---
    getContextualSuggestion() {
        const dismissed = this.safeParse(STORAGE_KEYS.DISMISSED_SUGGESTIONS, []);
        const isDismissed = (id) => dismissed.includes(id);

        const budgets = this.getBudgets();
        const txs = this.getTransactions();

        // Rule 1: Category Budget > 80%
        for (const b of budgets) {
            const spent = txs
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const pct = Math.round((spent / b.limit) * 100);

            if (pct >= 80 && !isDismissed(`budget-${b.id}`)) {
                return {
                    id: `budget-${b.id}`,
                    icon: '⚠️',
                    title: `${b.category} Budget Alert`,
                    message: `You've used ${pct}% of your ₹${b.limit.toLocaleString()} monthly limit. Pace carefully for the remaining days.`,
                    actionRoute: '#budget',
                    actionText: 'Adjust Budget'
                };
            }
        }

        // Rule 2: Subscription renewing within 3 days
        const subs = this.getSubscriptions();
        const today = new Date();
        for (const s of subs) {
            if (s.nextBilling) {
                const billDate = new Date(s.nextBilling);
                const diffDays = Math.ceil((billDate - today) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 3 && !isDismissed(`sub-${s.id}`)) {
                    return {
                        id: `sub-${s.id}`,
                        icon: '🔁',
                        title: `${s.name} Renews Soon`,
                        message: `A scheduled ₹${s.amount.toLocaleString()} renewal is coming up in ${diffDays === 0 ? 'today' : diffDays + ' days'}. Still using it?`,
                        actionRoute: '#subscriptions',
                        actionText: 'Review Subscription'
                    };
                }
            }
        }

        // Rule 3: Goal Milestone reached (>= 60%)
        const goals = this.getGoals();
        for (const g of goals) {
            const pct = Math.round((g.current / g.target) * 100);
            if (pct >= 60 && !isDismissed(`goal-${g.id}`)) {
                return {
                    id: `goal-${g.id}`,
                    icon: '🎯',
                    title: `Savings Milestone: ${g.name}`,
                    message: `Congratulations! You've crossed ${pct}% of your target. Just ₹${(g.target - g.current).toLocaleString()} left!`,
                    actionRoute: '#savings',
                    actionText: 'View Goal'
                };
            }
        }

        return null;
    }

    isDismissed(id) {
        const dismissed = this.safeParse(STORAGE_KEYS.DISMISSED_SUGGESTIONS, []);
        return dismissed.includes(id);
    }

    dismissSuggestion(id, permanent = false) {
        if (!permanent) return;
        const dismissed = this.safeParse(STORAGE_KEYS.DISMISSED_SUGGESTIONS, []);
        if (!dismissed.includes(id)) {
            dismissed.push(id);
            localStorage.setItem(STORAGE_KEYS.DISMISSED_SUGGESTIONS, JSON.stringify(dismissed));
        }
    }

    // --- Dynamic Notifications Engine ---
    getNotifications() {
        const notifs = [];
        const monthTxs = this.getMonthTransactions();
        const budgets = this.getBudgets();
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysRemaining = Math.max(0, daysInMonth - today.getDate());

        // 1. Budget Alerts (>= 75% utilized)
        budgets.forEach(b => {
            const spent = monthTxs
                .filter(t => t.type === 'expense' && (t.category || '').toLowerCase() === b.category.toLowerCase())
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const pct = Math.round((spent / b.limit) * 100);
            if (pct >= 75) {
                const isCritical = pct >= 90;
                notifs.push({
                    id: `notif-budget-${b.id || b.category}`,
                    icon: b.icon || '🛒',
                    title: `${b.category} Budget Notice`,
                    message: `You reached ${pct}% of your ₹${b.limit.toLocaleString()} monthly limit (${daysRemaining} days left).`,
                    level: isCritical ? 'critical' : 'warning',
                    route: '#budget'
                });
            }
        });

        // 2. Subscriptions Renewing within 7 Days
        const subs = this.getSubscriptions();
        subs.forEach(s => {
            if (s.nextBilling) {
                const billDate = new Date(s.nextBilling);
                const diffDays = Math.ceil((billDate - today) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 7) {
                    notifs.push({
                        id: `notif-sub-${s.id || s.name}`,
                        icon: s.icon || '🔁',
                        title: `${s.name} Renewal`,
                        message: `₹${Number(s.amount).toLocaleString()} recurring charge scheduled for ${s.nextBilling} (${diffDays === 0 ? 'today' : 'in ' + diffDays + ' days'}).`,
                        level: 'info',
                        route: '#subscriptions'
                    });
                }
            }
        });

        // 3. Goal Milestones
        const goals = this.getGoals();
        goals.forEach(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            if (pct >= 50) {
                const remaining = Math.max(0, g.target - g.current);
                const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(remaining / g.monthlyContribution) : 1;
                notifs.push({
                    id: `notif-goal-${g.id || g.name}`,
                    icon: g.icon || '🎯',
                    title: `${g.name} Milestone`,
                    message: `${pct}% reached! Estimated completion in ~${monthsLeft} month${monthsLeft === 1 ? '' : 's'}.`,
                    level: 'success',
                    route: '#savings'
                });
            }
        });

        return notifs;
    }

    getReadNotificationIds() {
        return this.safeParse(STORAGE_KEYS.READ_NOTIFICATIONS, []);
    }

    getUnreadNotificationCount() {
        const notifs = this.getNotifications();
        const readIds = this.getReadNotificationIds();
        return notifs.filter(n => !readIds.includes(n.id)).length;
    }

    markAllNotificationsRead() {
        const notifs = this.getNotifications();
        const ids = notifs.map(n => n.id);
        localStorage.setItem(STORAGE_KEYS.READ_NOTIFICATIONS, JSON.stringify(ids));
        return 0;
    }

    markNotificationRead(id) {
        const readIds = this.getReadNotificationIds();
        if (!readIds.includes(id)) {
            readIds.push(id);
            localStorage.setItem(STORAGE_KEYS.READ_NOTIFICATIONS, JSON.stringify(readIds));
        }
    }
}

export const store = new Store();

export function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export const escapeHTML = escapeHtml;
