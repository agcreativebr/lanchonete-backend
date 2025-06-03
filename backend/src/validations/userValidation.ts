import Joi from 'joi';
import { UserRole } from '../types';

export const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório',
  }),

  password: Joi.string().min(6).max(255).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'string.max': 'Senha deve ter no máximo 255 caracteres',
    'any.required': 'Senha é obrigatória',
  }),

  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.WAITER)
    .messages({
      'any.only': `Role deve ser um dos valores: ${Object.values(UserRole).join(', ')}`,
    }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória',
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
  }),

  email: Joi.string().email().optional().messages({
    'string.email': 'Email deve ter um formato válido',
  }),

  password: Joi.string().min(6).max(255).optional().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'string.max': 'Senha deve ter no máximo 255 caracteres',
  }),

  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional()
    .messages({
      'any.only': `Role deve ser um dos valores: ${Object.values(UserRole).join(', ')}`,
    }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token é obrigatório',
  }),
});
