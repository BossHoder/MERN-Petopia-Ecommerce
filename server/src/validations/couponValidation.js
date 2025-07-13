import Joi from 'joi';

/**
 * Coupon validation schemas
 */

export const createCouponSchema = Joi.object({
    code: Joi.string()
        .trim()
        .uppercase()
        .min(3)
        .max(20)
        .pattern(/^[A-Z0-9]+$/)
        .required()
        .messages({
            'string.min': 'Coupon code must be at least 3 characters',
            'string.max': 'Coupon code cannot exceed 20 characters',
            'string.pattern.base': 'Coupon code can only contain uppercase letters and numbers',
            'any.required': 'Coupon code is required',
        }),

    description: Joi.string().trim().min(10).max(200).required().messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 200 characters',
        'any.required': 'Description is required',
    }),

    discountType: Joi.string().valid('percentage', 'fixed').required().messages({
        'any.only': 'Discount type must be either percentage or fixed',
        'any.required': 'Discount type is required',
    }),

    discountValue: Joi.number()
        .positive()
        .required()
        .when('discountType', {
            is: 'percentage',
            then: Joi.number().max(100).messages({
                'number.max': 'Percentage discount cannot exceed 100%',
            }),
        })
        .messages({
            'number.positive': 'Discount value must be positive',
            'any.required': 'Discount value is required',
        }),

    usageLimit: Joi.number().integer().min(1).optional().messages({
        'number.min': 'Usage limit must be at least 1',
    }),

    minOrderAmount: Joi.number().min(0).optional().messages({
        'number.min': 'Minimum order amount cannot be negative',
    }),

    maxDiscountAmount: Joi.number().positive().optional().messages({
        'number.positive': 'Maximum discount amount must be positive',
    }),

    validFrom: Joi.date().default(Date.now).messages({
        'date.base': 'Valid from date must be a valid date',
    }),

    validUntil: Joi.date().greater(Joi.ref('validFrom')).required().messages({
        'date.greater': 'Valid until date must be after valid from date',
        'any.required': 'Valid until date is required',
    }),

    isActive: Joi.boolean().default(true),

    applicableCategories: Joi.array().items(Joi.string().trim()).optional(),

    applicableProducts: Joi.array().items(Joi.string().trim()).optional(),

    excludeCategories: Joi.array().items(Joi.string().trim()).optional(),

    excludeProducts: Joi.array().items(Joi.string().trim()).optional(),

    userRestrictions: Joi.object({
        firstTimeOnly: Joi.boolean().default(false),
        limitPerUser: Joi.number().integer().min(1).optional(),
        allowedUsers: Joi.array().items(Joi.string().trim()).optional(),
        excludedUsers: Joi.array().items(Joi.string().trim()).optional(),
    }).optional(),
});

export const updateCouponSchema = createCouponSchema.fork(
    ['code', 'description', 'discountType', 'discountValue', 'validUntil'],
    (schema) => schema.optional(),
);

export const applyCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().required().messages({
        'any.required': 'Coupon code is required',
    }),

    userId: Joi.string().trim().optional(),

    cartTotal: Joi.number().positive().required().messages({
        'number.positive': 'Cart total must be positive',
        'any.required': 'Cart total is required',
    }),

    cartItems: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().required(),
                categoryId: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
                price: Joi.number().positive().required(),
            }),
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'Cart must have at least one item',
            'any.required': 'Cart items are required',
        }),
});

export const couponQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string()
        .valid('code', 'discountValue', 'validFrom', 'validUntil', 'usageCount', 'createdAt')
        .default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    isActive: Joi.boolean().optional(),
    discountType: Joi.string().valid('percentage', 'fixed').optional(),
    search: Joi.string().trim().min(2).optional(),
});

export const validateCreateCoupon = (coupon) => {
    return createCouponSchema.validate(coupon);
};

export const validateUpdateCoupon = (coupon) => {
    return updateCouponSchema.validate(coupon);
};

export const validateApplyCoupon = (couponData) => {
    return applyCouponSchema.validate(couponData);
};

export const validateCouponQuery = (query) => {
    return couponQuerySchema.validate(query);
};
