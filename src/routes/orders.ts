import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { AuthMiddleware } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../validations/orderValidation';
import { idParamSchema } from '../validations/commonValidation';
import { UserRole } from '../types';

const router = Router();

// Rotas públicas - criar pedido (qualquer pessoa pode fazer pedido)
router.post('/', validateBody(createOrderSchema), OrderController.create);

// Rotas autenticadas - usuário logado pode ver seus pedidos
router.get('/my-orders', AuthMiddleware.authenticate, OrderController.getMyOrders);

// Rotas protegidas - funcionários podem gerenciar pedidos
router.get(
  '/',
  validateQuery(orderQuerySchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER, UserRole.KITCHEN]),
  OrderController.getAll
);

router.get(
  '/status/:status',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER, UserRole.KITCHEN]),
  OrderController.getByStatus
);

router.get(
  '/:id',
  validateParams(idParamSchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER, UserRole.KITCHEN]),
  OrderController.getById
);

// Rotas para atualização de status - diferentes roles podem atualizar diferentes status
router.put(
  '/:id/status',
  validateParams(idParamSchema),
  validateBody(updateOrderStatusSchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAITER, UserRole.KITCHEN]),
  OrderController.updateStatus
);

// Rota para cancelamento - apenas admin e manager podem cancelar
router.put(
  '/:id/cancel',
  validateParams(idParamSchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManagerOrAbove,
  OrderController.cancel
);

export default router;
