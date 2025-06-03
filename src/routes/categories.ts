import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { AuthMiddleware } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createCategorySchema, updateCategorySchema } from '../validations/categoryValidation';
import { idParamSchema } from '../validations/commonValidation';

const router = Router();

// Rotas públicas
router.get('/', CategoryController.getAll);
router.get('/:id', validateParams(idParamSchema), CategoryController.getById);

// Rotas protegidas com validação
router.post(
  '/',
  validateBody(createCategorySchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManagerOrAbove,
  CategoryController.create
);
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateCategorySchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManagerOrAbove,
  CategoryController.update
);
router.delete(
  '/:id',
  validateParams(idParamSchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.requireAdmin,
  CategoryController.delete
);

export default router;
