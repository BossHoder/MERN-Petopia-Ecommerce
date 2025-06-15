import Joi from 'joi';

export const validateMessage = (message) => {
  const schema = Joi.object({
    text: Joi.string().min(1).max(500).required(),
  });

  return schema.validate(message);
};

export const validateMessageUpdate = (message) => {
  const schema = Joi.object({
    text: Joi.string().min(1).max(500),
  });

  return schema.validate(message);
};
