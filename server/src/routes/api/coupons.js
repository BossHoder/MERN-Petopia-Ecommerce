import { Router } from 'express';
import couponController from '../../controllers/couponController.js';

const router = Router();

// ===========================================
// PUBLIC COUPON ROUTES
// ===========================================

/**
 * @route   GET /api/coupons
 * @desc    Get all active coupons for customers
 * @access  Public
 * @query   page, limit, sort, order, discountType, search
 */
router.get('/', couponController.getActiveCoupons);

/**
 * @route   GET /api/coupons/:code
 * @desc    Get coupon by code for validation
 * @access  Public
 */
router.get('/:code', couponController.getCouponByCode);

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate coupon for order (used during checkout)
 * @access  Public
 */
router.post('/validate', couponController.validateCoupon);

export default router;
