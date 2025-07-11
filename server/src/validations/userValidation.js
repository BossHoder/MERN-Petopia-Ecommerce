import Joi from 'joi';

export const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).max(255).required(),
    phoneNumber: Joi.string().pattern(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  });

  return schema.validate(user);
};

// Validation for User model with flexible schema (from User.js)
export const validateUserModel = (user) => {
  const schema = Joi.object({
    avatar: Joi.any(),
    name: Joi.string().min(2).max(30).required(),
    username: Joi.string()
      .min(2)
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/)
      .required(),
    password: Joi.string().min(6).max(20).allow('').allow(null),
    phoneNumber: Joi.string().pattern(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  });

  return schema.validate(user);
};

export const validateUserUpdate = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().min(5).max(255).email(),
    username: Joi.string().min(3).max(30),
    password: Joi.string().min(6).max(255),
    phoneNumber: Joi.string().pattern(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/),
    dateOfBirth: Joi.date().max('now'),
    gender: Joi.string().valid('male', 'female', 'other')
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
    phoneNumber: Joi.string().pattern(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/).required(),
    address: Joi.string().min(5).max(200).required(),
    city: Joi.string().min(2).max(100).required(),
    district: Joi.string().min(2).max(100).required(),
    postalCode: Joi.string().min(5).max(10).optional(),
    isDefault: Joi.boolean().default(false)
  });

  return schema.validate(address);
};

export const validatePreferences = (preferences) => {
  const schema = Joi.object({
    emailNotifications: Joi.boolean().default(true),
    smsNotifications: Joi.boolean().default(false),
    language: Joi.string().valid('vi', 'en').default('vi'),
    currency: Joi.string().valid('VND', 'USD').default('VND'),
    theme: Joi.string().valid('light', 'dark', 'auto').default('light')
  });

  return schema.validate(preferences);
};

// Validation for user registration
export const validateUserRegistration = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).max(255).required(),
    phoneNumber: Joi.string().pattern(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional()
  });

  return schema.validate(user);
};
