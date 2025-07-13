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

        // Seed in correct order due to dependencies
        await seedPaymentMethods();
        await seedParentCategories(); // Must be first
        await seedCategories(); // Depends on parent categories
        await seedProducts(); // Depends on categories
        await seedUsers(); // Independent
        await seedCarts(); // Depends on users and products
        await seedOrders(); // Depends on users and products

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
