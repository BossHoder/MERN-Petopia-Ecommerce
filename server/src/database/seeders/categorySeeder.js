import Category from '../../models/Category.js';
import sampleCategories from '../../data/Categories.js';

const seedCategories = async () => {
    try {
        console.log('Seeding categories...');

        // Clear existing data
        await Category.deleteMany({});

        // Insert sample data
        await Category.insertMany(sampleCategories);

        console.log('Categories seeded successfully!');
    } catch (error) {
        console.error('Error seeding categories:', error);
        throw error;
    }
};

export default seedCategories;
