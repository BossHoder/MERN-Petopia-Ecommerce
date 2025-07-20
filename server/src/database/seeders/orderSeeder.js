import Order from '../../models/Order.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import sampleOrders from '../../data/Orders.js';

const seedOrders = async () => {
    try {
        console.log('Seeding orders...');

        // Clear existing data
        await Order.deleteMany({});

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

        // Process orders with proper ObjectId mapping
        const ordersToInsert = sampleOrders
            .map((orderData) => {
                const userId = userMap[orderData.username];
                if (!userId) {
                    console.warn(`⚠️ User '${orderData.username}' not found. Skipping order.`);
                    return null;
                }

                // Process order items with product lookup
                const processedItems = orderData.orderItems
                    .map((item) => {
                        const product = productMap[item.productId];
                        if (!product) {
                            console.warn(`⚠️ Product '${item.productId}' not found. Skipping order item.`);
                            return null;
                        }

                        return {
                            productId: product._id,
                            productName: product.name,
                            image:
                                product.images && product.images.length > 0
                                    ? product.images[0]
                                    : '/images/default-product.jpg',
                            price: product.price,
                            quantity: item.quantity,
                            variantId: item.variantId || undefined,
                        };
                    })
                    .filter((item) => item !== null);

                // Skip order if no valid items
                if (processedItems.length === 0) {
                    console.warn(`⚠️ No valid items for order of user '${orderData.username}'. Skipping order.`);
                    return null;
                }

                return {
                    orderNumber: orderData.orderNumber,
                    username: userId,
                    orderItems: processedItems,
                    shippingAddress: orderData.shippingAddress,
                    // Calculate itemsPrice from order items
                    itemsPrice: processedItems.reduce((total, item) => total + item.price * item.quantity, 0),
                    shippingPrice: orderData.shippingPrice || 5.0,
                    taxPrice: orderData.taxPrice || 0,
                    discount: orderData.discount || 0,
                    totalAmount: orderData.totalAmount,
                    paymentMethod: orderData.paymentMethod,
                    paymentResult: orderData.paymentResult,
                    status: orderData.status,
                };
            })
            .filter((order) => order !== null);

        // Insert orders
        if (ordersToInsert.length > 0) {
            const insertedOrders = await Order.insertMany(ordersToInsert);
            console.log(`✅ ${insertedOrders.length} orders seeded successfully!`);
        } else {
            console.log('⚠️ No valid orders to insert.');
        }
    } catch (error) {
        console.error('Error seeding orders:', error);
        throw error;
    }
};

export default seedOrders;
