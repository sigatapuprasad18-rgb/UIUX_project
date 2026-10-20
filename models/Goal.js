import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true,
        trim: true
    },
    target: {
        type: Number,
        required: true,
        min: 0
    },
    current: {
        type: Number,
        default: 0,
        min: 0
    },
    monthlyContribution: {
        type: Number,
        default: 0
    },
    deadline: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'Savings'
    },
    icon: {
        type: String,
        default: '🎯'
    },
    autoDeposit: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Goal = mongoose.model('Goal', goalSchema);
