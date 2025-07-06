import Joi from 'joi';

/**
 * Category validation schemas
 */

export const createCategorySchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Category name must be at least 2 characters',
            'string.max': 'Category name cannot exceed 100 characters',
            'any.required': 'Category name is required'
        }),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
        }),

    parentCategory: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Parent category is required'
        }),

    iconUrl: Joi.string()
        .trim()
        .uri()
        .required()
        .messages({
            'string.uri': 'Icon URL must be a valid URL',
            'any.required': 'Icon URL is required'
        }),

    description: Joi.string()
        .trim()
        .max(500)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),

    isPublished: Joi.boolean()
        .default(true),

    sortOrder: Joi.number()
        .integer()
        .min(0)
        .default(0)
});

export const updateCategorySchema = createCategorySchema.fork(
    ['name', 'parentCategory', 'iconUrl'],
    (schema) => schema.optional()
);

export const categoryQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('name', 'createdAt', 'sortOrder', 'productCount').default('sortOrder'),
    order: Joi.string().valid('asc', 'desc').default('asc'),
    parentCategory: Joi.string().trim().optional(),
    isPublished: Joi.boolean().optional(),
    search: Joi.string().trim().min(2).optional()
});

export const validateCategory = (category) => {
    return createCategorySchema.validate(category);
};

export const validateCategoryUpdate = (category) => {
    return updateCategorySchema.validate(category);
};

export const validateCategoryQuery = (query) => {
    return categoryQuerySchema.validate(query);
};
