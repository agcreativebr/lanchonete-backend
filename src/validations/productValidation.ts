import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome do produto deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do produto deve ter no máximo 100 caracteres',
    'any.required': 'Nome do produto é obrigatório',
  }),

  description: Joi.string().max(500).optional().messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
  }),

  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Preço deve ser um valor positivo',
    'any.required': 'Preço é obrigatório',
  }),

  categoryId: Joi.number().integer().positive().required().messages({
    'number.positive': 'ID da categoria deve ser um número positivo',
    'any.required': 'ID da categoria é obrigatório',
  }),

  preparationTime: Joi.number().integer().min(1).max(180).optional().messages({
    'number.min': 'Tempo de preparo deve ser pelo menos 1 minuto',
    'number.max': 'Tempo de preparo deve ser no máximo 180 minutos',
  }),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),

  description: Joi.string().max(500).optional(),

  price: Joi.number().positive().precision(2).optional(),

  categoryId: Joi.number().integer().positive().optional(),

  preparationTime: Joi.number().integer().min(1).max(180).optional(),
});

export const categoryIdParamSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required().messages({
    'number.positive': 'ID da categoria deve ser um número positivo',
    'any.required': 'ID da categoria é obrigatório',
  }),
});
