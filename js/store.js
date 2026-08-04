/* MindWallet — Central Store & Persistence Layer */

const STORAGE_KEYS = {
    TRANSACTIONS: 'mindwallet_transactions',
    BUDGETS: 'mindwallet_budgets',
    GOALS: 'mindwallet_goals',
    SUBSCRIPTIONS: 'mindwallet_subscriptions',
    NOTIFICATIONS: 'mindwallet_notifications',
    SETTINGS: 'mindwallet_settings'
};

// Initial Seed Data
const INITIAL_TRANSACTIONS = [
    { id: 'tx-1', merchant: 'Salary Credit', category: 'Income', amount: 62000, type: 'income', date: '2026-08-01', icon: '💼', iconBg: '#EAF1FC', iconColor: '#10233F' },
    { id: 'tx-2', merchant: 'FreshMart Supermarket', category: 'Groceries', amount: 3450, type: 'expense', date: '2026-08-03', icon: '🛒', iconBg: '#E4F5EE', iconColor: '#1E9E75' },
    { id: 'tx-3', merchant: 'Urban Housing Rent', category: 'Housing', amount: 18000, type: 'expense', date: '2026-08-01', icon: '🏠', iconBg: '#EAF1FC', iconColor: '#10233F' },
    { id: 'tx-4', merchant: 'State Power Utility', category: 'Utilities', amount: 2150, type: 'expense', date: '2026-08-02', icon: '⚡', iconBg: '#FEF3E2', iconColor: '#F5A524' },
    { id: 'tx-5', merchant: 'BigBasket Grocery', category: 'Groceries', amount: 1240, type: 'expense', date: '2026-08-02', icon: '🛒', iconBg: '#E4F5EE', iconColor: '#1E9E75' },
    { id: 'tx-6', merchant: 'Netflix Premium', category: 'Subscriptions', amount: 649, type: 'expense', date: '2026-08-03', icon: '🎬', iconBg: '#FCE8E8', iconColor: '#DC3545' },
    { id: 'tx-7', merchant: 'Spotify Family Plan', category: 'Subscriptions', amount: 179, type: 'expense', date: '2026-08-03', icon: '🎵', iconBg: '#E4F5EE', iconColor: '#1E9E75' },
    { id: 'tx-8', merchant: 'PVR Cinemas Ticket', category: 'Entertainment', amount: 680, type: 'expense', date: '2026-07-30', icon: '🎟️', iconBg: '#FEF3E2', iconColor: '#F5A524' },
    { id: 'tx-9', merchant: 'Freelance Design Retainer', category: 'Income', amount: 15000, type: 'income', date: '2026-07-28', icon: '💻', iconBg: '#F0EBFF', iconColor: '#6E44FF' },
    { id: 'tx-10', merchant: 'Metro Rail Transport Card', category: 'Transport', amount: 1000, type: 'expense', date: '2026-07-29', icon: '🚇', iconBg: '#EAF1FC', iconColor: '#10233F' }
];

const INITIAL_BUDGETS = [
    { id: 'b-1', category: 'Groceries', limit: 12000, icon: '🛒' },
    { id: 'b-2', category: 'Housing', limit: 20000, icon: '🏠' },
    { id: 'b-3', category: 'Utilities', limit: 4000, icon: '⚡' },
    { id: 'b-4', category: 'Dining out', limit: 6000, icon: '🍽️' },
    { id: 'b-5', category: 'Subscriptions', limit: 2000, icon: '🔁' },
    { id: 'b-6', category: 'Entertainment', limit: 4000, icon: '🎟️' },
    { id: 'b-7', category: 'Transport', limit: 3000, icon: '🚇' },
    { id: 'b-8', category: 'Shopping', limit: 5000, icon: '🛍️' }
];

