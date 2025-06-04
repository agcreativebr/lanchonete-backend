import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional().allow('', null),
  price: Joi.number().positive().precision(2).required(),
  categoryId: Joi.number().integer().positive().required(),
  preparationTime: Joi.number().integer().min(1).max(180).optional().allow(null),
  isActive: Joi.boolean().optional().default(true), // ✅ PERMITIR isActive opcionalmente
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional().allow('', null),
  price: Joi.number().positive().precision(2).optional(),
  categoryId: Joi.number().integer().positive().optional(),
  preparationTime: Joi.number().integer().min(1).max(180).optional().allow(null),
  isActive: Joi.boolean().optional(),
});

export const categoryIdParamSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
});
