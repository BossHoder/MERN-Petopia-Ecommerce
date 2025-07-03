import Product from '../../models/Product.js';
import sampleProducts from '../../data/Products.js';

const seedProducts = async () => {
    try {
        console.log('Seeding products...');
        
        // Clear existing products
        await Product.deleteMany({});
        
        // Insert new products
        await Product.insertMany(sampleProducts);
        
        console.log('Products seeded successfully!');
    } catch (error) {
        console.error('Error seeding products:', error);
        throw error;
    }
};

export default seedProducts;