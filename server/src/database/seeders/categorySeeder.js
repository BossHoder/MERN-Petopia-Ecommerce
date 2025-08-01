import Category from '../../models/Category.js';
import ParentCategory from '../../models/parentCategory.js';
import sampleCategories from '../../data/Categories.js';

const seedCategories = async (options = { clearExisting: true }) => {
    try {
        console.log('🔄 Seeding categories...');

        // Get all parent categories for mapping
        const parentCategories = await ParentCategory.find({});
        const parentCategoryMap = {};
        parentCategories.forEach((pc) => {
            parentCategoryMap[pc.name] = pc._id;
        });

        if (options.clearExisting) {
            // Clear existing data
            await Category.deleteMany({});
            console.log('   ✅ Cleared existing categories');

            // Map parent category names to ObjectIds and insert
            const categoriesToInsert = sampleCategories.map((category) => {
                const parentCategoryId = parentCategoryMap[category.parentCategoryName];
                if (!parentCategoryId) {
                    throw new Error(`Parent category "${category.parentCategoryName}" not found`);
                }

                const { parentCategoryName, ...categoryData } = category;
                return {
                    ...categoryData,
                    parentCategory: parentCategoryId,
                };
            });

            const categories = await Category.insertMany(categoriesToInsert);
            console.log(`   ✅ Inserted ${categories.length} categories`);
        } else {
            // Update existing data or insert if not exists
            console.log('   🔄 Updating existing categories...');

            for (const sampleData of sampleCategories) {
                const parentCategoryId = parentCategoryMap[sampleData.parentCategoryName];
                if (!parentCategoryId) {
                    console.warn(
                        `⚠️  Parent category "${sampleData.parentCategoryName}" not found, skipping "${sampleData.name}"`,
                    );
                    continue;
                }

                const { parentCategoryName, ...categoryData } = sampleData;
                const categoryWithParent = {
                    ...categoryData,
                    parentCategory: parentCategoryId,
                };

                await Category.findOneAndUpdate({ name: categoryData.name }, categoryWithParent, {
                    upsert: true,
                    new: true,
                });
            }
        }

        console.log('✅ Categories seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    }
};

export default seedCategories;