const INITIAL_GOALS = [
    { id: 'g-1', name: 'Emergency Cushion Fund', target: 150000, current: 97500, icon: '🛡️', monthlyContribution: 7500, category: 'Safety' },
    { id: 'g-2', name: 'New M3 MacBook Air', target: 115000, current: 48000, icon: '💻', monthlyContribution: 6000, category: 'Tech' },
    { id: 'g-3', name: 'Himalayan Trekking Trip', target: 45000, current: 28000, icon: '🏔️', monthlyContribution: 4000, category: 'Travel' },
    { id: 'g-4', name: 'Home Renovation Reserve', target: 200000, current: 65000, icon: '🏡', monthlyContribution: 5000, category: 'Property' }
];

const INITIAL_SUBSCRIPTIONS = [
    { id: 's-1', name: 'Netflix 4K Ultra Plan', category: 'Streaming', amount: 649, cycle: 'Monthly', nextBilling: '2026-09-03', status: 'Active', icon: '🎬' },
    { id: 's-2', name: 'Spotify Premium Family', category: 'Audio', amount: 179, cycle: 'Monthly', nextBilling: '2026-09-03', status: 'Active', icon: '🎵' },
    { id: 's-3', name: 'Fitness First Gym Membership', category: 'Health', amount: 2500, cycle: 'Monthly', nextBilling: '2026-08-15', status: 'Active', icon: '🏋️' },
    { id: 's-4', name: 'iCloud+ 200GB Storage', category: 'Cloud Services', amount: 219, cycle: 'Monthly', nextBilling: '2026-08-20', status: 'Active', icon: '☁️' },
    { id: 's-5', name: 'Amazon Prime Annual', category: 'Shopping & Video', amount: 1499, cycle: 'Annual', nextBilling: '2026-11-10', status: 'Active', icon: '📦' }
];

const INITIAL_NOTIFICATIONS = [
    { id: 'n-1', title: 'Groceries Budget Notice', message: 'You have reached 39% of your monthly Groceries limit.', type: 'info', read: false, time: '2 hours ago' },
    { id: 'n-2', title: 'Subscription Upcoming', message: 'Fitness First Gym Membership (₹2,500) renews on Aug 15.', type: 'warning', read: false, time: '1 day ago' },
    { id: 'n-3', title: 'Savings Milestone!', message: 'Emergency Cushion Fund has reached 65% of target goal.', type: 'success', read: true, time: '3 days ago' }
];

const INITIAL_SETTINGS = {
    mode: 'standard', // standard | accessible | senior | simplified
    highContrast: false,
    reducedMotion: false,
    fontSizeStep: 0,
    currency: '₹',
    soundEnabled: true
};

