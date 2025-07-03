import ParentCategory from '../../models/parentCategory.js';
import sampleParentCategories from '../../data/parentCategories.js';

const seedParentCategories = async () => {
    try {
        console.log('Seeding parent categories...');
        
        // Clear existing data
        await ParentCategory.deleteMany({});
        
        // Insert sample data
        await ParentCategory.insertMany(sampleParentCategories);
        
        console.log('Parent categories seeded successfully!');
    } catch (error) {
        console.error('Error seeding parent categories:', error);
        throw error;
    }
};

export default seedParentCategories;