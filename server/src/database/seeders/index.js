import mongoose from 'mongoose';
import connectDB from '../../config/database.js';
import seedUsers from './userSeeder.js';
import seedProducts from './productSeeder.js';
import seedCategories from './categorySeeder.js';
import seedParentCategories from './parentCategorySeeder.js';
import seedOrders from './orderSeeder.js';
import seedCarts from './cartSeeder.js';
import seedPaymentMethods from './paymentSeeder.js';
import seedCoupons from './couponSeeder.js';
import seedNotifications from './notificationSeeder.js';
import seedReviews from './reviewSeeder.js';

const runSeeders = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to database first
        await connectDB();

        // Seed in correct order due to dependencies
        await seedPaymentMethods();

        // Step 1: Seed parent categories (no dependencies)
        console.log('\n📂 Step 1: Parent Categories');
        const parentCategoryMap = await seedParentCategories();

        // Step 2: Seed categories (depends on parent categories)
        console.log('\n📁 Step 2: Categories');
        const categoryMap = await seedCategories(parentCategoryMap);

        // Step 3: Seed products (depends on categories)
        console.log('\n📦 Step 3: Products');
        await seedProducts(categoryMap);

        // Step 4: Seed users (independent)
        console.log('\n👥 Step 4: Users');
        await seedUsers();

        // Step 5: Seed coupons (independent)
        console.log('\n🎫 Step 5: Coupons');
        await seedCoupons();

        // Step 6: Seed carts (depends on users and products)
        console.log('\n🛒 Step 6: Carts');
        await seedCarts();

        // Step 7: Seed orders (depends on users and products)
        console.log('\n📋 Step 7: Orders');
        await seedOrders();

        // Step 8: Seed reviews (depends on users and products)
        console.log('\n⭐ Step 8: Reviews');
        await seedReviews();

        // Step 9: Seed notifications (depends on users)
        console.log('\n🔔 Step 9: Notifications');
        await seedNotifications();

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   • Parent Categories: ${Object.keys(parentCategoryMap).length}`);
        console.log(`   • Categories: ${Object.keys(categoryMap).length}`);
        console.log(`   • Products: Seeded with category mappings`);
        console.log(`   • Users: Seeded`);
        console.log(`   • Coupons: Seeded`);
        console.log(`   • Carts: Seeded`);
        console.log(`   • Orders: Seeded`);
        console.log(`   • Reviews: Seeded`);
        console.log(`   • Notifications: Seeded`);
        console.log(`   • Payment Methods: Seeded`);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        // Close connection only once at the end
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

runSeeders();
