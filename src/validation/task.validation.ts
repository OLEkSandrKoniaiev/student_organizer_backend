import Joi from 'joi';

const cloudinaryTasksUrlRegex =
  /^https:\/\/res\.cloudinary\.com\/[a-z0-9]+\/image\/upload\/v\d+\/tasks\/[a-z0-9_-]+\.(png|jpg|jpeg|webp|gif)$/i;

export const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Title cannot be empty.',
    'string.min': 'Title should have a minimum length of {#limit}.',
    'string.max': 'Title should have a maximum length of {#limit}.',
    'any.required': 'Title is a required field.',
  }),

  description: Joi.string().max(4096).messages({
    'string.max': 'Description should have a maximum length of {#limit}.',
  }),
});

export const deleteTaskFileSchema = Joi.object({
  url: Joi.string().pattern(cloudinaryTasksUrlRegex).required().messages({
    'string.empty': 'Url cannot be empty.',
    'string.pattern.base': 'Url format is invalid.',
    'any.required': 'Url is a required field.',
  }),
});

export const updateTaskFileSchema = Joi.object({
  title: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Title cannot be empty.',
    'string.min': 'Title should have a minimum length of {#limit}.',
    'string.max': 'Title should have a maximum length of {#limit}.',
    'any.required': 'Title is a required field.',
  }),
  description: Joi.string().max(4096).messages({
    'string.max': 'Description should have a maximum length of {#limit}.',
  }),
  done: Joi.string()
    .valid('true', 'false', 'True', 'False') // враховує варіанти з великої літери
    .required()
    .messages({
      'any.only': 'Done must be either "true" or "false".',
      'any.required': 'Done is a required field.',
    }),
});

export const partialUpdateTaskFileSchema = Joi.object({
  title: Joi.string().min(2).max(255).messages({
    'string.empty': 'Title cannot be empty.',
    'string.min': 'Title should have a minimum length of {#limit}.',
    'string.max': 'Title should have a maximum length of {#limit}.',
  }),
  description: Joi.string().max(4096).messages({
    'string.max': 'Description should have a maximum length of {#limit}.',
  }),
  done: Joi.string().valid('true', 'false', 'True', 'False').messages({
    'any.only': 'Done must be either "true" or "false".',
  }),
  files: Joi.any().optional().allow(null, '').messages({
    'any.required': 'Files field is required if present.',
  }),
});
