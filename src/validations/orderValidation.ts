import Joi from 'joi';
import { OrderStatus, PaymentMethod } from '../types';

const orderItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(50).required(),
  notes: Joi.string().max(500).optional().allow('', null),
});

export const createOrderSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).required(),
  customerPhone: Joi.string()
    .pattern(/^[\d\s\-\(\)\+]{10,20}$/)
    .optional()
    .allow('', null),
  tableNumber: Joi.number().integer().min(1).max(100).optional().allow(null),
  items: Joi.array().items(orderItemSchema).min(1).max(20).required(),
  notes: Joi.string().max(1000).optional().allow('', null),
  paymentMethod: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .required(),
});

// Outros schemas mantidos conforme padrão...
