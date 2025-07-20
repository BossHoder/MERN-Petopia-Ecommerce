import ParentCategory from '../../models/parentCategory.js';
import sampleParentCategories from '../../data/parentCategories.js';

const seedParentCategories = async () => {
    try {
        console.log('🔄 Seeding parent categories...');

        // Clear existing data
        await ParentCategory.deleteMany({});
        console.log('   ✅ Cleared existing parent categories');

        // Insert sample data
        const parentCategories = await ParentCategory.insertMany(sampleParentCategories);
        console.log(`   ✅ Inserted ${parentCategories.length} parent categories`);

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
