import mongoose from 'mongoose';
import connectDB from '../../config/database.js';
import seedUsers from './userSeeder.js';
import seedProducts from './productSeeder.js';
import seedCategories from './categorySeeder.js';
import seedParentCategories from './parentCategorySeeder.js';
import seedOrders from './orderSeeder.js';
import seedCarts from './cartSeeder.js';
import seedPaymentMethods from './paymentSeeder.js';

const runSeeders = async () => {
    try {
        console.log('Starting database seeding...');
        
        // Connect to database first
        await connectDB();
        await seedPaymentMethods();
        await seedCarts();
        await seedOrders();
        // await seedParentCategories();
        // await seedCategories();
        // await seedProducts();
        // await seedUsers();
        
        console.log('Database seeding completed!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        // Close connection only once at the end
        await mongoose.connection.close();
        process.exit(0);
    }
};

runSeeders();