import Joi from 'joi';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

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
            'string.min': ERROR_MESSAGES.COUPON_CODE_MIN_LENGTH,
            'string.max': ERROR_MESSAGES.COUPON_CODE_MAX_LENGTH,
            'string.pattern.base': ERROR_MESSAGES.COUPON_CODE_PATTERN,
            'any.required': ERROR_MESSAGES.COUPON_CODE_REQUIRED,
        }),

    description: Joi.string().trim().min(10).max(200).required().messages({
        'string.min': ERROR_MESSAGES.DESCRIPTION_MIN_LENGTH,
        'string.max': ERROR_MESSAGES.DESCRIPTION_MAX_LENGTH,
        'any.required': ERROR_MESSAGES.DESCRIPTION_REQUIRED,
    }),

    discountType: Joi.string().valid('percentage', 'fixed').required().messages({
        'any.only': ERROR_MESSAGES.DISCOUNT_TYPE_INVALID,
        'any.required': ERROR_MESSAGES.DISCOUNT_TYPE_REQUIRED,
    }),

    discountValue: Joi.number()
        .positive()
        .required()
        .when('discountType', {
            is: 'percentage',
            then: Joi.number().max(100).messages({
                'number.max': ERROR_MESSAGES.PERCENTAGE_DISCOUNT_MAX,
            }),
        })
        .messages({
            'number.positive': ERROR_MESSAGES.DISCOUNT_VALUE_POSITIVE,
            'any.required': ERROR_MESSAGES.DISCOUNT_VALUE_REQUIRED,
        }),

    usageLimit: Joi.number().integer().min(1).optional().allow(null).messages({
        'number.min': ERROR_MESSAGES.USAGE_LIMIT_MIN,
    }),

    perUserLimit: Joi.number().integer().min(1).required().messages({
        'number.min': ERROR_MESSAGES.USAGE_LIMIT_MIN,
        'any.required': ERROR_MESSAGES.USAGE_LIMIT_REQUIRED,
    }),

    minOrderValue: Joi.number().min(0).required().messages({
        'number.min': ERROR_MESSAGES.MIN_ORDER_AMOUNT_NON_NEGATIVE,
        'any.required': ERROR_MESSAGES.MIN_ORDER_AMOUNT_REQUIRED,
    }),

    maxDiscountAmount: Joi.number().positive().optional().allow(null).messages({
        'number.positive': ERROR_MESSAGES.MAX_DISCOUNT_AMOUNT_POSITIVE,
    }),

    validFrom: Joi.date().default(Date.now).messages({
        'date.base': ERROR_MESSAGES.VALID_FROM_DATE_INVALID,
    }),

    validUntil: Joi.date().greater(Joi.ref('validFrom')).required().messages({
        'date.greater': ERROR_MESSAGES.VALID_UNTIL_DATE_AFTER_VALID_FROM,
        'any.required': ERROR_MESSAGES.VALID_UNTIL_DATE_REQUIRED,
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
        'any.required': ERROR_MESSAGES.COUPON_CODE_REQUIRED,
    }),

    userId: Joi.string().trim().optional(),

    cartTotal: Joi.number().positive().required().messages({
        'number.positive': ERROR_MESSAGES.CART_TOTAL_POSITIVE,
        'any.required': ERROR_MESSAGES.CART_TOTAL_REQUIRED,
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
            'array.min': ERROR_MESSAGES.CART_ITEMS_MIN_ONE,
            'any.required': ERROR_MESSAGES.CART_ITEMS_REQUIRED,
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
