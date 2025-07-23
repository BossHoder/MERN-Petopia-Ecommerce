import Joi from 'joi';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Category validation schemas
 */

export const createCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.min': ERROR_MESSAGES.CATEGORY_NAME_MIN,
        'string.max': ERROR_MESSAGES.CATEGORY_NAME_MAX,
        'any.required': ERROR_MESSAGES.CATEGORY_NAME_REQUIRED,
    }),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.pattern.base': ERROR_MESSAGES.SLUG_PATTERN,
        }),

    parentCategory: Joi.string().trim().required().messages({
        'any.required': ERROR_MESSAGES.PARENT_CATEGORY_REQUIRED,
    }),

    iconUrl: Joi.string().trim().uri().required().messages({
        'string.uri': ERROR_MESSAGES.ICON_URL_INVALID,
        'any.required': ERROR_MESSAGES.ICON_URL_REQUIRED,
    }),

    description: Joi.string().trim().max(500).optional().allow('').messages({
        'string.max': ERROR_MESSAGES.DESCRIPTION_MAX,
    }),

    isPublished: Joi.boolean().default(true),

    sortOrder: Joi.number().integer().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.fork(['name', 'parentCategory', 'iconUrl'], (schema) =>
    schema.optional(),
);

export const categoryQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('name', 'createdAt', 'sortOrder', 'productCount').default('sortOrder'),
    order: Joi.string().valid('asc', 'desc').default('asc'),
    parentCategory: Joi.string().trim().optional(),
    isPublished: Joi.boolean().optional(),
    search: Joi.string().trim().min(2).optional(),
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
