// ===========================================
// COUPON HELPER FUNCTIONS
// ===========================================
// This file contains utility functions for coupon operations

import Coupon from '../models/Coupon.js';

// Generate random coupon code
export const generateCouponCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Validate coupon code format
export const validateCouponCode = (code) => {
    const codeRegex = /^[A-Z0-9]{3,20}$/;
    return codeRegex.test(code);
};

// Check if coupon is valid for user and order
export const validateCouponForOrder = async (couponCode, userId, orderValue, cartItems = []) => {
    try {
        const coupon = await Coupon.findOne({ 
            code: couponCode.toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            return {
                isValid: false,
                message: 'Coupon not found or inactive'
            };
        }

        // Check if coupon is valid (not expired, within usage limits)
        if (!coupon.isValid) {
            return {
                isValid: false,
                message: 'Coupon is expired or has reached usage limit'
            };
        }

        // Check if user can use this coupon
        if (!coupon.canBeUsedBy(userId)) {
            return {
                isValid: false,
                message: 'You have already used this coupon maximum times'
            };
        }

        // Check minimum order value
        if (orderValue < coupon.minOrderValue) {
            return {
                isValid: false,
                message: `Minimum order value is ${coupon.minOrderValue.toLocaleString()}đ`
            };
        }

        // Check applicable products/categories if specified
        if (coupon.applicableProducts.length > 0 || coupon.applicableCategories.length > 0) {
            const isApplicable = await checkCouponApplicability(coupon, cartItems);
            if (!isApplicable) {
                return {
                    isValid: false,
                    message: 'Coupon is not applicable to items in your cart'
                };
            }
        }

        // Check excluded products/categories
        const hasExcludedItems = await checkCouponExclusions(coupon, cartItems);
        if (hasExcludedItems) {
            return {
                isValid: false,
                message: 'Coupon cannot be applied to some items in your cart'
            };
        }

        // Calculate discount amount
        const discountAmount = coupon.calculateDiscount(orderValue);

        return {
            isValid: true,
            message: 'Coupon is valid',
            discountAmount,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        };

    } catch (error) {
        console.error('Error validating coupon:', error);
        return {
            isValid: false,
            message: 'Error validating coupon'
        };
    }
};

// Check if coupon is applicable to cart items
const checkCouponApplicability = async (coupon, cartItems) => {
    if (coupon.applicableProducts.length === 0 && coupon.applicableCategories.length === 0) {
        return true; // No restrictions
    }

    const Product = mongoose.model('Product');
    
    for (const item of cartItems) {
        const product = await Product.findById(item.productId).populate('category');
        
        if (product) {
            // Check if product is in applicable products
            if (coupon.applicableProducts.includes(product._id)) {
                return true;
            }
            
            // Check if product's category is in applicable categories
            if (coupon.applicableCategories.includes(product.category._id)) {
                return true;
            }
        }
    }
    
    return false;
};

// Check if cart has excluded items
const checkCouponExclusions = async (coupon, cartItems) => {
    if (coupon.excludeProducts.length === 0 && coupon.excludeCategories.length === 0) {
        return false; // No exclusions
    }

    const Product = mongoose.model('Product');
    
    for (const item of cartItems) {
        const product = await Product.findById(item.productId).populate('category');
        
        if (product) {
            // Check if product is in excluded products
            if (coupon.excludeProducts.includes(product._id)) {
                return true;
            }
            
            // Check if product's category is in excluded categories
            if (coupon.excludeCategories.includes(product.category._id)) {
                return true;
            }
        }
    }
    
    return false;
};

// Calculate best available coupon for user
export const findBestCouponForOrder = async (userId, orderValue, cartItems = []) => {
    try {
        const availableCoupons = await Coupon.findValidCoupons(userId, orderValue);
        
        if (availableCoupons.length === 0) {
            return null;
        }

        let bestCoupon = null;
        let maxDiscount = 0;

        for (const coupon of availableCoupons) {
            const validation = await validateCouponForOrder(coupon.code, userId, orderValue, cartItems);
            
            if (validation.isValid && validation.discountAmount > maxDiscount) {
                maxDiscount = validation.discountAmount;
                bestCoupon = {
                    ...validation,
                    savings: validation.discountAmount
                };
            }
        }

        return bestCoupon;
    } catch (error) {
        console.error('Error finding best coupon:', error);
        return null;
    }
};

// Apply coupon to order
export const applyCouponToOrder = async (couponCode, userId, orderValue, cartItems = []) => {
    try {
        const validation = await validateCouponForOrder(couponCode, userId, orderValue, cartItems);
        
        if (!validation.isValid) {
            return validation;
        }

        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        
        // Apply coupon usage (don't save to DB yet, that happens when order is created)
        return {
            isValid: true,
            message: 'Coupon applied successfully',
            discountAmount: validation.discountAmount,
            coupon: {
                id: coupon._id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        };

    } catch (error) {
        console.error('Error applying coupon:', error);
        return {
            isValid: false,
            message: 'Error applying coupon'
        };
    }
};

// Get coupon usage statistics
export const getCouponUsageStats = async (couponId) => {
    try {
        const coupon = await Coupon.findById(couponId);
        
        if (!coupon) {
            return null;
        }

        const totalUsage = coupon.usageCount;
        const totalDiscount = coupon.usedBy.reduce((total, usage) => total + usage.discountAmount, 0);
        const averageOrderValue = coupon.usedBy.length > 0 
            ? coupon.usedBy.reduce((total, usage) => total + usage.orderValue, 0) / coupon.usedBy.length
            : 0;

        return {
            totalUsage,
            totalDiscount,
            averageOrderValue,
            usageRate: coupon.usageLimit ? (totalUsage / coupon.usageLimit * 100) : null,
            isActive: coupon.isActive,
            isValid: coupon.isValid
        };

    } catch (error) {
        console.error('Error getting coupon stats:', error);
        return null;
    }
};
