import Category from '../../models/Category.js';
import sampleCategories from '../../data/Categories.js';

const seedCategories = async (parentCategoryMap = {}) => {
    try {
        console.log('🔄 Seeding categories...');

        // Clear existing data
        await Category.deleteMany({});
        console.log('   ✅ Cleared existing categories');

        // Map parent category names to ObjectIds
        const categoriesWithParentIds = sampleCategories.map((category) => {
            let parentCategoryId;

            // Determine parent category based on category name patterns
            if (category.slug.includes('dog')) {
                parentCategoryId = parentCategoryMap['Dog Supplies'];
            } else if (category.slug.includes('cat')) {
                parentCategoryId = parentCategoryMap['Cat Supplies'];
            } else if (category.slug.includes('bird')) {
                parentCategoryId = parentCategoryMap['Bird Supplies'];
            } else if (category.slug.includes('fish') || category.slug.includes('aquarium')) {
                parentCategoryId = parentCategoryMap['Fish Supplies'];
            } else {
                // Default to Dog Supplies if no pattern matches
                parentCategoryId = parentCategoryMap['Dog Supplies'];
            }

            if (!parentCategoryId) {
                console.warn(`⚠️  No parent category found for ${category.name}, using first available`);
                parentCategoryId = Object.values(parentCategoryMap)[0];
            }

            return {
                ...category,
                parentCategory: parentCategoryId,
            };
        });

        // Insert sample data
        const categories = await Category.insertMany(categoriesWithParentIds);
        console.log(`   ✅ Inserted ${categories.length} categories`);

        // Create mapping for use by other seeders
        const categoryMap = {};
        categories.forEach((cat) => {
            categoryMap[cat.slug] = cat._id;
        });

        console.log('✅ Categories seeded successfully!');
        return categoryMap;
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    }
};

export default seedCategories;
