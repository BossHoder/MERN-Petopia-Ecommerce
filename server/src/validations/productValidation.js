import Joi from 'joi';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Product validation schemas
 */

export const createProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200).required().messages({
        'string.min': ERROR_MESSAGES.PRODUCT_NAME_TOO_SHORT,
        'string.max': ERROR_MESSAGES.PRODUCT_NAME_TOO_LONG,
        'any.required': ERROR_MESSAGES.PRODUCT_NAME_REQUIRED,
    }),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .min(2)
        .max(250)
        .optional()
        .messages({
            'string.pattern.base': ERROR_MESSAGES.SLUG_INVALID,
        }),

    description: Joi.string().trim().min(10).max(2000).required().messages({
        'string.min': ERROR_MESSAGES.DESCRIPTION_TOO_SHORT,
        'string.max': ERROR_MESSAGES.DESCRIPTION_TOO_LONG,
        'any.required': ERROR_MESSAGES.DESCRIPTION_REQUIRED,
    }),

    price: Joi.number().positive().precision(2).required().messages({
        'number.positive': ERROR_MESSAGES.PRICE_MUST_BE_POSITIVE,
        'any.required': ERROR_MESSAGES.PRICE_REQUIRED,
    }),

    salePrice: Joi.number().positive().precision(2).less(Joi.ref('price')).optional().messages({
        'number.positive': ERROR_MESSAGES.SALE_PRICE_MUST_BE_POSITIVE,
        'number.less': ERROR_MESSAGES.SALE_PRICE_MUST_BE_LESS_THAN_REGULAR_PRICE,
    }),

    sku: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9-]+$/)
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.pattern.base': ERROR_MESSAGES.SKU_INVALID,
            'any.required': ERROR_MESSAGES.SKU_REQUIRED,
        }),

    category: Joi.string().trim().lowercase().required().messages({
        'any.required': ERROR_MESSAGES.CATEGORY_REQUIRED,
    }),

    stockQuantity: Joi.number().integer().min(0).required().messages({
        'number.min': ERROR_MESSAGES.STOCK_QUANTITY_CANNOT_BE_NEGATIVE,
        'any.required': ERROR_MESSAGES.STOCK_QUANTITY_REQUIRED,
    }),

    lowStockThreshold: Joi.number().integer().min(0).default(10).messages({
        'number.min': ERROR_MESSAGES.LOW_STOCK_THRESHOLD_CANNOT_BE_NEGATIVE,
    }),

    images: Joi.array()
        .items(
            Joi.string()
                .uri()
                .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
                .messages({
                    'string.pattern.base': ERROR_MESSAGES.IMAGE_INVALID,
                }),
        )
        .min(1)
        .max(10)
        .required()
        .messages({
            'array.min': ERROR_MESSAGES.AT_LEAST_ONE_IMAGE_REQUIRED,
            'array.max': ERROR_MESSAGES.MAX_10_IMAGES_ALLOWED,
        }),

    brand: Joi.string().trim().min(2).max(100).required().messages({
        'any.required': ERROR_MESSAGES.BRAND_REQUIRED,
    }),

    variants: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().trim().required(),
                value: Joi.string().trim().required(),
                price: Joi.number().positive().required(),
                stockQuantity: Joi.number().integer().min(0).required(),
                sku: Joi.string().trim().required(),
            }),
        )
        .optional(),

    attributes: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().trim().required(),
                value: Joi.string().trim().required(),
            }),
        )
        .optional(),

    tags: Joi.array().items(Joi.string().trim().min(1).max(50)).max(20).optional(),

    isFeatured: Joi.boolean().default(false),

    petSpecifics: Joi.string().trim().max(500).optional().allow(''),

    metaTitle: Joi.string().trim().max(60).optional(),

    metaDescription: Joi.string().trim().max(160).optional(),

    isPublished: Joi.boolean().default(true),
});

export const updateProductSchema = createProductSchema.fork(
    ['name', 'description', 'price', 'sku', 'category', 'stockQuantity', 'images', 'brand'],
    (schema) => schema.optional(),
);

export const productQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
        .valid('name', 'price', 'createdAt', 'ratings', 'stockQuantity', 'salesCount', 'viewCount')
        .default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    category: Joi.string().trim().optional(),
    parentCategory: Joi.string().trim().optional(), // Support slug
    parentCategoryId: Joi.string().trim().optional(), // Keep for backward compatibility
    brand: Joi.string().trim().optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    minRating: Joi.number().min(1).max(5).optional(), // Rating filter (1-5 stars)
    maxRating: Joi.number().min(1).max(5).optional(), // Rating filter (1-5 stars)
    inStock: Joi.boolean().optional(),
    onSale: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    search: Joi.string().trim().min(2).optional(),
});

export const validateProduct = (product) => {
    return createProductSchema.validate(product);
};

export const validateProductUpdate = (product) => {
    return updateProductSchema.validate(product);
};
