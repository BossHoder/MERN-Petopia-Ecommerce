import 'dotenv/config.js';
import mongoose from 'mongoose';
import Cart from '../src/models/Cart.js';

// Force production database for cleanup
const dbConnection = process.env.MONGO_URI_PROD;

async function cleanupCarts() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(dbConnection);
        console.log('✅ Connected to MongoDB');

        // Find and delete carts with null user
        const result = await Cart.deleteMany({ user: null });
        console.log(`🗑️ Deleted ${result.deletedCount} cart(s) with null user`);

        // Find and delete carts with undefined user
        const result2 = await Cart.deleteMany({ user: { $exists: false } });
        console.log(`🗑️ Deleted ${result2.deletedCount} cart(s) with undefined user`);

        console.log('✅ Cleanup completed successfully');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

cleanupCarts();
