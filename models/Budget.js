import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
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
    category: {
        type: String,
        required: true,
        trim: true
    },
    limit: {
        type: Number,
        required: true,
        min: 0
    },
    icon: {
        type: String,
        default: '📊'
    },
    period: {
        type: String,
        default: 'monthly'
    }
}, {
    timestamps: true
});

budgetSchema.index({ userId: 1, persona: 1, category: 1 }, { unique: true });

export const Budget = mongoose.model('Budget', budgetSchema);
