import Joi from 'joi';

export const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
};

// Validation for User model with flexible schema (from User.js)
export const validateUserModel = (user) => {
  const schema = {
    avatar: Joi.any(),
    name: Joi.string().min(2).max(30).required(),
    username: Joi.string()
      .min(2)
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/)
      .required(),
    password: Joi.string().min(6).max(20).allow('').allow(null),
  };

  return Joi.validate(user, schema);
};

export const validateUserUpdate = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().min(5).max(255).email(),
    username: Joi.string().min(3).max(30),
    password: Joi.string().min(6).max(255),
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
