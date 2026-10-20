import express from 'express';
import { Budget } from '../models/Budget.js';

const router = express.Router();

// GET /api/budgets
router.get('/', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student' } = req.query;
        const budgets = await Budget.find({ userId, persona });
        res.json({ success: true, count: budgets.length, budgets });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/budgets
router.post('/', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student', category, limit, icon } = req.body;
        if (!category || limit === undefined) {
            return res.status(400).json({ error: 'category and limit are required' });
        }

        const budget = await Budget.findOneAndUpdate(
            { userId, persona, category },
            { userId, persona, category, limit: Number(limit), icon: icon || '📊' },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ success: true, budget });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
