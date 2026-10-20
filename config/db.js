import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let dbInstance = null;

export const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('⚠️ MONGODB_URI is not set in environment variables. Falling back to offline mode.');
        return null;
    }

    try {
        console.log('🔄 Connecting to MongoDB Atlas cluster...');
        const conn = await mongoose.connect(uri, {
            dbName: process.env.DB_NAME || 'mindwallet',
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        dbInstance = conn.connection;
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
        return conn.connection;
    } catch (err) {
        isConnected = false;
        console.error(`❌ MongoDB Atlas Connection Error: ${err.message}`);
        console.warn('⚠️ MindWallet server will continue running. Client requests will fall back to local store if MongoDB is unreachable.');
        return null;
    }
};

mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('🔗 Mongoose connection established to MongoDB Atlas.');
});

mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('⚠️ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('🔌 Mongoose disconnected from MongoDB Atlas.');
});

export const getDBStatus = () => {
    const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    const readyState = mongoose.connection.readyState;
    return {
        connected: readyState === 1,
        state: stateMap[readyState] || 'unknown',
        database: mongoose.connection.name || process.env.DB_NAME || 'mindwallet',
        host: mongoose.connection.host || 'MongoDB Atlas'
    };
};
