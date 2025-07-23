import Joi from 'joi';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

export const validateUser = (user) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Name must be at least 2 characters.',
            'string.max': 'Name must be at most 50 characters.',
            'any.required': 'Name is required.',
        }),
        email: Joi.string().min(5).max(255).required().email().messages({
            'string.min': 'Email must be at least 5 characters.',
            'string.max': 'Email must be at most 255 characters.',
            'any.required': 'Email is required.',
            'string.email': 'Email must be valid.',
        }),
        username: Joi.string().min(3).max(30).required().messages({
            'string.min': 'Username must be at least 3 characters.',
            'string.max': 'Username must be at most 30 characters.',
            'any.required': 'Username is required.',
        }),
        password: Joi.string().min(6).max(255).required().messages({
            'string.min': 'Password must be at least 6 characters.',
            'string.max': 'Password must be at most 255 characters.',
            'any.required': 'Password is required.',
        }),
        phoneNumber: Joi.string()
            .regex(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number is invalid.',
            }),
        dateOfBirth: Joi.date().max('now').optional().messages({
            'date.max': 'Date of birth cannot be in the future.',
        }),
        gender: Joi.string().valid('male', 'female', 'other').optional().messages({
            'any.only': 'Gender must be male, female, or other.',
        }),
    });
    return schema.validate(user);
};

// Validation for User model with flexible schema (from User.js)
export const validateUserModel = (user) => {
    const schema = Joi.object({
        avatar: Joi.any(),
        name: Joi.string().min(2).max(30).required().messages({
            'string.min': 'Name must be at least 2 characters.',
            'string.max': 'Name must be at most 30 characters.',
            'any.required': 'Name is required.',
        }),
        username: Joi.string()
            .min(2)
            .max(20)
            .regex(/^[a-zA-Z0-9_]+$/)
            .required()
            .messages({
                'string.min': 'Username must be at least 2 characters.',
                'string.max': 'Username must be at most 20 characters.',
                'string.pattern.base': 'Username can only contain letters, numbers, and underscores.',
                'any.required': 'Username is required.',
            }),
        password: Joi.string().min(6).max(20).allow('').allow(null).messages({
            'string.min': 'Password must be at least 6 characters.',
            'string.max': 'Password must be at most 20 characters.',
        }),
        phoneNumber: Joi.string()
            .regex(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number is invalid.',
            }),
        dateOfBirth: Joi.date().max('now').optional().messages({
            'date.max': 'Date of birth cannot be in the future.',
        }),
        gender: Joi.string().valid('male', 'female', 'other').optional().messages({
            'any.only': 'Gender must be male, female, or other.',
        }),
    });
    return schema.validate(user);
};

export const validateUserUpdate = (user) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).messages({
            'string.min': 'Name must be at least 2 characters.',
            'string.max': 'Name must be at most 50 characters.',
        }),
        email: Joi.string().min(5).max(255).email().messages({
            'string.min': 'Email must be at least 5 characters.',
            'string.max': 'Email must be at most 255 characters.',
            'string.email': 'Email must be valid.',
        }),
        username: Joi.string().min(3).max(30).messages({
            'string.min': 'Username must be at least 3 characters.',
            'string.max': 'Username must be at most 30 characters.',
        }),
        password: Joi.string().min(6).max(255).messages({
            'string.min': 'Password must be at least 6 characters.',
            'string.max': 'Password must be at most 255 characters.',
        }),
        phoneNumber: Joi.string()
            .regex(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number is invalid.',
            }),
        dateOfBirth: Joi.date().max('now').messages({
            'date.max': 'Date of birth cannot be in the future.',
        }),
        gender: Joi.string().valid('male', 'female', 'other').messages({
            'any.only': 'Gender must be male, female, or other.',
        }),
    });
    return schema.validate(user);
};

export const validateLogin = (user) => {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required(),
    });

    return schema.validate(user);
};

export const validateAddress = (address) => {
    const schema = Joi.object({
        type: Joi.string().valid('home', 'work', 'other').default('home'),
        fullName: Joi.string().min(2).max(100).required(),
        phoneNumber: Joi.string()
            .regex(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/)
            .required(),
        address: Joi.string().min(5).max(200).required(),
        city: Joi.string().min(2).max(100).required(),
        district: Joi.string().min(2).max(100).required(),
        postalCode: Joi.string().min(5).max(10).optional(),
        isDefault: Joi.boolean().default(false),
    });

    return schema.validate(address);
};

export const validatePreferences = (preferences) => {
    const schema = Joi.object({
        emailNotifications: Joi.boolean().default(true),
        smsNotifications: Joi.boolean().default(false),
        language: Joi.string().valid('vi', 'en').default('vi'),
        currency: Joi.string().valid('VND', 'USD').default('VND'),
        theme: Joi.string().valid('light', 'dark', 'auto').default('light'),
    });

    return schema.validate(preferences);
};

// Validation for user registration
export const validateUserRegistration = (user) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Name must be at least 2 characters.',
            'string.max': 'Name must be at most 50 characters.',
            'any.required': 'Name is required.',
        }),
        email: Joi.string().min(5).max(255).required().email().messages({
            'string.min': 'Email must be at least 5 characters.',
            'string.max': 'Email must be at most 255 characters.',
            'any.required': 'Email is required.',
            'string.email': 'Email must be valid.',
        }),
        username: Joi.string().min(3).max(30).required().messages({
            'string.min': 'Username must be at least 3 characters.',
            'string.max': 'Username must be at most 30 characters.',
            'any.required': 'Username is required.',
        }),
        password: Joi.string().min(6).max(255).required().messages({
            'string.min': 'Password must be at least 6 characters.',
            'string.max': 'Password must be at most 255 characters.',
            'any.required': 'Password is required.',
        }),
        phoneNumber: Joi.string()
            .regex(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number is invalid.',
            }),
        dateOfBirth: Joi.date().max('now').optional().messages({
            'date.max': 'Date of birth cannot be in the future.',
        }),
        gender: Joi.string().valid('male', 'female', 'other').optional().messages({
            'any.only': 'Gender must be male, female, or other.',
        }),
    });
    return schema.validate(user);
};
