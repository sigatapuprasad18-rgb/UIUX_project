import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mindwallet_jwt_super_secret_key_2026';

// Helper to sign JWT
const signToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, persona: user.activePersona },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, persona } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
        }

        const user = await User.create({
            email,
            password,
            name,
            activePersona: persona || 'student',
            avatar: name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'MW'
        });

        const token = signToken(user);
        res.status(201).json({
            message: 'Account created successfully in MongoDB Atlas',
            user,
            token
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, personaRole } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (personaRole && ['student', 'working_professional', 'elderly_retiree', 'goal_saver'].includes(personaRole)) {
            user.activePersona = personaRole;
        }

        user.lastLoginAt = new Date();
        await user.save();

        const token = signToken(user);
        res.json({
            message: 'Signed in successfully with MongoDB Atlas',
            user,
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

// POST /api/auth/guest
router.post('/guest', async (req, res) => {
    try {
        const { persona = 'student' } = req.body;
        const guestEmail = `guest_${Date.now()}@mindwallet.local`;
        const user = await User.create({
            email: guestEmail,
            password: 'guest_session',
            name: 'Demo Guest',
            activePersona: persona,
            avatar: 'DG',
            isGuest: true
        });

        const token = signToken(user);
        res.json({
            message: 'Guest session created in MongoDB Atlas',
            user,
            token
        });
    } catch (err) {
        console.error('Guest login error:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

// PUT /api/auth/persona
router.put('/persona', async (req, res) => {
    try {
        const { userId, personaKey } = req.body;
        if (!userId || !personaKey) {
            return res.status(400).json({ error: 'userId and personaKey are required.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found in MongoDB' });
        }

        user.activePersona = personaKey;
        await user.save();

        res.json({
            message: 'Active persona updated in MongoDB',
            user
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/auth/settings
router.put('/settings', async (req, res) => {
    try {
        const { userId, settings } = req.body;
        if (!userId || !settings) {
            return res.status(400).json({ error: 'userId and settings are required.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found in MongoDB' });
        }

        user.settings = { ...user.settings.toObject(), ...settings };
        await user.save();

        res.json({
            message: 'User settings saved in MongoDB',
            settings: user.settings
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
