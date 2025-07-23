import Joi from 'joi';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

export const validateMessage = (message) => {
    const schema = Joi.object({
        text: Joi.string()
            .min(ERROR_MESSAGES.MESSAGE_TEXT_MIN)
            .max(ERROR_MESSAGES.MESSAGE_TEXT_MAX)
            .required()
            .messages({
                'string.min': 'Message must be at least 1 character.',
                'string.max': 'Message must be at most 500 characters.',
                'any.required': 'Message text is required.',
            }),
        user: Joi.string().trim().required().messages({
            'any.required': 'User is required.',
        }),
    });
    return schema.validate(message);
};

export const validateMessageUpdate = (message) => {
    const schema = Joi.object({
        text: Joi.string().min(ERROR_MESSAGES.MESSAGE_TEXT_MIN).max(ERROR_MESSAGES.MESSAGE_TEXT_MAX).messages({
            'string.min': 'Message must be at least 1 character.',
            'string.max': 'Message must be at most 500 characters.',
        }),
    });
    return schema.validate(message);
};

export const messageQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('createdAt', 'updatedAt').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().trim().min(1).optional(),
});

export const validateMessageQuery = (query) => {
    return messageQuerySchema.validate(query);
};
