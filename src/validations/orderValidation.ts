import Joi from 'joi';
import { OrderStatus, PaymentMethod } from '../types';

export const createOrderSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome do cliente deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do cliente deve ter no máximo 100 caracteres',
    'any.required': 'Nome do cliente é obrigatório',
  }),

  customerPhone: Joi.string()
    .pattern(/^[\d\s\-\(\)\+]+$/)
    .min(10)
    .max(20)
    .optional()
    .messages({
      'string.pattern.base':
        'Telefone deve conter apenas números, espaços, hífens, parênteses e sinal de mais',
      'string.min': 'Telefone deve ter pelo menos 10 caracteres',
      'string.max': 'Telefone deve ter no máximo 20 caracteres',
    }),

  tableNumber: Joi.number().integer().min(1).max(100).optional().messages({
    'number.min': 'Número da mesa deve ser maior que 0',
    'number.max': 'Número da mesa deve ser menor que 101',
  }),

  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required().messages({
          'number.positive': 'ID do produto deve ser um número positivo',
          'any.required': 'ID do produto é obrigatório',
        }),

        quantity: Joi.number().integer().min(1).max(50).required().messages({
          'number.min': 'Quantidade deve ser pelo menos 1',
          'number.max': 'Quantidade máxima é 50 por item',
          'any.required': 'Quantidade é obrigatória',
        }),

        notes: Joi.string().max(500).optional().messages({
          'string.max': 'Observações do item devem ter no máximo 500 caracteres',
        }),
      })
    )
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'Pedido deve ter pelo menos 1 item',
      'array.max': 'Pedido pode ter no máximo 20 itens',
      'any.required': 'Itens do pedido são obrigatórios',
    }),

  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações do pedido devem ter no máximo 1000 caracteres',
  }),

  paymentMethod: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .required()
    .messages({
      'any.only': 'Método de pagamento deve ser: cash, card ou pix',
      'any.required': 'Método de pagamento é obrigatório',
    }),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required()
    .messages({
      'any.only':
        'Status deve ser: pending, confirmed, preparing, ready, delivering, delivered ou cancelled',
      'any.required': 'Status é obrigatório',
    }),

  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações devem ter no máximo 1000 caracteres',
  }),
});

export const orderQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .optional(),

  date: Joi.date().optional(),

  page: Joi.number().integer().min(1).default(1).optional(),

  limit: Joi.number().integer().min(1).max(100).default(10).optional(),
});
