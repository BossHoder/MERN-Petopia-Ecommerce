import Joi from 'joi';

/**
 * Cart validation schemas
 */

export const addToCartSchema = Joi.object({
    productId: Joi.string().trim().required().messages({
        'any.required': 'Product ID is required',
    }),

    variantId: Joi.string().trim().optional(),

    quantity: Joi.number().integer().min(1).max(100).default(1).messages({
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 100',
        'number.integer': 'Quantity must be a whole number',
    }),

    productData: Joi.object({
        name: Joi.string().required(),
        image: Joi.string().required(),
        price: Joi.number().positive().required(),
    }).optional(),
});

export const updateCartItemSchema = Joi.object({
    productId: Joi.string().trim().required().messages({
        'any.required': 'Product ID is required',
    }),

    variantId: Joi.string().trim().optional(),

    quantity: Joi.number().integer().min(0).max(100).required().messages({
        'number.min': 'Quantity cannot be negative',
        'number.max': 'Quantity cannot exceed 100',
        'number.integer': 'Quantity must be a whole number',
        'any.required': 'Quantity is required',
    }),
});

export const removeFromCartSchema = Joi.object({
    productId: Joi.string().trim().required().messages({
        'any.required': 'Product ID is required',
    }),

    variantId: Joi.string().trim().optional(),
});

export const applyCouponToCartSchema = Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(20).required().messages({
        'string.min': 'Coupon code must be at least 3 characters',
        'string.max': 'Coupon code cannot exceed 20 characters',
        'any.required': 'Coupon code is required',
    }),

    discount: Joi.number().min(0).required().messages({
        'number.min': 'Discount cannot be negative',
        'any.required': 'Discount amount is required',
    }),

    discountType: Joi.string().valid('percentage', 'fixed').required().messages({
        'any.only': 'Discount type must be either percentage or fixed',
        'any.required': 'Discount type is required',
    }),
});

export const updateShippingAddressSchema = Joi.object({
    city: Joi.string().trim().min(2).max(100).optional().messages({
        'string.min': 'City must be at least 2 characters',
        'string.max': 'City cannot exceed 100 characters',
    }),

    district: Joi.string().trim().min(2).max(100).optional().messages({
        'string.min': 'District must be at least 2 characters',
        'string.max': 'District cannot exceed 100 characters',
    }),
});

export const mergeCartSchema = Joi.object({
    sessionId: Joi.string().trim().required().messages({
        'any.required': 'Session ID is required',
    }),

    username: Joi.string().trim().required().messages({
        'any.required': 'User ID is required',
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
