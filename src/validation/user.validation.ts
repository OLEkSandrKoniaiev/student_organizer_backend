import Joi from 'joi';

// Мінімум 8 символів, максимум 64.
// Щонайменше одна велика літера, одна маленька літера, одна цифра, один спеціальний символ.
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,64}$/;

// Стандартний шаблон для email, перевірка на @
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUserSchema = Joi.object({
  username: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Username cannot be empty.',
    'string.min': 'Username should have a minimum length of {#limit}.',
    'string.max': 'Username should have a maximum length of {#limit}.',
    'any.required': 'Username is a required field.',
  }),

  email: Joi.string().email().pattern(emailRegex).required().messages({
    'string.empty': 'Email cannot be empty.',
    'string.email': 'Email must be a valid email address.',
    'string.pattern.base': 'Email format is invalid.',
    'any.required': 'Email is a required field.',
  }),

  password: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Password cannot be empty.',
    'string.pattern.base':
      'Password must be 8-64 characters long and include uppercase, lowercase, numbers, and symbols.',
    'any.required': 'Password is a required field.',
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().pattern(emailRegex).required().messages({
    'string.empty': 'Email cannot be empty.',
    'string.email': 'Email must be a valid email address.',
    'string.pattern.base': 'Email format is invalid.',
    'any.required': 'Email is a required field.',
  }),

  password: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Password cannot be empty.',
    'string.pattern.base':
      'Password must be 8-64 characters long and include uppercase, lowercase, numbers, and symbols.',
    'any.required': 'Password is a required field.',
  }),
});
