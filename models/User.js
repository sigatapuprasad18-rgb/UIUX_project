import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    activePersona: {
        type: String,
        enum: ['student', 'working_professional', 'elderly_retiree', 'goal_saver'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: 'MW'
    },
    isGuest: {
        type: Boolean,
        default: false
    },
    settings: {
        monthlyIncome: { type: Number, default: 18000 },
        currency: { type: String, default: '₹' },
        mode: { type: String, default: 'standard' },
        highContrast: { type: Boolean, default: false },
        darkMode: { type: Boolean, default: false },
        dyslexicFont: { type: Boolean, default: false },
        reducedMotion: { type: Boolean, default: false },
        fontSizeStep: { type: Number, default: 0 },
        soundEnabled: { type: Boolean, default: true },
        hapticEnabled: { type: Boolean, default: true },
        coolingOffPeriodHours: { type: Number, default: 24 },
        emailAlerts: { type: Boolean, default: true },
        coachTone: { type: String, default: 'supportive' },
        colorblindSafePalette: { type: String, default: 'none' }
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return bcrypt.compare(candidatePassword, this.password);
    }
    // Backward-compatible fallback for plain demo passwords like 'demo123'
    return candidatePassword === this.password;
};

// Safe JSON serialization (strip password)
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export const User = mongoose.model('User', userSchema);
