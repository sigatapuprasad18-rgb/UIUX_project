import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import { seedDatabase } from './seed.js';

// Route imports
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import subscriptionRoutes from './routes/subscriptions.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static assets
app.use(express.static(__dirname));

// Mount REST API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch-all for single-page app routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: `API route ${req.path} not found` });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server and Initialize MongoDB
const startServer = async () => {
    console.log('====================================================');
    console.log('🚀 MindWallet — Modern Financial Management Platform');
    console.log('====================================================');

    // Connect to MongoDB Atlas
    const conn = await connectDB();
    if (conn) {
        // Auto-seed default persona archetypes if database is empty
        await seedDatabase(false);
    } else {
        console.warn('⚠️ Starting server in Offline/LocalStorage fallback mode.');
    }

    app.listen(PORT, () => {
        const status = getDBStatus();
        console.log(`\n✨ Server listening at http://localhost:${PORT}`);
        console.log(`📊 Cloud Database: ${status.connected ? '🟢 MongoDB Atlas (' + status.database + ')' : '🟠 Disconnected (Local Fallback Active)'}`);
        console.log(`🌐 Ready to serve UI and REST API.\n`);
    });
};

startServer().catch(err => {
    console.error('Fatal startup error:', err);
});
