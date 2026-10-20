import express from 'express';
import { getDBStatus } from '../config/db.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { Goal } from '../models/Goal.js';
import { Subscription } from '../models/Subscription.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const dbStatus = getDBStatus();

    let counts = { users: 0, transactions: 0, budgets: 0, goals: 0, subscriptions: 0 };
    if (dbStatus.connected) {
        try {
            const [u, t, b, g, s] = await Promise.all([
                User.countDocuments().catch(() => 0),
                Transaction.countDocuments().catch(() => 0),
                Budget.countDocuments().catch(() => 0),
                Goal.countDocuments().catch(() => 0),
                Subscription.countDocuments().catch(() => 0)
            ]);
            counts = { users: u, transactions: t, budgets: b, goals: g, subscriptions: s };
        } catch (e) {
            // Count error shouldn't crash health endpoint
        }
    }

    res.json({
        status: dbStatus.connected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        database: {
            provider: 'MongoDB Atlas',
            ...dbStatus,
            counts
        },
        version: '2.0.0'
    });
});

export default router;
