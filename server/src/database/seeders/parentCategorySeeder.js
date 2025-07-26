import ParentCategory from '../../models/parentCategory.js';
import sampleParentCategories from '../../data/parentCategories.js';
import updateParentCategorySlugs from '../../utils/updateParentCategorySlugs.js';

const seedParentCategories = async (options = { clearExisting: true }) => {
    try {
        console.log('🔄 Seeding parent categories...');

        if (options.clearExisting) {
            // Clear existing data
            await ParentCategory.deleteMany({});
            console.log('   ✅ Cleared existing parent categories');

            // Insert sample data
            const parentCategories = await ParentCategory.insertMany(sampleParentCategories);
            console.log(`   ✅ Inserted ${parentCategories.length} parent categories`);
        } else {
            // Update existing data or insert if not exists
            console.log('   🔄 Updating existing parent categories...');

            for (const sampleData of sampleParentCategories) {
                await ParentCategory.findOneAndUpdate({ name: sampleData.name }, sampleData, {
                    upsert: true,
                    new: true,
                });
            }

            // Ensure all existing categories have slugs
            await updateParentCategorySlugs();
        }

        // Get all parent categories for mapping
        const parentCategories = await ParentCategory.find({});

        // Create mapping for use by other seeders
        const parentCategoryMap = {};
        parentCategories.forEach((pc) => {
            parentCategoryMap[pc.name] = pc._id;
        });

        console.log('✅ Parent categories seeded successfully!');
        return parentCategoryMap;
    } catch (error) {
        console.error('❌ Error seeding parent categories:', error);
        throw error;
    }
};

export default seedParentCategories;
