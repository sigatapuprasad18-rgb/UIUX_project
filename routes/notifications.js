import express from 'express';
import { Notification } from '../models/Notification.js';

const router = express.Router();

// GET /api/notifications
router.get('/', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student' } = req.query;
        const notifications = await Notification.find({ userId, persona }).sort({ createdAt: -1 }).limit(30);
        const unreadCount = await Notification.countDocuments({ userId, persona, read: false });

        res.json({
            success: true,
            unreadCount,
            notifications
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/notifications
router.post('/', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student', title, message, type = 'info' } = req.body;
        if (!title || !message) {
            return res.status(400).json({ error: 'title and message are required' });
        }

        const notif = await Notification.create({
            userId,
            persona,
            title,
            message,
            type,
            read: false
        });

        res.status(201).json({ success: true, notification: notif });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const notif = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        res.json({ success: true, notification: notif });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
    try {
        const { userId = 'guest', persona = 'student' } = req.body;
        await Notification.updateMany({ userId, persona, read: false }, { read: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
