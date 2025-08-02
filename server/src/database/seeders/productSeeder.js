import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import sampleProducts from '../../data/Products.js';
import transformedProducts from '../../data/TransformedProducts.js';

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

        // Use only transformed products for now to avoid category mapping issues
        // const allProducts = [...sampleProducts, ...transformedProducts];
        const allProducts = [...transformedProducts];

        // Process products and map category slugs/IDs to ObjectIds
        const productsToInsert = allProducts
            .map((productData) => {
                let categoryId;

                // Handle both slug-based categories (original) and ObjectId-based categories (transformed)
                if (typeof productData.category === 'string') {
                    if (productData.category.length === 24) {
                        // It's already an ObjectId string from transformed data
                        categoryId = productData.category;
                    } else {
                        // It's a slug from original data
                        categoryId = categorySlugMap[productData.category];
                    }
                } else {
                    categoryId = productData.category;
                }

                if (!categoryId) {
                    console.warn(`❌ Category "${productData.category}" not found for product ${productData.sku}`);
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
        console.log(`   - Original sample products: 0 (skipped due to category mapping issues)`);
        console.log(`   - Transformed scraped products: ${transformedProducts.length}`);
        return insertedProducts;
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        throw error;
    }
};

export default seedProducts;
