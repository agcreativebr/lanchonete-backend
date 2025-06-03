import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório',
  }),

  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
  }),

  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Preço deve ser um valor positivo',
    'any.required': 'Preço é obrigatório',
  }),

  categoryId: Joi.number().integer().positive().required().messages({
    'number.integer': 'ID da categoria deve ser um número inteiro',
    'number.positive': 'ID da categoria deve ser positivo',
    'any.required': 'ID da categoria é obrigatório',
  }),

  imageUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'URL da imagem deve ser uma URL válida',
  }),

  preparationTime: Joi.number().integer().min(1).max(999).default(15).messages({
    'number.integer': 'Tempo de preparo deve ser um número inteiro',
    'number.min': 'Tempo de preparo deve ser pelo menos 1 minuto',
    'number.max': 'Tempo de preparo deve ser no máximo 999 minutos',
  }),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
  }),

  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
  }),

  price: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Preço deve ser um valor positivo',
  }),

  categoryId: Joi.number().integer().positive().optional().messages({
    'number.integer': 'ID da categoria deve ser um número inteiro',
    'number.positive': 'ID da categoria deve ser positivo',
  }),

  imageUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'URL da imagem deve ser uma URL válida',
  }),

  preparationTime: Joi.number().integer().min(1).max(999).optional().messages({
    'number.integer': 'Tempo de preparo deve ser um número inteiro',
    'number.min': 'Tempo de preparo deve ser pelo menos 1 minuto',
    'number.max': 'Tempo de preparo deve ser no máximo 999 minutos',
  }),
});
