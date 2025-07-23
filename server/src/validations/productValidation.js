import Joi from 'joi';

/**
 * Product validation schemas
 */

export const createProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200).required().messages({
        'string.min': 'Product name must be at least 2 characters',
        'string.max': 'Product name cannot exceed 200 characters',
        'any.required': 'Product name is required',
    }),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .min(2)
        .max(250)
        .optional()
        .messages({
            'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
        }),

    description: Joi.string().trim().min(10).max(2000).required().messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 2000 characters',
        'any.required': 'Product description is required',
    }),

    price: Joi.number().positive().precision(2).required().messages({
        'number.positive': 'Price must be a positive number',
        'any.required': 'Price is required',
    }),

    salePrice: Joi.number().positive().precision(2).less(Joi.ref('price')).optional().messages({
        'number.positive': 'Sale price must be a positive number',
        'number.less': 'Sale price must be less than regular price',
    }),

    sku: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9-]+$/)
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.pattern.base': 'SKU can only contain uppercase letters, numbers, and hyphens',
            'any.required': 'SKU is required',
        }),

    category: Joi.string().trim().lowercase().required().messages({
        'any.required': 'Category is required',
    }),

    stockQuantity: Joi.number().integer().min(0).required().messages({
        'number.min': 'Stock quantity cannot be negative',
        'any.required': 'Stock quantity is required',
    }),

    lowStockThreshold: Joi.number().integer().min(0).default(10).messages({
        'number.min': 'Low stock threshold cannot be negative',
    }),

    images: Joi.array()
        .items(
            Joi.string()
                .uri()
                .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
                .messages({
                    'string.pattern.base': 'Image must be a valid image URL (jpg, jpeg, png, gif, webp)',
                }),
        )
        .min(1)
        .max(10)
        .required()
        .messages({
            'array.min': 'At least one image is required',
            'array.max': 'Maximum 10 images allowed',
        }),

    brand: Joi.string().trim().min(2).max(100).required().messages({
        'any.required': 'Brand is required',
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
    brand: Joi.string().trim().optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
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

export const validateProductQuery = (query) => {
    return productQuerySchema.validate(query);
};
