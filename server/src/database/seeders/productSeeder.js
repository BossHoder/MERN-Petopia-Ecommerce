import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import sampleProducts from '../../data/Products.js';

const seedProducts = async (categoryMap) => {
    try {
        console.log('Seeding products...');

        // Clear existing products
        await Product.deleteMany({});

        // Get all categories to create slug-to-ObjectId mapping
        const categories = await Category.find({});
        const categorySlugMap = {};
        categories.forEach((category) => {
            categorySlugMap[category.slug] = category._id;
        });

        // Process products and map category slugs to ObjectIds
        const productsToInsert = sampleProducts
            .map((productData) => {
                const categoryId = categorySlugMap[productData.category];

                if (!categoryId) {
                    console.warn(
                        `❌ Category with slug "${productData.category}" not found for product ${productData.sku}`,
                    );
                    return null;
                }

                // Remove fields that should not be in the insert data
                const { reviews, numReviews, timestamp, ...cleanProductData } = productData;

                return {
                    ...cleanProductData,
                    category: categoryId, // Convert slug to ObjectId
                };
            })
            .filter((product) => product !== null); // Remove null entries

        // Insert products
        const insertedProducts = await Product.insertMany(productsToInsert);

        console.log(`✅ ${insertedProducts.length} products seeded successfully!`);
        return insertedProducts;
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        throw error;
    }
};

export default seedProducts;
