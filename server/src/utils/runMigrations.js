import mongoose from 'mongoose';
import updateParentCategorySlugs from './updateParentCategorySlugs.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Available migrations
 */
const migrations = {
    'parent-category-slugs': {
        name: 'Add slugs to parent categories',
        description: 'Updates existing parent categories to include slug field',
        run: updateParentCategorySlugs,
    },
};

/**
 * Run a specific migration
 */
const runMigration = async (migrationName) => {
    const migration = migrations[migrationName];
    
    if (!migration) {
        console.error(`❌ Migration "${migrationName}" not found.`);
        console.log('\nAvailable migrations:');
        Object.keys(migrations).forEach((key) => {
            console.log(`  - ${key}: ${migrations[key].description}`);
        });
        return false;
    }

    console.log(`🚀 Running migration: ${migration.name}`);
    console.log(`📝 Description: ${migration.description}\n`);

    try {
        const result = await migration.run();
        if (result.success) {
            console.log(`\n✅ Migration "${migrationName}" completed successfully!`);
            return true;
        } else {
            console.error(`\n❌ Migration "${migrationName}" failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        console.error(`\n❌ Migration "${migrationName}" failed with error:`, error);
        return false;
    }
};

/**
 * Run all migrations
 */
const runAllMigrations = async () => {
    console.log('🚀 Running all migrations...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const [key, migration] of Object.entries(migrations)) {
        console.log(`\n📋 Running: ${migration.name}`);
        const success = await runMigration(key);
        
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${Object.keys(migrations).length}`);
    
    return failCount === 0;
};

/**
 * Main function to handle command line arguments
 */
const main = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        const args = process.argv.slice(2);
        const command = args[0];

        if (!command) {
            console.log('📋 Available commands:');
            console.log('  npm run migrate <migration-name>  - Run specific migration');
            console.log('  npm run migrate all               - Run all migrations');
            console.log('  npm run migrate list              - List available migrations');
            console.log('\nAvailable migrations:');
            Object.keys(migrations).forEach((key) => {
                console.log(`  - ${key}: ${migrations[key].description}`);
            });
            process.exit(0);
        }

        if (command === 'list') {
            console.log('📋 Available migrations:');
            Object.keys(migrations).forEach((key) => {
                console.log(`  - ${key}: ${migrations[key].description}`);
            });
            process.exit(0);
        }

        if (command === 'all') {
            const success = await runAllMigrations();
            process.exit(success ? 0 : 1);
        }

        // Run specific migration
        const success = await runMigration(command);
        process.exit(success ? 0 : 1);

    } catch (error) {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    } finally {
        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 Disconnected from MongoDB');
        }
    }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { runMigration, runAllMigrations, migrations };
