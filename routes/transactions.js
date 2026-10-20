import express from 'express';
import { Transaction } from '../models/Transaction.js';

const router = express.Router();

// GET /api/transactions
router.get('/', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student', category, type, month } = req.query;
        const query = { userId, persona, isUndone: false };

        if (category) query.category = category;
        if (type) query.type = type;
        if (month) query.date = { $regex: `^${month}` };

        const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
        res.json({ success: true, count: transactions.length, transactions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/transactions
router.post('/', async (req, res) => {
    try {
        const {
            userId = 'guest',
            persona = 'student',
            merchant,
            category,
            amount,
            type,
            date,
            icon,
            iconBg,
            iconColor,
            necessity,
            notes
        } = req.body;

        if (!merchant || !category || amount === undefined || !type) {
            return res.status(400).json({ error: 'merchant, category, amount, and type are required' });
        }

        const tx = await Transaction.create({
            userId,
            persona,
            merchant,
            category,
            amount: Number(amount),
            type,
            date: date || new Date().toISOString().split('T')[0],
            icon: icon || '💳',
            iconBg: iconBg || '#F4F6F8',
            iconColor: iconColor || 'var(--text)',
            necessity: necessity || 'essential',
            notes: notes || ''
        });

        res.status(201).json({ success: true, transaction: tx });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tx = await Transaction.findByIdAndUpdate(id, { isUndone: true }, { new: true });
        if (!tx) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ success: true, message: 'Transaction removed (reversible)', transaction: tx });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/transactions/undo
router.post('/undo', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student' } = req.body;
        const lastUndone = await Transaction.findOne({ userId, persona, isUndone: true }).sort({ updatedAt: -1 });
        if (!lastUndone) {
            return res.status(404).json({ error: 'No action to undo' });
        }
        lastUndone.isUndone = false;
        await lastUndone.save();
        res.json({ success: true, message: 'Transaction restored', transaction: lastUndone });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
