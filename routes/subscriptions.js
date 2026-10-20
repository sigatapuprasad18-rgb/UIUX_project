import express from 'express';
import { Subscription } from '../models/Subscription.js';

const router = express.Router();

// GET /api/subscriptions
router.get('/', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student', activeOnly = 'true' } = req.query;
        const query = { userId, persona };
        if (activeOnly === 'true') query.active = true;

        const subscriptions = await Subscription.find(query).sort({ nextBilling: 1 });
        res.json({ success: true, count: subscriptions.length, subscriptions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/subscriptions
router.post('/', async (req, res) => {
    try {
        const {
            userId = 'guest',
            persona = 'student',
            name,
            amount,
            billingCycle = 'monthly',
            nextBilling,
            category = 'Subscriptions'
        } = req.body;

        if (!name || amount === undefined || !nextBilling) {
            return res.status(400).json({ error: 'name, amount, and nextBilling are required' });
        }

        const sub = await Subscription.create({
            userId,
            persona,
            name,
            amount: Number(amount),
            billingCycle,
            nextBilling,
            category,
            active: true
        });

        res.status(201).json({ success: true, subscription: sub });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/subscriptions/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sub = await Subscription.findByIdAndUpdate(id, { active: false }, { new: true });
        if (!sub) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        res.json({ success: true, message: 'Subscription canceled', subscription: sub });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
