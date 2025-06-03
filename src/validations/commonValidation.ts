import Joi from 'joi';

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser um número positivo',
    'any.required': 'ID é obrigatório',
  }),
});

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.integer': 'Página deve ser um número inteiro',
    'number.min': 'Página deve ser pelo menos 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.integer': 'Limite deve ser um número inteiro',
    'number.min': 'Limite deve ser pelo menos 1',
    'number.max': 'Limite deve ser no máximo 100',
  }),

  search: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'Busca deve ter no máximo 255 caracteres',
  }),
});
