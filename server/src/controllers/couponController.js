import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';
import couponService from '../services/couponService.js';
import { couponQuerySchema } from '../validations/couponValidation.js';

// ===========================================
// PUBLIC COUPON CONTROLLER
// ===========================================
// This controller handles public coupon endpoints for customers

/**
 * @desc    Get all active coupons for customers
 * @route   GET /api/coupons
 * @access  Public
 */
const getActiveCoupons = asyncHandler(async (req, res) => {
    const { error, value } = couponQuerySchema.validate(req.query);
    if (error) {
        return errorResponse(res, error.details[0].message, 400);
    }

    const { page, limit, sort, order, discountType, search } = value;

    // Build filter object for public coupons (only active and valid)
    const now = new Date();
    console.log('🔍 Public coupon query - Current time:', now.toISOString());

    const filters = {
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
    };

    console.log('🔍 Public coupon filters:', JSON.stringify(filters, null, 2));

    // Add optional filters
    if (discountType) filters.discountType = discountType;
    if (search) {
        filters.$or = [{ code: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    try {
        let result = await couponService.getAllCoupons(page, limit, filters, sort, order);

        // If the query fails due to date issues, try a fallback query without date filters
        if (!result.success && result.error && result.error.includes('Cast to date failed')) {
            console.warn('Date filter failed, trying fallback query without date filters');
            const fallbackFilters = { ...filters };
            delete fallbackFilters.validFrom;
            delete fallbackFilters.validUntil;

            result = await couponService.getAllCoupons(page, limit, fallbackFilters, sort, order);

            // Filter out expired coupons manually if fallback query succeeds
            if (result.success) {
                const now = new Date();
                result.coupons = result.coupons.filter((coupon) => {
                    try {
                        const validFrom = new Date(coupon.validFrom);
                        const validUntil = new Date(coupon.validUntil);
                        return validFrom <= now && validUntil >= now;
                    } catch (dateError) {
                        console.warn(`Coupon ${coupon.id} has invalid dates, excluding from results`);
                        return false;
                    }
                });
            }
        }

        if (!result.success) {
            return errorResponse(res, result.error, 500);
        }

        // Transform coupons for public consumption (remove sensitive data)
        const publicCoupons = result.coupons.map((coupon) => ({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
            maxDiscountAmount: coupon.maxDiscountAmount,
            validFrom: coupon.validFrom,
            validUntil: coupon.validUntil,
            perUserLimit: coupon.perUserLimit,
            // Don't expose usage count, usage limit, or admin-specific data
        }));

        return successResponse(
            res,
            {
                coupons: publicCoupons,
                pagination: {
                    currentPage: result.pagination.page,
                    totalPages: result.pagination.pages,
                    totalCoupons: result.pagination.total,
                    hasNext: result.pagination.page < result.pagination.pages,
                    hasPrev: result.pagination.page > 1,
                },
            },
            'Active coupons retrieved successfully',
        );
    } catch (error) {
        console.error('Get active coupons error:', error);

        // Handle specific MongoDB casting errors
        if (error.name === 'CastError' && error.path) {
            return errorResponse(res, `Invalid ${error.path} value provided`, 400);
        }

        return errorResponse(res, 'Failed to fetch coupons', 500);
    }
});

/**
 * @desc    Get coupon by code for validation
 * @route   GET /api/coupons/:code
 * @access  Public
 */
const getCouponByCode = asyncHandler(async (req, res) => {
    const { code } = req.params;

    if (!code) {
        return errorResponse(res, 'Coupon code is required', 400);
    }

    try {
        const result = await couponService.getCouponByCode(code.toUpperCase());

        if (!result.success) {
            return errorResponse(res, result.error, result.error.includes('not found') ? 404 : 500);
        }

        const coupon = result.coupon;

        // Check if coupon is active and valid
        if (!coupon.isActive) {
            return errorResponse(res, 'Coupon is not active', 400);
        }

        const now = new Date();
        if (coupon.validFrom > now) {
            return errorResponse(res, 'Coupon is not yet valid', 400);
        }

        if (coupon.validUntil < now) {
            return errorResponse(res, 'Coupon has expired', 400);
        }

        // Return public coupon data
        const publicCoupon = {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
            maxDiscountAmount: coupon.maxDiscountAmount,
            validFrom: coupon.validFrom,
            validUntil: coupon.validUntil,
            perUserLimit: coupon.perUserLimit,
        };

        return successResponse(res, publicCoupon, 'Coupon retrieved successfully');
    } catch (error) {
        console.error('Get coupon by code error:', error);
        return errorResponse(res, 'Failed to fetch coupon', 500);
    }
});

/**
 * @desc    Validate coupon for order (used during checkout)
 * @route   POST /api/coupons/validate
 * @access  Public (but typically called during checkout)
 */
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderValue, userId } = req.body;

    if (!code || !orderValue) {
        return errorResponse(res, 'Coupon code and order value are required', 400);
    }

    try {
        const result = await couponService.validateCouponForOrder(code.toUpperCase(), orderValue, userId);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(
            res,
            {
                valid: true,
                coupon: {
                    id: result.coupon.id,
                    code: result.coupon.code,
                    discountType: result.coupon.discountType,
                    discountValue: result.coupon.discountValue,
                    maxDiscountAmount: result.coupon.maxDiscountAmount,
                },
                discountAmount: result.discountAmount,
            },
            'Coupon is valid',
        );
    } catch (error) {
        console.error('Validate coupon error:', error);
        return errorResponse(res, 'Failed to validate coupon', 500);
    }
});

export default {
    getActiveCoupons,
    getCouponByCode,
    validateCoupon,
};
