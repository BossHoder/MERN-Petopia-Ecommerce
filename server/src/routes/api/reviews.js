import express from 'express';
import * as ReviewController from '../../controllers/reviewController.js';

const router = express.Router();

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a specific product
// @access  Public
router.get('/product/:productId', ReviewController.getProductReviews);

export default router;
