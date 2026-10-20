import express from 'express';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';

const router = express.Router();

// GET /api/analytics/summary
// Aggregation pipeline running directly on MongoDB Atlas
router.get('/summary', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student', month } = req.query;
        const matchStage = {
            userId,
            persona,
            isUndone: false
        };

        if (month) {
            matchStage.date = { $regex: `^${month}` };
        }

        // 1. Total income vs expense aggregation
        const cashFlow = await Transaction.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        let totalIncome = 0;
        let totalExpense = 0;
        cashFlow.forEach(c => {
            if (c._id === 'income') totalIncome = c.total;
            if (c._id === 'expense') totalExpense = c.total;
        });

        // 2. Spending by category aggregation
        const categorySpending = await Transaction.aggregate([
            { $match: { ...matchStage, type: 'expense' } },
            {
                $group: {
                    _id: '$category',
                    totalSpent: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } }
        ]);

        // 3. Essential vs Discretionary breakdown
        const necessityBreakdown = await Transaction.aggregate([
            { $match: { ...matchStage, type: 'expense' } },
            {
                $group: {
                    _id: '$necessity',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Compare with Budgets
        const budgets = await Budget.find({ userId, persona }).lean();
        const budgetComparison = budgets.map(b => {
            const matchCat = categorySpending.find(c => c._id?.toLowerCase() === b.category.toLowerCase());
            const spent = matchCat ? matchCat.totalSpent : 0;
            return {
                category: b.category,
                limit: b.limit,
                spent,
                remaining: Math.max(0, b.limit - spent),
                percentage: b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0,
                isOverBudget: spent > b.limit
            };
        });

        res.json({
            success: true,
            provider: 'MongoDB Atlas Aggregation Engine',
            period: month || 'all-time',
            summary: {
                totalIncome,
                totalExpense,
                netSavings: totalIncome - totalExpense,
                savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0
            },
            categorySpending,
            necessityBreakdown,
            budgetComparison
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
