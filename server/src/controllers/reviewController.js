import Review from '../models/Review.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    try {
        const reviews = await Review.getProductReviews(productId, req.query);
        return successResponse(res, reviews);
    } catch (error) {
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
    }
});

export { getProductReviews };
