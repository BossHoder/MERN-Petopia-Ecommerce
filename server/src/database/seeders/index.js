import mongoose from 'mongoose';
import connectDB from '../../config/database.js';
import seedUsers from './userSeeder.js';
import seedProducts from './productSeeder.js';

const runSeeders = async () => {
    try {
        console.log('Starting database seeding...');
        
        // Connect to database first
        await connectDB();
        
        await seedUsers();
        await seedProducts();
        
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