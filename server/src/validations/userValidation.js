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
