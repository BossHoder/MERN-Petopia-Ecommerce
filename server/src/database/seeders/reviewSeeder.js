import Review from '../../models/Review.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import sampleReviews from '../../data/Reviews.js';

const seedReviews = async () => {
    try {
        console.log('Seeding reviews...');

        // Clear existing reviews
        await Review.deleteMany({});

        // Get all products and users for mapping
        const products = await Product.find({});
        const users = await User.find({});
        const orders = await Order.find({});

        // Create maps for quick lookup
        const productMap = {};
        products.forEach((product) => {
            productMap[product.sku] = product._id;
        });

        const userMap = {};
        users.forEach((user) => {
            userMap[user.username] = user._id;
        });

        // Process reviews and populate ObjectIds
        const reviewsToInsert = sampleReviews
            .map((reviewData) => {
                const productId = productMap[reviewData.productSku];
                const userId = userMap[reviewData.username];

                if (!productId) {
                    console.warn(`Product with SKU ${reviewData.productSku} not found`);
                    return null;
                }

                if (!userId) {
                    console.warn(`User with username ${reviewData.username} not found`);
                    return null;
                }

                // Find a matching order for verified purchase (optional)
                const userOrder = orders.find(
                    (order) =>
                        order.username.toString() === userId.toString() &&
                        order.orderItems.some((item) => item.productId.toString() === productId.toString()),
                );

                return {
                    product: productId,
                    user: userId,
                    title: reviewData.title,
                    comment: reviewData.comment,
                    rating: reviewData.rating,
                    status: reviewData.status,
                    helpfulVotes: reviewData.helpfulVotes,
                    verifiedPurchase: reviewData.verifiedPurchase,
                    order: userOrder ? userOrder._id : null,
                    images: reviewData.images,
                };
            })
            .filter((review) => review !== null); // Remove null entries

        // Insert reviews
        const insertedReviews = await Review.insertMany(reviewsToInsert);

        // Update product ratings based on reviews
        for (const product of products) {
            const productReviews = insertedReviews.filter(
                (review) => review.product.toString() === product._id.toString(),
            );

            if (productReviews.length > 0) {
                const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
                const averageRating = totalRating / productReviews.length;

                await Product.findByIdAndUpdate(product._id, {
                    ratings: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                });
            }
        }

        console.log(`✅ ${insertedReviews.length} reviews seeded successfully!`);
        return insertedReviews;
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
        throw error;
    }
};

export default seedReviews;
