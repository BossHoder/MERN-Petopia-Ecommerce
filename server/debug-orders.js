import mongoose from 'mongoose';
import Order from './src/models/Order.js';
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

        console.log('🎯 Connecting to MongoDB for debugging...');
        console.log('Environment:', process.env.NODE_ENV);
        console.log('Using URI:', mongoURI.replace(/\/\/.*@/, '//***:***@'));

        await mongoose.connect(mongoURI);
        console.log('🎯 Connected to MongoDB for debugging');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const debugOrders = async () => {
    try {
        await connectDB();

        console.log('\n📊 ORDER DEBUGGING ANALYSIS\n');

        // Get total orders count
        const totalOrders = await Order.countDocuments();
        console.log(`📋 Total orders in database: ${totalOrders}`);

        if (totalOrders === 0) {
            console.log('❌ No orders found in database!');
            process.exit(0);
        }

        // Get orders by status
        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' },
                },
            },
            { $sort: { count: -1 } },
        ]);

        console.log('\n📈 Orders by status:');
        statusCounts.forEach((status) => {
            console.log(`  ${status._id || 'undefined'}: ${status.count} orders, ${status.totalRevenue}₫ revenue`);
        });

        // Get sample orders with details
        console.log('\n🔍 Sample orders (first 5):');
        const sampleOrders = await Order.find()
            .limit(5)
            .select('orderNumber orderStatus totalPrice isPaid createdAt')
            .sort({ createdAt: -1 });

        sampleOrders.forEach((order) => {
            console.log(
                `  Order ${order.orderNumber}: Status=${order.orderStatus}, Total=${order.totalPrice}₫, Paid=${order.isPaid}, Created=${order.createdAt}`,
            );
        });

        // Check what would be included in revenue calculation (not cancelled/refunded)
        const revenueOrders = await Order.find({
            orderStatus: { $nin: ['cancelled', 'refunded'] },
        });

        console.log(`\n💰 Revenue calculation analysis:`);
        console.log(`  Orders excluded (cancelled/refunded): ${totalOrders - revenueOrders.length}`);
        console.log(`  Orders included in revenue: ${revenueOrders.length}`);

        const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        console.log(`  Total revenue from included orders: ${totalRevenue}₫`);

        // Check paid vs unpaid
        const paidOrders = revenueOrders.filter((order) => order.isPaid);
        const unpaidOrders = revenueOrders.filter((order) => !order.isPaid);

        console.log(`\n💳 Payment status of revenue orders:`);
        console.log(`  Paid orders: ${paidOrders.length}`);
        console.log(`  Unpaid orders: ${unpaidOrders.length}`);

        const paidRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const unpaidRevenue = unpaidOrders.reduce((sum, order) => sum + order.totalPrice, 0);

        console.log(`  Revenue from paid orders: ${paidRevenue}₫`);
        console.log(`  Revenue from unpaid orders: ${unpaidRevenue}₫`);

        console.log('\n✅ Debug analysis complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during debugging:', error);
        process.exit(1);
    }
};

debugOrders();
