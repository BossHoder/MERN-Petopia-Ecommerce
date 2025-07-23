import Joi from 'joi';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Cart validation schemas
 */

export const addToCartSchema = Joi.object({
    productId: Joi.string().trim().required().messages({
        'any.required': ERROR_MESSAGES.PRODUCT_ID_REQUIRED,
    }),

    variantId: Joi.string().trim().optional(),

    quantity: Joi.number().integer().min(1).max(100).default(1).messages({
        'number.min': ERROR_MESSAGES.QUANTITY_MIN,
        'number.max': ERROR_MESSAGES.QUANTITY_MAX,
        'number.integer': ERROR_MESSAGES.QUANTITY_INTEGER,
    }),

    productData: Joi.object({
        name: Joi.string().required(),
        image: Joi.string().required(),
        price: Joi.number().positive().required(),
    }).optional(),
});

export const updateCartItemSchema = Joi.object({
    productId: Joi.string().trim().required().messages({
        'any.required': ERROR_MESSAGES.PRODUCT_ID_REQUIRED,
    }),

    variantId: Joi.string().trim().optional(),

    quantity: Joi.number().integer().min(0).max(100).required().messages({
        'number.min': ERROR_MESSAGES.QUANTITY_MIN_NEGATIVE,
        'number.max': ERROR_MESSAGES.QUANTITY_MAX,
        'number.integer': ERROR_MESSAGES.QUANTITY_INTEGER,
        'any.required': ERROR_MESSAGES.QUANTITY_REQUIRED,
    }),
});

export const removeFromCartSchema = Joi.object({
    productId: Joi.string().trim().required().messages({
        'any.required': ERROR_MESSAGES.PRODUCT_ID_REQUIRED,
    }),

    variantId: Joi.string().trim().optional(),
});

export const applyCouponToCartSchema = Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(20).required().messages({
        'string.min': ERROR_MESSAGES.COUPON_CODE_MIN,
        'string.max': ERROR_MESSAGES.COUPON_CODE_MAX,
        'any.required': ERROR_MESSAGES.COUPON_CODE_REQUIRED,
    }),

    discount: Joi.number().min(0).required().messages({
        'number.min': ERROR_MESSAGES.DISCOUNT_MIN_NEGATIVE,
        'any.required': ERROR_MESSAGES.DISCOUNT_REQUIRED,
    }),

    discountType: Joi.string().valid('percentage', 'fixed').required().messages({
        'any.only': ERROR_MESSAGES.DISCOUNT_TYPE_ONLY,
        'any.required': ERROR_MESSAGES.DISCOUNT_TYPE_REQUIRED,
    }),
});

export const updateShippingAddressSchema = Joi.object({
    city: Joi.string().trim().min(2).max(100).optional().messages({
        'string.min': ERROR_MESSAGES.CITY_MIN,
        'string.max': ERROR_MESSAGES.CITY_MAX,
    }),

    district: Joi.string().trim().min(2).max(100).optional().messages({
        'string.min': ERROR_MESSAGES.DISTRICT_MIN,
        'string.max': ERROR_MESSAGES.DISTRICT_MAX,
    }),
});

export const mergeCartSchema = Joi.object({
    sessionId: Joi.string().trim().required().messages({
        'any.required': ERROR_MESSAGES.SESSION_ID_REQUIRED,
    }),

    username: Joi.string().trim().required().messages({
        'any.required': ERROR_MESSAGES.USER_ID_REQUIRED,
    }),
});

export const cartQuerySchema = Joi.object({
    populateProducts: Joi.boolean().default(false),
    includeExpired: Joi.boolean().default(false),
});

export const validateAddToCart = (cartData) => {
    return addToCartSchema.validate(cartData);
};

export const validateUpdateCartItem = (updateData) => {
    return updateCartItemSchema.validate(updateData);
};

export const validateRemoveFromCart = (removeData) => {
    return removeFromCartSchema.validate(removeData);
};

export const validateApplyCouponToCart = (couponData) => {
    return applyCouponToCartSchema.validate(couponData);
};

export const validateUpdateShippingAddress = (addressData) => {
    return updateShippingAddressSchema.validate(addressData);
};

export const validateMergeCart = (mergeData) => {
    return mergeCartSchema.validate(mergeData);
};

export const validateCartQuery = (query) => {
    return cartQuerySchema.validate(query);
};
