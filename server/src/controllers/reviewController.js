import Review from '../models/Review.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // Sử dụng static method đã có trong model
    const reviews = await Review.getProductReviews(productId, req.query);

    res.status(200).json({
        success: true,
        data: reviews,
    });
});

export { getProductReviews };
