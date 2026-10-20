import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    persona: {
        type: String,
        required: true,
        enum: ['student', 'working_professional', 'elderly_retiree', 'goal_saver'],
        index: true
    },
    merchant: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    date: {
        type: String,
        required: true,
        default: () => new Date().toISOString().split('T')[0]
    },
    icon: {
        type: String,
        default: '💳'
    },
    iconBg: {
        type: String,
        default: '#F4F6F8'
    },
    iconColor: {
        type: String,
        default: 'var(--text)'
    },
    necessity: {
        type: String,
        enum: ['essential', 'discretionary'],
        default: 'essential'
    },
    notes: {
        type: String,
        default: ''
    },
    isUndone: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for rapid user/persona/date queries
transactionSchema.index({ userId: 1, persona: 1, date: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
