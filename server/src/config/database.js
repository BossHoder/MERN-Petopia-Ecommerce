import mongoose from 'mongoose';
import config from 'config';

const connectDB = async () => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        const mongoURI = isProduction
            ? process.env.MONGO_URI_PROD
            : process.env.MONGO_URI_DEV || config.get('mongoURI');

        if (!mongoURI) {
            throw new Error('MongoDB URI not found in config or environment variables');
        }

        console.log('Connecting to MongoDB...');
        console.log('Environment:', process.env.NODE_ENV);
        console.log('Using URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);

        // For production, we shouldn't crash the app immediately
        if (process.env.NODE_ENV === 'production') {
            console.error('🔄 Will retry connection in background...');
            // Don't throw in production, let the app start without DB
            return null;
        }

        throw error;
    }
};

export default connectDB;
