/* MindWallet — Persona-Driven Profiles & Preset Configurations */

export function getPersonaDate(dayNumber = 1) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(Math.min(Math.max(1, dayNumber), 28)).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function getBillingDate(offsetDays = 7) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}

export function getFutureDate(monthsAhead = 6) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return d.toISOString().split('T')[0];
}

export const PERSONA_PRESETS = {
    student: {
        id: 'student',
        aliasIds: ['stressed_spender', 'alex'],
        name: 'Alex Morgan',
        displayName: 'Alex (Student)',
        role: 'Student Profile',
        avatar: 'AM',
        badge: 'Pocket-Money & Impulse Control',
        icon: '🎓',
        description: 'Managing college stipend, academic supplies, dining, and transit with a 24-hour cooling-off timer on non-essential purchases.',
        income: 18000,
        currency: '₹',
        dashboardEmphasis: 'afford', // Prominent "Can I afford this?"
        coachTone: 'supportive',     // Positive reinforcement, gentle guidance
        coolingOffHours: 24,
        coolingOffEnabled: true,
        lowCognitiveLoad: true,
        granularAlerts: false,
        fastKeyboardEntry: false,
        milestoneExpanded: false,
        starterData: {
            budgets: [
                { id: 'b_stu_1', category: 'Dining out', limit: 4500, icon: '🍔' },
                { id: 'b_stu_2', category: 'Groceries', limit: 4000, icon: '🛒' },
                { id: 'b_stu_3', category: 'Books & Supplies', limit: 3000, icon: '📚' },
                { id: 'b_stu_4', category: 'Transport', limit: 2000, icon: '🚌' },
                { id: 'b_stu_5', category: 'Subscriptions', limit: 1000, icon: '🔁' },
                { id: 'b_stu_6', category: 'Entertainment', limit: 1500, icon: '🎟️' }
            ],
            subscriptions: [
                { id: 'sub_stu_1', name: 'Spotify Student', amount: 66, billingCycle: 'monthly', nextBilling: getBillingDate(8), category: 'Entertainment' },
                { id: 'sub_stu_2', name: 'Prime Student', amount: 749, billingCycle: 'annual', nextBilling: getBillingDate(25), category: 'Shopping' },
                { id: 'sub_stu_3', name: 'Notion AI Education', amount: 350, billingCycle: 'monthly', nextBilling: getBillingDate(4), category: 'Utilities' }
            ],
            goals: [
                { id: 'g_stu_1', name: 'Semester Laptop Upgrade', target: 45000, current: 24000, monthlyContribution: 3000, deadline: getFutureDate(7), category: 'Tech' },
                { id: 'g_stu_2', name: 'Summer Break Trek Fund', target: 15000, current: 8500, monthlyContribution: 1500, deadline: getFutureDate(5), category: 'Travel' }
            ],
            transactions: [
                { id: 'tx_stu_1', merchant: 'University Stipend Deposit', category: 'Salary / Income', amount: 18000, type: 'income', date: getPersonaDate(1), icon: '💰', iconBg: '#EAF1FC', iconColor: 'var(--navy)', necessity: 'essential' },
                { id: 'tx_stu_2', merchant: 'Campus Book Depot (Textbooks)', category: 'Books & Supplies', amount: 1450, type: 'expense', date: getPersonaDate(4), icon: '📚', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_stu_3', merchant: 'University Cafeteria Lunch', category: 'Dining out', amount: 280, type: 'expense', date: getPersonaDate(6), icon: '🍔', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
                { id: 'tx_stu_4', merchant: 'Metro Card Pass Recharge', category: 'Transport', amount: 500, type: 'expense', date: getPersonaDate(9), icon: '🚌', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_stu_5', merchant: 'Campus Mart Groceries & Snacks', category: 'Groceries', amount: 1200, type: 'expense', date: getPersonaDate(11), icon: '🛒', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_stu_6', merchant: 'Late Night Pizza Slice', category: 'Dining out', amount: 360, type: 'expense', date: getPersonaDate(14), icon: '🍔', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
                { id: 'tx_stu_7', merchant: 'Campus Stationery & Printouts', category: 'Books & Supplies', amount: 180, type: 'expense', date: getPersonaDate(16), icon: '📚', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_stu_8', merchant: 'Chai & Samosa Stall', category: 'Dining out', amount: 120, type: 'expense', date: getPersonaDate(18), icon: '🍔', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' }
            ]
        }
    },

    working_professional: {
        id: 'working_professional',
        aliasIds: ['strict_budgeter', 'priya'],
        name: 'Priya Sharma',
        displayName: 'Priya (Working Professional)',
        role: 'Working Professional Profile',
        avatar: 'PS',
        badge: 'Salaried & Zero-Based Allocation',
        icon: '💼',
        description: 'Managing monthly corporate salary, apartment rent, SIP investments, subscription audits, and category variance metrics.',
        income: 85000,
        currency: '₹',
        dashboardEmphasis: 'variance', // Budget variance & category limits upfront
        coachTone: 'analytical',       // Precise, metrics-oriented
        coolingOffHours: 0,
        coolingOffEnabled: false,
        lowCognitiveLoad: false,
        granularAlerts: true,
        fastKeyboardEntry: true,
        milestoneExpanded: false,
        starterData: {
            budgets: [
                { category: 'Housing', limit: 25000, icon: '🏠' },
                { category: 'Investments', limit: 20000, icon: '📈' },
                { category: 'Groceries', limit: 12000, icon: '🛒' },
                { category: 'Dining out', limit: 6000, icon: '🍽️' },
                { category: 'Transport', limit: 6000, icon: '🚗' },
                { category: 'Utilities', limit: 5000, icon: '⚡' },
                { category: 'Healthcare', limit: 4000, icon: '🏥' },
                { category: 'Subscriptions', limit: 1500, icon: '🔁' }
            ],
            subscriptions: [
                { id: 'sub_pro_1', name: 'Mint & Bloomberg Financial', amount: 899, billingCycle: 'monthly', nextBilling: getBillingDate(11), category: 'Utilities' },
                { id: 'sub_pro_2', name: 'Cult.fit Gym & Wellness', amount: 1499, billingCycle: 'monthly', nextBilling: getBillingDate(16), category: 'Health' },
                { id: 'sub_pro_3', name: 'Cloud Backup Storage', amount: 350, billingCycle: 'monthly', nextBilling: getBillingDate(6), category: 'Utilities' }
            ],
            goals: [
                { id: 'g_pro_1', name: 'Nifty 50 Index Wealth Corpus', target: 500000, current: 260000, monthlyContribution: 20000, deadline: getFutureDate(6), category: 'Investment' },
                { id: 'g_pro_2', name: 'Emergency 6-Month Runway', target: 200000, current: 160000, monthlyContribution: 8000, deadline: getFutureDate(4), category: 'Emergency' }
            ],
            transactions: [
                { id: 'tx_pro_1', merchant: 'Corporate Salary Credit', category: 'Salary / Income', amount: 85000, type: 'income', date: getPersonaDate(1), icon: '💰', iconBg: '#EAF1FC', iconColor: 'var(--navy)', necessity: 'essential' },
                { id: 'tx_pro_2', merchant: 'Apartment Rental Payment', category: 'Housing', amount: 25000, type: 'expense', date: getPersonaDate(2), icon: '🏠', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_pro_3', merchant: 'Nifty 50 Index Mutual Fund SIP', category: 'Investments', amount: 20000, type: 'expense', date: getPersonaDate(5), icon: '📈', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_pro_4', merchant: 'Organic Harvest Groceries', category: 'Groceries', amount: 6200, type: 'expense', date: getPersonaDate(8), icon: '🛒', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_pro_5', merchant: 'Broadband Fiber & Electric', category: 'Utilities', amount: 3100, type: 'expense', date: getPersonaDate(11), icon: '⚡', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_pro_6', merchant: 'Bistro Team Dinner', category: 'Dining out', amount: 1850, type: 'expense', date: getPersonaDate(14), icon: '🍽️', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
                { id: 'tx_pro_7', merchant: 'Uber Work Commute Pass', category: 'Transport', amount: 1450, type: 'expense', date: getPersonaDate(16), icon: '🚗', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_pro_8', merchant: 'Dental & Health Clinic Consultation', category: 'Healthcare', amount: 1200, type: 'expense', date: getPersonaDate(18), icon: '🏥', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' }
            ]
        }
    },

    elderly_retiree: {
        id: 'elderly_retiree',
        aliasIds: ['senior', 'elderly', 'eleanor'],
        name: 'Eleanor Vance',
        displayName: 'Eleanor (Senior Citizen)',
        role: 'Senior Citizen Profile',
        avatar: 'EV',
        badge: 'Fixed Pension & Senior Accessibility',
        icon: '👵',
        description: 'Managing a predictable monthly pension, medication and doctor appointments, household upkeep, and grandchildren gifts with senior accessibility mode.',
        income: 36000,
        currency: '₹',
        dashboardEmphasis: 'health',  // Healthcare & safety balance
        coachTone: 'reassuring',      // Clear, respectful, gentle explanations, no jargon
        coolingOffHours: 48,
        coolingOffEnabled: true,
        lowCognitiveLoad: true,
        seniorAccommodations: true,   // Activates body.senior with >=52px touch targets and large text scale
        granularAlerts: false,
        fastKeyboardEntry: false,
        milestoneExpanded: false,
        starterData: {
            budgets: [
                { category: 'Healthcare', limit: 9000, icon: '💊' },
                { category: 'Groceries', limit: 8000, icon: '🛒' },
                { category: 'Utilities', limit: 5000, icon: '⚡' },
                { category: 'Gifts & Family', limit: 4000, icon: '🎁' },
                { category: 'Home & Gardening', limit: 3000, icon: '🌸' },
                { category: 'Transport', limit: 2000, icon: '🛺' }
            ],
            subscriptions: [
                { id: 'sub_sen_1', name: 'Morning Newspaper & Digest', amount: 450, billingCycle: 'monthly', nextBilling: getBillingDate(5), category: 'Utilities' },
                { id: 'sub_sen_2', name: 'Senior Health TeleCare Club', amount: 799, billingCycle: 'monthly', nextBilling: getBillingDate(12), category: 'Healthcare' }
            ],
            goals: [
                { id: 'g_sen_1', name: 'Annual Health Insurance Sinking Fund', target: 50000, current: 38000, monthlyContribution: 3000, deadline: getFutureDate(5), category: 'Health' },
                { id: 'g_sen_2', name: 'Family Pilgrimage & Gathering', target: 60000, current: 45000, monthlyContribution: 2500, deadline: getFutureDate(8), category: 'Travel' }
            ],
            transactions: [
                { id: 'tx_sen_1', merchant: 'Government Pension Monthly Credit', category: 'Salary / Income', amount: 36000, type: 'income', date: getPersonaDate(1), icon: '💰', iconBg: '#EAF1FC', iconColor: 'var(--navy)', necessity: 'essential' },
                { id: 'tx_sen_2', merchant: 'Apollo Pharmacy (Monthly Prescriptions)', category: 'Healthcare', amount: 2450, type: 'expense', date: getPersonaDate(3), icon: '💊', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_sen_3', merchant: 'Fresh Produce & Dairy Farm Market', category: 'Groceries', amount: 1650, type: 'expense', date: getPersonaDate(6), icon: '🛒', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_sen_4', merchant: 'Electricity & Piped Gas Utility', category: 'Utilities', amount: 1850, type: 'expense', date: getPersonaDate(10), icon: '⚡', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_sen_5', merchant: 'Birthday Gift for Granddaughter', category: 'Gifts & Family', amount: 2000, type: 'expense', date: getPersonaDate(13), icon: '🎁', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
                { id: 'tx_sen_6', merchant: 'Cardiologist Follow-up Consultation', category: 'Healthcare', amount: 1200, type: 'expense', date: getPersonaDate(15), icon: '🏥', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_sen_7', merchant: 'Organic Garden Seeds & Soil Mix', category: 'Home & Gardening', amount: 680, type: 'expense', date: getPersonaDate(17), icon: '🌸', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
                { id: 'tx_sen_8', merchant: 'Senior Auto-Rickshaw Commute', category: 'Transport', amount: 350, type: 'expense', date: getPersonaDate(18), icon: '🛺', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' }
            ]
        }
    },

    goal_saver: {
        id: 'goal_saver',
        aliasIds: ['rohan'],
        name: 'Rohan Mehta',
        displayName: 'Rohan (Big-Goal Saver)',
        role: 'Big-Goal Saver Profile',
        avatar: 'RM',
        badge: 'Milestone Focus & Delayed Gratification',
        icon: '🎯',
        description: 'Disciplined savings prioritizing house down-payment, travel expeditions, and purchase affordability simulations before spending.',
        income: 110000,
        currency: '₹',
        dashboardEmphasis: 'goals',   // Goal progress & milestone timeline upfront
        coachTone: 'motivational',   // Milestone celebrations, delayed gratification reminders
        coolingOffHours: 12,
        coolingOffEnabled: true,
        lowCognitiveLoad: false,
        granularAlerts: false,
        fastKeyboardEntry: false,
        milestoneExpanded: true,
        starterData: {
            budgets: [
                { category: 'Housing', limit: 28000, icon: '🏠' },
                { category: 'Savings Transfer', limit: 45000, icon: '🎯' },
                { category: 'Groceries', limit: 12000, icon: '🛒' },
                { category: 'Transport', limit: 5000, icon: '🚗' },
                { category: 'Utilities', limit: 6000, icon: '⚡' },
                { category: 'Dining out', limit: 5000, icon: '🍔' },
                { category: 'Shopping', limit: 4000, icon: '🛍️' },
                { category: 'Subscriptions', limit: 1200, icon: '🔁' }
            ],
            subscriptions: [
                { id: 'sub_rohan_1', name: 'GitHub Copilot Enterprise', amount: 850, billingCycle: 'monthly', nextBilling: getBillingDate(5), category: 'Utilities' },
                { id: 'sub_rohan_2', name: 'Spotify Music', amount: 119, billingCycle: 'monthly', nextBilling: getBillingDate(12), category: 'Entertainment' }
            ],
            goals: [
                { id: 'g_rohan_1', name: 'Dream Home Down Payment', target: 800000, current: 490000, monthlyContribution: 35000, deadline: getFutureDate(10), category: 'Real Estate' },
                { id: 'g_rohan_2', name: 'Japan Solo Travel Expedition', target: 180000, current: 125000, monthlyContribution: 10000, deadline: getFutureDate(6), category: 'Travel' },
                { id: 'g_rohan_3', name: 'EV Two-Wheeler Fund', target: 120000, current: 85000, monthlyContribution: 7500, deadline: getFutureDate(3), category: 'Vehicle' }
            ],
            transactions: [
                { id: 'tx_rohan_1', merchant: 'Tech Corp Monthly Salary', category: 'Salary / Income', amount: 110000, type: 'income', date: getPersonaDate(1), icon: '💰', iconBg: '#EAF1FC', iconColor: 'var(--navy)', necessity: 'essential' },
                { id: 'tx_rohan_2', merchant: 'Auto-Transfer to Down Payment Goal', category: 'Savings Transfer', amount: 35000, type: 'expense', date: getPersonaDate(2), icon: '🎯', iconBg: '#E4F5EE', iconColor: 'var(--emerald)', necessity: 'essential' },
                { id: 'tx_rohan_3', merchant: 'Auto-Transfer to Japan Fund', category: 'Savings Transfer', amount: 10000, type: 'expense', date: getPersonaDate(2), icon: '🎯', iconBg: '#E4F5EE', iconColor: 'var(--emerald)', necessity: 'essential' },
                { id: 'tx_rohan_4', merchant: 'Apartment Rent', category: 'Housing', amount: 28000, type: 'expense', date: getPersonaDate(3), icon: '🏠', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_rohan_5', merchant: 'Weekly Groceries & Essentials', category: 'Groceries', amount: 4800, type: 'expense', date: getPersonaDate(7), icon: '🛒', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_rohan_6', merchant: 'Metro & Fuel Expenses', category: 'Transport', amount: 1800, type: 'expense', date: getPersonaDate(10), icon: '🚗', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_rohan_7', merchant: 'Work Station Electric & Wifi', category: 'Utilities', amount: 2200, type: 'expense', date: getPersonaDate(12), icon: '⚡', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
                { id: 'tx_rohan_8', merchant: 'Weekend Coffee & Brunch', category: 'Dining out', amount: 1200, type: 'expense', date: getPersonaDate(15), icon: '🍔', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' }
            ]
        }
    },

    custom: {
        id: 'custom',
        aliasIds: [],
        name: 'Custom Profile',
        displayName: 'Custom User Profile',
        role: 'Custom Member Profile',
        avatar: 'ME',
        badge: 'Flexible & Modular',
        icon: '⚙️',
        description: 'Fully personalized layout, custom thresholds, and modular interface blocks.',
        income: 50000,
        currency: '₹',
        dashboardEmphasis: 'standard',
        coachTone: 'balanced',
        coolingOffHours: 24,
        coolingOffEnabled: true,
        lowCognitiveLoad: false,
        granularAlerts: false,
        fastKeyboardEntry: false,
        milestoneExpanded: false
    }
};

// Aliases for seamless backward compatibility
PERSONA_PRESETS.stressed_spender = PERSONA_PRESETS.student;
PERSONA_PRESETS.strict_budgeter = PERSONA_PRESETS.working_professional;
PERSONA_PRESETS.senior = PERSONA_PRESETS.elderly_retiree;
PERSONA_PRESETS.elderly = PERSONA_PRESETS.elderly_retiree;

export function resolvePersonaKey(key) {
    if (!key) return 'student';
    const lower = String(key).toLowerCase().trim();
    if (PERSONA_PRESETS[lower]) return PERSONA_PRESETS[lower].id;
    if (lower.includes('student') || lower.includes('alex') || lower.includes('spend')) return 'student';
    if (lower.includes('work') || lower.includes('prof') || lower.includes('priya') || lower.includes('budget')) return 'working_professional';
    if (lower.includes('elder') || lower.includes('senior') || lower.includes('retire') || lower.includes('eleanor')) return 'elderly_retiree';
    if (lower.includes('goal') || lower.includes('saver') || lower.includes('rohan')) return 'goal_saver';
    return 'student';
}

export function getPersona(id) {
    const key = resolvePersonaKey(id);
    return PERSONA_PRESETS[key] || PERSONA_PRESETS.student;
}

export function getAllPersonas() {
    return [
        PERSONA_PRESETS.student,
        PERSONA_PRESETS.working_professional,
        PERSONA_PRESETS.elderly_retiree,
        PERSONA_PRESETS.goal_saver
    ];
}
