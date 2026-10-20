import express from 'express';
import { Goal } from '../models/Goal.js';
import { Transaction } from '../models/Transaction.js';

const router = express.Router();

// GET /api/goals
router.get('/', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student' } = req.query;
        const goals = await Goal.find({ userId, persona });
        res.json({ success: true, count: goals.length, goals });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/goals
router.post('/', async (req, res) => {
    try {
        const {
            userId = 'guest',
            persona = 'student',
            name,
            target,
            current = 0,
            monthlyContribution = 0,
            deadline = '',
            category = 'Savings',
            icon = '🎯',
            autoDeposit = false
        } = req.body;

        if (!name || target === undefined) {
            return res.status(400).json({ error: 'name and target are required' });
        }

        const goal = await Goal.create({
            userId,
            persona,
            name,
            target: Number(target),
            current: Number(current),
            monthlyContribution: Number(monthlyContribution),
            deadline,
            category,
            icon,
            autoDeposit
        });

        res.status(201).json({ success: true, goal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/goals/:id/deposit
router.post('/:id/deposit', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, createTransaction = true } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Valid positive amount is required' });
        }

        const numAmount = Number(amount);
        const goal = await Goal.findById(id);
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        goal.current = Math.min(goal.target, goal.current + numAmount);
        await goal.save();

        let tx = null;
        if (createTransaction) {
            tx = await Transaction.create({
                userId: goal.userId,
                persona: goal.persona,
                merchant: `Deposit to ${goal.name}`,
                category: 'Savings Transfer',
                amount: numAmount,
                type: 'expense',
                date: new Date().toISOString().split('T')[0],
                icon: '🎯',
                iconBg: '#E4F5EE',
                iconColor: 'var(--emerald)',
                necessity: 'essential',
                notes: `Manual milestone contribution towards ${goal.name}`
            });
        }

        res.json({
            success: true,
            goal,
            transaction: tx,
            newPercentage: Math.round((goal.current / goal.target) * 100)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Goal.findByIdAndDelete(id);
        res.json({ success: true, message: 'Goal deleted from MongoDB Atlas' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
