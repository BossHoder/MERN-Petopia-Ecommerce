// ===========================================
// COUPON SERVICE
// ===========================================
// This service handles coupon-related business logic

import Coupon from '../models/Coupon.js';
import { validateCouponForOrder, generateCouponCode } from '../helpers/couponHelper.js';
import { createCouponDto, couponAdminDto, couponListDto } from '../dto/couponDto.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

class CouponService {
    // Create new coupon
    async createCoupon(couponData, createdBy) {
        try {
            console.log('🎫 CouponService: Creating coupon with data:', JSON.stringify(couponData, null, 2));
            console.log('🎫 CouponService: Created by user:', createdBy);

            // Validate coupon data
            const dto = createCouponDto({ ...couponData, createdBy });
            console.log('🎫 CouponService: DTO created:', JSON.stringify(dto, null, 2));

            // Check if coupon code already exists
            const existingCoupon = await Coupon.findOne({ code: dto.code });
            if (existingCoupon) {
                throw new Error(ERROR_MESSAGES.COUPON_CODE_EXISTS);
            }

            // Create coupon
            const coupon = new Coupon(dto);
            await coupon.save();

            return {
                success: true,
                message: 'Coupon created successfully',
                coupon: couponAdminDto(coupon),
            };
        } catch (error) {
            console.error('Error creating coupon:', error);

            // Handle Mongoose validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map((err) => err.message);
                console.error('🚫 Mongoose validation errors:', validationErrors);
                return { success: false, error: validationErrors.join(', ') };
            }

            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get all coupons (admin)
    async getAllCoupons(page = 1, limit = 20, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const query = this.buildCouponQuery(filters);

            console.log('🔍 CouponService query:', JSON.stringify(query, null, 2));

            const [coupons, total] = await Promise.all([
                Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
                Coupon.countDocuments(query),
            ]);

            return {
                success: true,
                coupons: couponListDto(coupons),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Error getting coupons:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get coupon by ID
    async getCouponById(couponId) {
        try {
            const coupon = await Coupon.findById(couponId)
                .populate('createdBy', 'name email')
                .populate('applicableProducts', 'name images price')
                .populate('applicableCategories', 'name slug')
                .populate('excludeProducts', 'name images price')
                .populate('excludeCategories', 'name slug');

            if (!coupon) {
                throw new Error(ERROR_MESSAGES.COUPON_NOT_FOUND);
            }

            return {
                success: true,
                coupon: couponAdminDto(coupon),
            };
        } catch (error) {
            console.error('Error getting coupon:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Update coupon
    async updateCoupon(couponId, updateData) {
        try {
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                throw new Error(ERROR_MESSAGES.COUPON_NOT_FOUND);
            }

            // Update coupon fields
            Object.keys(updateData).forEach((key) => {
                if (updateData[key] !== undefined) {
                    coupon[key] = updateData[key];
                }
            });

            await coupon.save();

            return {
                success: true,
                message: 'Coupon updated successfully',
                coupon: couponAdminDto(coupon),
            };
        } catch (error) {
            console.error('Error updating coupon:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Delete coupon
    async deleteCoupon(couponId) {
        try {
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                throw new Error(ERROR_MESSAGES.COUPON_NOT_FOUND);
            }

            await coupon.deleteOne();

            return {
                success: true,
                message: 'Coupon deleted successfully',
            };
        } catch (error) {
            console.error('Error deleting coupon:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Validate coupon for user
    async validateCoupon(couponCode, userId, orderValue, cartItems = []) {
        try {
            const result = await validateCouponForOrder(couponCode, userId, orderValue, cartItems);
            return {
                success: true,
                validation: result,
            };
        } catch (error) {
            console.error('Error validating coupon:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get available coupons for user
    async getAvailableCoupons(userId, orderValue = 0) {
        try {
            const coupons = await Coupon.findValidCoupons(userId, orderValue);

            return {
                success: true,
                coupons: coupons.map((coupon) => ({
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    minOrderValue: coupon.minOrderValue,
                    maxDiscountAmount: coupon.maxDiscountAmount,
                    validUntil: coupon.validUntil,
                })),
            };
        } catch (error) {
            console.error('Error getting available coupons:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Apply coupon usage
    async applyCouponUsage(couponCode, userId, orderValue) {
        try {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (!coupon) {
                throw new Error(ERROR_MESSAGES.COUPON_NOT_FOUND);
            }

            const discountAmount = coupon.calculateDiscount(orderValue);
            await coupon.applyCoupon(userId, orderValue);

            return {
                success: true,
                discountAmount,
                message: 'Coupon applied successfully',
            };
        } catch (error) {
            console.error('Error applying coupon usage:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Generate unique coupon code
    async generateUniqueCouponCode(length = 8) {
        try {
            let code;
            let isUnique = false;
            let attempts = 0;

            while (!isUnique && attempts < 10) {
                code = generateCouponCode(length);
                const existingCoupon = await Coupon.findOne({ code });
                if (!existingCoupon) {
                    isUnique = true;
                }
                attempts++;
            }

            if (!isUnique) {
                throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            }

            return {
                success: true,
                code,
            };
        } catch (error) {
            console.error('Error generating coupon code:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get coupon statistics
    async getCouponStats(couponId = null) {
        try {
            let query = {};
            if (couponId) {
                query._id = couponId;
            }

            const stats = await Coupon.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalCoupons: { $sum: 1 },
                        activeCoupons: { $sum: { $cond: ['$isActive', 1, 0] } },
                        totalUsage: { $sum: '$usageCount' },
                        totalDiscount: { $sum: { $sum: '$usedBy.discountAmount' } },
                    },
                },
            ]);

            return {
                success: true,
                stats: stats[0] || {
                    totalCoupons: 0,
                    activeCoupons: 0,
                    totalUsage: 0,
                    totalDiscount: 0,
                },
            };
        } catch (error) {
            console.error('Error getting coupon stats:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Helper method to build query for filtering coupons
    buildCouponQuery(filters) {
        const query = {};

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        if (filters.discountType) {
            query.discountType = filters.discountType;
        }

        if (filters.search) {
            query.$or = [
                { code: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
            ];
        }

        // Handle date range filters (admin use case)
        if (filters.validFrom && filters.validUntil && typeof filters.validFrom === 'string') {
            query.validFrom = { $gte: new Date(filters.validFrom) };
            query.validUntil = { $lte: new Date(filters.validUntil) };
        }

        // Handle individual date filters (public API use case)
        if (filters.validFrom && typeof filters.validFrom === 'object') {
            query.validFrom = filters.validFrom;
        }

        if (filters.validUntil && typeof filters.validUntil === 'object') {
            query.validUntil = filters.validUntil;
        }

        return query;
    }
}

export default new CouponService();
