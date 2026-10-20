import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'annual', 'yearly'],
        default: 'monthly'
    },
    nextBilling: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Subscriptions'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