class Store {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
            localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
            localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(INITIAL_SUBSCRIPTIONS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        }
    }

    getTransactions() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
    }

    addTransaction(tx) {
        const txs = this.getTransactions();
        tx.id = 'tx-' + Date.now();
        txs.unshift(tx);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
        return tx;
    }

    deleteTransaction(id) {
        const txs = this.getTransactions().filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    }

    getBudgets() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS)) || [];
    }

    updateBudget(category, limit) {
        const budgets = this.getBudgets();
        const index = budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());
        if (index !== -1) {
            budgets[index].limit = limit;
        } else {
            budgets.push({ id: 'b-' + Date.now(), category, limit, icon: '📌' });
        }
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    }

    getGoals() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS)) || [];
    }

    addGoal(goal) {
        const goals = this.getGoals();
        goal.id = 'g-' + Date.now();
        goals.push(goal);
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }

    updateGoalDeposit(id, amount) {
        const goals = this.getGoals();
        const g = goals.find(item => item.id === id);
        if (g) {
            g.current += Number(amount);
            localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        }
    }

    getSubscriptions() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) || [];
    }

    addSubscription(sub) {
        const subs = this.getSubscriptions();
        sub.id = 's-' + Date.now();
        subs.push(sub);
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    }

    deleteSubscription(id) {
        const subs = this.getSubscriptions().filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    }

    getNotifications() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
    }

    markAllNotificationsRead() {
        const notes = this.getNotifications().map(n => ({ ...n, read: true }));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notes));
    }

    getSettings() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || INITIAL_SETTINGS;
    }

    updateSettings(newSettings) {
        const s = { ...this.getSettings(), ...newSettings };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(s));
        return s;
    }

    resetAllData() {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(INITIAL_SUBSCRIPTIONS));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }

    // Calculations Engine
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

    getFinancialHealthScore() {
        const summary = this.getSummary();
        const income = summary.totalIncome || 1;
        const expense = summary.totalExpense;

        // 1. Savings Rate Score (0-25)
        const savingsRate = Math.max(0, (income - expense) / income);
        const savingsScore = Math.min(25, Math.round(savingsRate * 100 * 0.8));

        // 2. Budget Adherence Score (0-25)
        const budgets = this.getBudgets();
        const txs = this.getTransactions();
        let overBudgetCount = 0;

        budgets.forEach(b => {
            const spent = txs
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
                .reduce((acc, t) => acc + Number(t.amount), 0);
            if (spent > b.limit) overBudgetCount++;
        });
        const budgetScore = Math.max(5, 25 - (overBudgetCount * 7));

        // 3. Emergency Buffer Score (0-20)
        const emergencyGoal = this.getGoals().find(g => g.name.toLowerCase().includes('emergency')) || { current: 0, target: 100000 };
        const emergencyRatio = Math.min(1, emergencyGoal.current / (emergencyGoal.target || 1));
        const emergencyScore = Math.round(emergencyRatio * 20);

        // 4. Subscription Burden Score (0-15)
        const subs = this.getSubscriptions();
        const monthlySubBurn = subs.reduce((acc, s) => acc + (s.cycle === 'Annual' ? s.amount / 12 : s.amount), 0);
        const subRatio = monthlySubBurn / income;
        const subScore = subRatio > 0.1 ? 5 : subRatio > 0.05 ? 10 : 15;

        // 5. Impulse Control Baseline (0-15)
        const impulseScore = 14;

        const totalScore = Math.min(100, savingsScore + budgetScore + emergencyScore + subScore + impulseScore);
        
        let status = 'Excellent';
        let color = 'var(--emerald)';
        if (totalScore < 60) { status = 'Needs Attention'; color = 'var(--red)'; }
        else if (totalScore < 80) { status = 'Good'; color = 'var(--orange)'; }

        return {
            score: totalScore,
            status,
            color,
            breakdown: {
                savingsScore,
                budgetScore,
                emergencyScore,
                subScore,
                impulseScore
            }
        };
    }

    simulatePurchase(price, category, priority) {
        const summary = this.getSummary();
        const healthBefore = this.getFinancialHealthScore().score;
        const priceNum = Number(price);

        const netAfter = summary.netBalance - priceNum;
        const budgetImpact = Math.round((priceNum / (summary.totalIncome || 1)) * 100);

        const goals = this.getGoals();
        const topGoal = goals[0] || { name: 'Savings Goal', monthlyContribution: 5000 };
        const delayDays = Math.round((priceNum / (topGoal.monthlyContribution || 1)) * 30);

        let recommendation = 'Proceed Safe';
        let recommendationClass = 'tag-pos';
        let hciAdvice = 'This item fits well within your available balance without jeopardizing your savings rate.';

        if (priceNum > summary.netBalance) {
            recommendation = 'Avoid Purchase';
            recommendationClass = 'tag-neg';
            hciAdvice = 'This item exceeds your current balance. Buying this would push your account into a negative balance or require debt.';
        } else if (priority === 'Want' && budgetImpact > 15) {
            recommendation = 'Wait 30 Days';
            recommendationClass = 'tag-warning';
            hciAdvice = 'This non-essential purchase consumes a large share of your income. We recommend cooling off for 30 days to evaluate impulse intent.';
        }

        return {
            price: priceNum,
            category,
            priority,
            netAfter,
            budgetImpact,
            delayDays,
            recommendation,
            recommendationClass,
            hciAdvice,
            healthBefore
        };
    }
}

export const store = new Store();
