import Joi from 'joi';

export const validateMessage = (message) => {
    const schema = Joi.object({
        text: Joi.string().min(1).max(500).required(),
        user: Joi.string().trim().required(),
    });

    return schema.validate(message);
};

export const validateMessageUpdate = (message) => {
    const schema = Joi.object({
        text: Joi.string().min(1).max(500),
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
