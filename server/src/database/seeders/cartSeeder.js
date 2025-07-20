import Cart from '../../models/Cart.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import sampleCarts from '../../data/Carts.js';

const seedCarts = async () => {
    try {
        console.log('Seeding carts...');

        // Clear existing data
        await Cart.deleteMany({});

        // Create user mapping (username -> ObjectId)
        const users = await User.find({});
        const userMap = {};
        users.forEach((user) => {
            userMap[user.username] = user._id;
        });

        // Create product mapping (sku -> ObjectId + details)
        const products = await Product.find({});
        const productMap = {};
        products.forEach((product) => {
            productMap[product.sku] = {
                _id: product._id,
                name: product.name,
                images: product.images,
                price: product.price,
            };
        });

        // Process carts with proper ObjectId mapping
        const cartsToInsert = sampleCarts
            .map((cartData) => {
                const userId = userMap[cartData.username];
                if (!userId) {
                    console.warn(`⚠️ User '${cartData.username}' not found. Skipping cart.`);
                    return null;
                }

                // Process cart items with product lookup
                const processedItems = cartData.items
                    .map((item) => {
                        const product = productMap[item.productId];
                        if (!product) {
                            console.warn(`⚠️ Product '${item.productId}' not found. Skipping cart item.`);
                            return null;
                        }

                        return {
                            productId: product._id,
                            productName: product.name,
                            productImage:
                                product.images && product.images.length > 0
                                    ? product.images[0]
                                    : '/images/default-product.jpg',
                            price: product.price,
                            quantity: item.quantity,
                            addedAt: item.addedAt,
                        };
                    })
                    .filter((item) => item !== null);

                // Skip cart if no valid items
                if (processedItems.length === 0) {
                    console.warn(`⚠️ No valid items for cart of user '${cartData.username}'. Skipping cart.`);
                    return null;
                }

                return {
                    username: userId,
                    items: processedItems,
                    updatedAt: cartData.updatedAt,
                };
            })
            .filter((cart) => cart !== null);

        // Insert carts
        if (cartsToInsert.length > 0) {
            const insertedCarts = await Cart.insertMany(cartsToInsert);
            console.log(`✅ ${insertedCarts.length} carts seeded successfully!`);
        } else {
            console.log('⚠️ No valid carts to insert.');
        }
    } catch (error) {
        console.error('Error seeding carts:', error);
        throw error;
    }
};

export default seedCarts;
