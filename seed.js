import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Transaction } from './models/Transaction.js';
import { Budget } from './models/Budget.js';
import { Goal } from './models/Goal.js';
import { Subscription } from './models/Subscription.js';
import { Notification } from './models/Notification.js';

dotenv.config();

const getPersonaDate = (dayNumber = 1) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(Math.min(Math.max(1, dayNumber), 28)).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const getBillingDate = (offsetDays = 7) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
};

const getFutureDate = (monthsAhead = 6) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return d.toISOString().split('T')[0];
};

const DEFAULT_ARCHETYPES = [
    {
        key: 'student',
        email: 'alex@mindwallet.local',
        name: 'Alex Morgan',
        avatar: 'AM',
        role: 'Student Profile',
        password: 'demo123',
        settings: {
            monthlyIncome: 18000,
            currency: '₹',
            mode: 'standard',
            coolingOffPeriodHours: 24,
            coachTone: 'supportive'
        },
        budgets: [
            { category: 'Dining out', limit: 4500, icon: '🍔' },
            { category: 'Groceries', limit: 4000, icon: '🛒' },
            { category: 'Books & Supplies', limit: 3000, icon: '📚' },
            { category: 'Transport', limit: 2000, icon: '🚌' },
            { category: 'Subscriptions', limit: 1000, icon: '🔁' },
            { category: 'Entertainment', limit: 1500, icon: '🎟️' }
        ],
        subscriptions: [
            { name: 'Spotify Student', amount: 66, billingCycle: 'monthly', nextBilling: getBillingDate(8), category: 'Entertainment' },
            { name: 'Prime Student', amount: 749, billingCycle: 'annual', nextBilling: getBillingDate(25), category: 'Shopping' },
            { name: 'Notion AI Education', amount: 350, billingCycle: 'monthly', nextBilling: getBillingDate(4), category: 'Utilities' }
        ],
        goals: [
            { name: 'Semester Laptop Upgrade', target: 45000, current: 24000, monthlyContribution: 3000, deadline: getFutureDate(7), category: 'Tech', icon: '💻' },
            { name: 'Summer Break Trek Fund', target: 15000, current: 8500, monthlyContribution: 1500, deadline: getFutureDate(5), category: 'Travel', icon: '🏔️' }
        ],
        transactions: [
            { merchant: 'University Stipend Deposit', category: 'Salary / Income', amount: 18000, type: 'income', date: getPersonaDate(1), icon: '💰', iconBg: '#EAF1FC', iconColor: 'var(--navy)', necessity: 'essential' },
            { merchant: 'Campus Book Depot (Textbooks)', category: 'Books & Supplies', amount: 1450, type: 'expense', date: getPersonaDate(4), icon: '📚', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'University Cafeteria Lunch', category: 'Dining out', amount: 280, type: 'expense', date: getPersonaDate(6), icon: '🍔', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
            { merchant: 'Metro Card Pass Recharge', category: 'Transport', amount: 500, type: 'expense', date: getPersonaDate(9), icon: '🚌', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Campus Mart Groceries & Snacks', category: 'Groceries', amount: 1200, type: 'expense', date: getPersonaDate(11), icon: '🛒', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Late Night Pizza Slice', category: 'Dining out', amount: 360, type: 'expense', date: getPersonaDate(14), icon: '🍔', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
            { merchant: 'Campus Stationery & Printouts', category: 'Books & Supplies', amount: 180, type: 'expense', date: getPersonaDate(16), icon: '📚', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Chai & Samosa Stall', category: 'Dining out', amount: 120, type: 'expense', date: getPersonaDate(18), icon: '🍔', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' }
        ]
    },
    {
        key: 'working_professional',
        email: 'priya@mindwallet.local',
        name: 'Priya Sharma',
        avatar: 'PS',
        role: 'Working Professional Profile',
        password: 'demo123',
        settings: {
            monthlyIncome: 85000,
            currency: '₹',
            mode: 'standard',
            coolingOffPeriodHours: 0,
            coachTone: 'analytical'
        },
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
            { name: 'Mint & Bloomberg Financial', amount: 899, billingCycle: 'monthly', nextBilling: getBillingDate(11), category: 'Utilities' },
            { name: 'Cult.fit Gym & Wellness', amount: 1499, billingCycle: 'monthly', nextBilling: getBillingDate(16), category: 'Health' },
            { name: 'Cloud Backup Storage', amount: 350, billingCycle: 'monthly', nextBilling: getBillingDate(6), category: 'Utilities' }
        ],
        goals: [
            { name: 'Nifty 50 Index Wealth Corpus', target: 500000, current: 260000, monthlyContribution: 20000, deadline: getFutureDate(6), category: 'Investments', icon: '📈' },
            { name: 'Emergency 6-Month Runway', target: 200000, current: 160000, monthlyContribution: 8000, deadline: getFutureDate(4), category: 'Emergency', icon: '🛡️' }
        ],
        transactions: [
            { merchant: 'Corporate Salary Credit', category: 'Salary / Income', amount: 85000, type: 'income', date: getPersonaDate(1), icon: '💰', iconBg: '#EAF1FC', iconColor: 'var(--navy)', necessity: 'essential' },
            { merchant: 'Apartment Rental Payment', category: 'Housing', amount: 25000, type: 'expense', date: getPersonaDate(2), icon: '🏠', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Nifty 50 Index Mutual Fund SIP', category: 'Investments', amount: 20000, type: 'expense', date: getPersonaDate(5), icon: '📈', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Organic Harvest Groceries', category: 'Groceries', amount: 6200, type: 'expense', date: getPersonaDate(8), icon: '🛒', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Broadband Fiber & Electric', category: 'Utilities', amount: 3100, type: 'expense', date: getPersonaDate(11), icon: '⚡', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Bistro Team Dinner', category: 'Dining out', amount: 1850, type: 'expense', date: getPersonaDate(14), icon: '🍽️', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
            { merchant: 'Uber Work Commute Pass', category: 'Transport', amount: 1450, type: 'expense', date: getPersonaDate(16), icon: '🚗', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Dental & Health Clinic Consultation', category: 'Healthcare', amount: 1200, type: 'expense', date: getPersonaDate(18), icon: '🏥', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' }
        ]
    },
    {
        key: 'elderly_retiree',
        email: 'eleanor@mindwallet.local',
        name: 'Eleanor Vance',
        avatar: 'EV',
        role: 'Senior Citizen Profile',
        password: 'demo123',
        settings: {
            monthlyIncome: 36000,
            currency: '₹',
            mode: 'senior',
            coolingOffPeriodHours: 48,
            coachTone: 'reassuring'
        },
        budgets: [
            { category: 'Healthcare', limit: 9000, icon: '💊' },
            { category: 'Groceries', limit: 8000, icon: '🛒' },
            { category: 'Utilities', limit: 5000, icon: '⚡' },
            { category: 'Gifts & Family', limit: 4000, icon: '🎁' },
            { category: 'Home & Gardening', limit: 3000, icon: '🌸' },
            { category: 'Transport', limit: 2000, icon: '🛺' }
        ],
        subscriptions: [
            { name: 'Morning Newspaper & Digest', amount: 450, billingCycle: 'monthly', nextBilling: getBillingDate(5), category: 'Utilities' },
            { name: 'Senior Health TeleCare Club', amount: 799, billingCycle: 'monthly', nextBilling: getBillingDate(12), category: 'Healthcare' }
        ],
        goals: [
            { name: 'Annual Health Insurance Sinking Fund', target: 50000, current: 38000, monthlyContribution: 3000, deadline: getFutureDate(5), category: 'Health', icon: '🏥' },
            { name: 'Family Pilgrimage & Gathering', target: 60000, current: 45000, monthlyContribution: 2500, deadline: getFutureDate(8), category: 'Travel', icon: '🌸' }
        ],
        transactions: [
            { merchant: 'Government Pension Monthly Credit', category: 'Salary / Income', amount: 36000, type: 'income', date: getPersonaDate(1), icon: '💰', iconBg: '#EAF1FC', iconColor: 'var(--navy)', necessity: 'essential' },
            { merchant: 'Apollo Pharmacy (Monthly Prescriptions)', category: 'Healthcare', amount: 2450, type: 'expense', date: getPersonaDate(3), icon: '💊', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Fresh Produce & Dairy Farm Market', category: 'Groceries', amount: 1650, type: 'expense', date: getPersonaDate(6), icon: '🛒', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Electricity & Piped Gas Utility', category: 'Utilities', amount: 1850, type: 'expense', date: getPersonaDate(10), icon: '⚡', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Birthday Gift for Granddaughter', category: 'Gifts & Family', amount: 2000, type: 'expense', date: getPersonaDate(13), icon: '🎁', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
            { merchant: 'Cardiologist Follow-up Consultation', category: 'Healthcare', amount: 1200, type: 'expense', date: getPersonaDate(15), icon: '🏥', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Organic Garden Seeds & Soil Mix', category: 'Home & Gardening', amount: 680, type: 'expense', date: getPersonaDate(17), icon: '🌸', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' },
            { merchant: 'Senior Auto-Rickshaw Commute', category: 'Transport', amount: 350, type: 'expense', date: getPersonaDate(18), icon: '🛺', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' }
        ]
    },
    {
        key: 'goal_saver',
        email: 'rohan@mindwallet.local',
        name: 'Rohan Mehta',
        avatar: 'RM',
        role: 'Big-Goal Saver Profile',
        password: 'demo123',
        settings: {
            monthlyIncome: 110000,
            currency: '₹',
            mode: 'standard',
            coolingOffPeriodHours: 12,
            coachTone: 'motivational'
        },
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
            { name: 'GitHub Copilot Enterprise', amount: 850, billingCycle: 'monthly', nextBilling: getBillingDate(5), category: 'Utilities' },
            { name: 'Spotify Music', amount: 119, billingCycle: 'monthly', nextBilling: getBillingDate(12), category: 'Entertainment' }
        ],
        goals: [
            { name: 'Dream Home Down Payment', target: 800000, current: 490000, monthlyContribution: 35000, deadline: getFutureDate(10), category: 'Real Estate', icon: '🏠' },
            { name: 'Japan Solo Travel Expedition', target: 180000, current: 125000, monthlyContribution: 10000, deadline: getFutureDate(6), category: 'Travel', icon: '🏔️' },
            { name: 'EV Two-Wheeler Fund', target: 120000, current: 85000, monthlyContribution: 7500, deadline: getFutureDate(3), category: 'Vehicle', icon: '🚗' }
        ],
        transactions: [
            { merchant: 'Tech Corp Monthly Salary', category: 'Salary / Income', amount: 110000, type: 'income', date: getPersonaDate(1), icon: '💰', iconBg: '#EAF1FC', iconColor: 'var(--navy)', necessity: 'essential' },
            { merchant: 'Auto-Transfer to Down Payment Goal', category: 'Savings Transfer', amount: 35000, type: 'expense', date: getPersonaDate(2), icon: '🎯', iconBg: '#E4F5EE', iconColor: 'var(--emerald)', necessity: 'essential' },
            { merchant: 'Auto-Transfer to Japan Fund', category: 'Savings Transfer', amount: 10000, type: 'expense', date: getPersonaDate(2), icon: '🎯', iconBg: '#E4F5EE', iconColor: 'var(--emerald)', necessity: 'essential' },
            { merchant: 'Apartment Rent', category: 'Housing', amount: 28000, type: 'expense', date: getPersonaDate(3), icon: '🏠', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Weekly Groceries & Essentials', category: 'Groceries', amount: 4800, type: 'expense', date: getPersonaDate(7), icon: '🛒', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Metro & Fuel Expenses', category: 'Transport', amount: 1800, type: 'expense', date: getPersonaDate(10), icon: '🚗', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Work Station Electric & Wifi', category: 'Utilities', amount: 2200, type: 'expense', date: getPersonaDate(12), icon: '⚡', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'essential' },
            { merchant: 'Weekend Coffee & Brunch', category: 'Dining out', amount: 1200, type: 'expense', date: getPersonaDate(15), icon: '🍔', iconBg: '#F4F6F8', iconColor: 'var(--text)', necessity: 'discretionary' }
        ]
    }
];

export const seedDatabase = async (force = false) => {
    const conn = await connectDB();
    if (!conn) {
        console.warn('⚠️ Skipping MongoDB Atlas seed: database not connected.');
        return false;
    }

    try {
        const userCount = await User.countDocuments();
        if (userCount > 0 && !force) {
            console.log(`ℹ️ MongoDB Atlas already contains ${userCount} user profiles. Skipping initial seed.`);
            return true;
        }

        if (force) {
            console.log('🧹 Purging existing collections for clean re-seed...');
            await Promise.all([
                User.deleteMany({}),
                Transaction.deleteMany({}),
                Budget.deleteMany({}),
                Goal.deleteMany({}),
                Subscription.deleteMany({}),
                Notification.deleteMany({})
            ]);
        }

        console.log('🌱 Seeding MongoDB Atlas with MindWallet persona archetypes...');

        for (const arch of DEFAULT_ARCHETYPES) {
            let user = await User.findOne({ email: arch.email });
            if (!user) {
                user = await User.create({
                    email: arch.email,
                    password: arch.password,
                    name: arch.name,
                    activePersona: arch.key,
                    avatar: arch.avatar,
                    settings: arch.settings
                });
            }

            const userId = user._id.toString();

            // Seed Budgets
            if (arch.budgets?.length) {
                for (const b of arch.budgets) {
                    await Budget.findOneAndUpdate(
                        { userId, persona: arch.key, category: b.category },
                        { ...b, userId, persona: arch.key },
                        { upsert: true, new: true }
                    );
                }
            }

            // Seed Subscriptions
            if (arch.subscriptions?.length) {
                for (const s of arch.subscriptions) {
                    await Subscription.findOneAndUpdate(
                        { userId, persona: arch.key, name: s.name },
                        { ...s, userId, persona: arch.key },
                        { upsert: true, new: true }
                    );
                }
            }

            // Seed Goals
            if (arch.goals?.length) {
                for (const g of arch.goals) {
                    await Goal.findOneAndUpdate(
                        { userId, persona: arch.key, name: g.name },
                        { ...g, userId, persona: arch.key },
                        { upsert: true, new: true }
                    );
                }
            }

            // Seed Transactions
            if (arch.transactions?.length) {
                for (const t of arch.transactions) {
                    await Transaction.findOneAndUpdate(
                        { userId, persona: arch.key, merchant: t.merchant, date: t.date },
                        { ...t, userId, persona: arch.key },
                        { upsert: true, new: true }
                    );
                }
            }

            // Seed Initial Welcome Notification
            await Notification.create({
                userId,
                persona: arch.key,
                title: `Welcome to MindWallet, ${arch.name}!`,
                message: `Your ${arch.role} is connected to MongoDB Atlas Cloud Database. Changes sync automatically across all devices.`,
                type: 'success',
                read: false
            });
        }

        console.log('✅ MongoDB Atlas successfully seeded with all 4 profile archetypes!');
        return true;
    } catch (err) {
        console.error('❌ Error during MongoDB Atlas seeding:', err);
        return false;
    }
};

// If run directly: node seed.js
if (process.argv[1]?.endsWith('seed.js')) {
    (async () => {
        await connectDB();
        await seedDatabase(process.argv.includes('--force'));
        process.exit(0);
    })();
}
