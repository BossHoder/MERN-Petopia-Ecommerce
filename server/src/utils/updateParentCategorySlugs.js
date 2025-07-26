import mongoose from 'mongoose';
import ParentCategory from '../models/parentCategory.js';
import { generateSlug } from '../helpers/stringHelper.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Utility function to update existing parent categories with slugs
 * This is a one-time migration utility
 */
const updateParentCategorySlugs = async () => {
    try {
        console.log('🔄 Updating parent category slugs...');

        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('   ✅ Connected to MongoDB');
        }

        // Find all parent categories without slug or with empty slug
        const parentCategories = await ParentCategory.find({
            $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
        });

        console.log(`   📋 Found ${parentCategories.length} parent categories without slug`);

        if (parentCategories.length === 0) {
            console.log('   ✅ All parent categories already have slugs');
            return { success: true, updated: 0 };
        }

        let updatedCount = 0;

        // Update each parent category with slug
        for (const parentCategory of parentCategories) {
            const baseSlug = generateSlug(parentCategory.name);
            let slug = baseSlug;

            // Check if slug already exists
            const existingSlug = await ParentCategory.findOne({
                slug,
                _id: { $ne: parentCategory._id },
            });

            if (existingSlug) {
                // If slug exists, append a number
                let counter = 1;
                do {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                } while (
                    await ParentCategory.findOne({
                        slug,
                        _id: { $ne: parentCategory._id },
                    })
                );
            }

            // Update the parent category
            await ParentCategory.findByIdAndUpdate(parentCategory._id, { slug });
            console.log(`   ✅ Updated "${parentCategory.name}" with slug: "${slug}"`);
            updatedCount++;
        }

        console.log(`✅ Successfully updated ${updatedCount} parent categories with slugs`);
        return { success: true, updated: updatedCount };
    } catch (error) {
        console.error('❌ Error updating parent category slugs:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Run the update if this file is executed directly
 */
const runUpdate = async () => {
    try {
        const result = await updateParentCategorySlugs();
        if (result.success) {
            console.log(`\n🎉 Migration completed successfully! Updated ${result.updated} records.`);
            process.exit(0);
        } else {
            console.error(`\n💥 Migration failed: ${result.error}`);
            process.exit(1);
        }
    } catch (error) {
        console.error('\n💥 Unexpected error:', error);
        process.exit(1);
    }
};

// Run update if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runUpdate();
}

export default updateParentCategorySlugs;
