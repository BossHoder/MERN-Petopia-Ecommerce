// ===========================================
// COUPON DATA TRANSFER OBJECTS
// ===========================================
// This file contains DTOs for transforming coupon data

// Basic coupon info for public API
export const couponPublicDto = (coupon) => {
    return {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        isValid: coupon.isValid,
        isExpired: coupon.isExpired
    };
};

// Detailed coupon info for admin
export const couponAdminDto = (coupon) => {
    return {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        perUserLimit: coupon.perUserLimit,
        minOrderValue: coupon.minOrderValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        applicableProducts: coupon.applicableProducts,
        applicableCategories: coupon.applicableCategories,
        excludeProducts: coupon.excludeProducts,
        excludeCategories: coupon.excludeCategories,
        isActive: coupon.isActive,
        isValid: coupon.isValid,
        isExpired: coupon.isExpired,
        usedBy: coupon.usedBy,
        createdBy: coupon.createdBy,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt
    };
};

// Coupon usage info
export const couponUsageDto = (usage) => {
    return {
        user: usage.user,
        usedAt: usage.usedAt,
        orderValue: usage.orderValue,
        discountAmount: usage.discountAmount
    };
};

// Coupon validation result
export const couponValidationDto = (isValid, message = null, discountAmount = 0) => {
    return {
        isValid,
        message,
        discountAmount
    };
};

// Coupon list for admin dashboard
export const couponListDto = (coupons) => {
    return coupons.map(coupon => ({
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        usageCount: coupon.usageCount,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
        isValid: coupon.isValid,
        isExpired: coupon.isExpired,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        createdAt: coupon.createdAt
    }));
};

// Create coupon DTO
export const createCouponDto = (data) => {
    return {
        code: data.code?.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit || 1,
        minOrderValue: data.minOrderValue || 0,
        maxDiscountAmount: data.maxDiscountAmount,
        validFrom: data.validFrom || new Date(),
        validUntil: data.validUntil,
        applicableProducts: data.applicableProducts || [],
        applicableCategories: data.applicableCategories || [],
        excludeProducts: data.excludeProducts || [],
        excludeCategories: data.excludeCategories || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: data.createdBy
    };
};
