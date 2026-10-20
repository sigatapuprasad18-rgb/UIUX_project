import express from 'express';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { Goal } from '../models/Goal.js';
import { Subscription } from '../models/Subscription.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

const router = express.Router();

// POST /api/sync
// Full two-way synchronization between client store and MongoDB Atlas
router.post('/', async (req, res) => {
    try {
        const {
            userId = 'guest',
            persona = 'student',
            transactions = [],
            budgets = [],
            goals = [],
            subscriptions = [],
            settings = null
        } = req.body;

        // 1. Sync User Settings if provided
        let userRecord = null;
        if (userId && userId !== 'guest' && settings) {
            try {
                userRecord = await User.findById(userId);
                if (userRecord) {
                    userRecord.settings = { ...userRecord.settings?.toObject(), ...settings };
                    userRecord.activePersona = persona;
                    await userRecord.save();
                }
            } catch (e) {
                // Ignore invalid ObjectId for local guests
            }
        }

        // 2. Upsert incoming Transactions to MongoDB Atlas & prune deleted items
        if (Array.isArray(transactions)) {
            if (transactions.length > 0) {
                const bulkOps = transactions.map(t => ({
                    updateOne: {
                        filter: {
                            userId,
                            persona,
                            merchant: t.merchant,
                            date: t.date,
                            amount: t.amount
                        },
                        update: {
                            $set: {
                                userId,
                                persona,
                                merchant: t.merchant,
                                category: t.category,
                                amount: t.amount,
                                type: t.type,
                                date: t.date,
                                icon: t.icon || '💳',
                                iconBg: t.iconBg || '#F4F6F8',
                                iconColor: t.iconColor || 'var(--text)',
                                necessity: t.necessity || 'essential',
                                notes: t.notes || '',
                                isUndone: !!t.isUndone
                            }
                        },
                        upsert: true
                    }
                }));
                await Transaction.bulkWrite(bulkOps, { ordered: false }).catch(() => {});
            }

            // Remove any transactions in DB for this user+persona not present in incoming list
            const currentSignatures = transactions.map(t => `${t.merchant}|${t.date}|${t.amount}`);
            const allDbTxs = await Transaction.find({ userId, persona, isUndone: false });
            for (const dbt of allDbTxs) {
                const sig = `${dbt.merchant}|${dbt.date}|${dbt.amount}`;
                if (!currentSignatures.includes(sig)) {
                    await Transaction.deleteOne({ _id: dbt._id });
                }
            }
        }

        // 3. Upsert incoming Budgets to MongoDB Atlas
        if (Array.isArray(budgets) && budgets.length > 0) {
            const budgetOps = budgets.map(b => ({
                updateOne: {
                    filter: { userId, persona, category: b.category },
                    update: {
                        $set: {
                            userId,
                            persona,
                            category: b.category,
                            limit: b.limit,
                            icon: b.icon || '📊'
                        }
                    },
                    upsert: true
                }
            }));
            await Budget.bulkWrite(budgetOps, { ordered: false }).catch(() => {});
        }

        // 4. Upsert incoming Goals to MongoDB Atlas
        if (Array.isArray(goals) && goals.length > 0) {
            const goalOps = goals.map(g => ({
                updateOne: {
                    filter: { userId, persona, name: g.name },
                    update: {
                        $set: {
                            userId,
                            persona,
                            name: g.name,
                            target: g.target,
                            current: g.current,
                            monthlyContribution: g.monthlyContribution || 0,
                            deadline: g.deadline || '',
                            category: g.category || 'Savings',
                            icon: g.icon || '🎯'
                        }
                    },
                    upsert: true
                }
            }));
            await Goal.bulkWrite(goalOps, { ordered: false }).catch(() => {});
        }

        // 5. Upsert incoming Subscriptions to MongoDB Atlas
        if (Array.isArray(subscriptions) && subscriptions.length > 0) {
            const subOps = subscriptions.map(s => ({
                updateOne: {
                    filter: { userId, persona, name: s.name },
                    update: {
                        $set: {
                            userId,
                            persona,
                            name: s.name,
                            amount: s.amount,
                            billingCycle: s.billingCycle || 'monthly',
                            nextBilling: s.nextBilling,
                            category: s.category || 'Subscriptions',
                            active: s.active !== false
                        }
                    },
                    upsert: true
                }
            }));
            await Subscription.bulkWrite(subOps, { ordered: false }).catch(() => {});
        }

        // 6. Fetch canonical records from MongoDB Atlas for this user/persona
        const [cloudTxs, cloudBudgets, cloudGoals, cloudSubs, cloudNotifs] = await Promise.all([
            Transaction.find({ userId, persona, isUndone: false }).sort({ date: -1, createdAt: -1 }).lean(),
            Budget.find({ userId, persona }).lean(),
            Goal.find({ userId, persona }).lean(),
            Subscription.find({ userId, persona, active: true }).lean(),
            Notification.find({ userId, persona }).sort({ createdAt: -1 }).limit(20).lean()
        ]);

        res.json({
            success: true,
            syncedAt: new Date().toISOString(),
            cloudData: {
                transactions: cloudTxs.map(t => ({ id: t._id.toString(), ...t })),
                budgets: cloudBudgets.map(b => ({ id: b._id.toString(), ...b })),
                goals: cloudGoals.map(g => ({ id: g._id.toString(), ...g })),
                subscriptions: cloudSubs.map(s => ({ id: s._id.toString(), ...s })),
                notifications: cloudNotifs.map(n => ({ id: n._id.toString(), ...n })),
                settings: userRecord ? userRecord.settings : null
            }
        });
    } catch (err) {
        console.error('Sync error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
