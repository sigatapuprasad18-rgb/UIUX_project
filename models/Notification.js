import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    persona: {
        type: String,
        default: 'student',
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'critical', 'success'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);
