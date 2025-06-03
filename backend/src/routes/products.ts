import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { AuthMiddleware } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createProductSchema, updateProductSchema } from '../validations/productValidation';
import { idParamSchema } from '../validations/commonValidation';

const router = Router();

// Rotas públicas - listar produtos
router.get('/', ProductController.getAll);
router.get('/:id', validateParams(idParamSchema), ProductController.getById);
router.get('/category/:categoryId', validateParams(idParamSchema), ProductController.getByCategory);

// Rotas protegidas - gerenciar produtos (requer manager ou admin)
router.post('/', validateBody(createProductSchema), AuthMiddleware.authenticate, AuthMiddleware.requireManagerOrAbove, ProductController.create);
router.put('/:id', validateParams(idParamSchema), validateBody(updateProductSchema), AuthMiddleware.authenticate, AuthMiddleware.requireManagerOrAbove, ProductController.update);
router.delete('/:id', validateParams(idParamSchema), AuthMiddleware.authenticate, AuthMiddleware.requireAdmin, ProductController.delete);

export default router;
