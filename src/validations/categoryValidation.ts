import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório',
  }),

  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(255).optional().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
  }),

  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
  }),
});
