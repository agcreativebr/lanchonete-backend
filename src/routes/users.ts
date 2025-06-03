import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  refreshTokenSchema,
} from '../validations/userValidation';
import { idParamSchema } from '../validations/commonValidation';

const router = Router();

// Rotas públicas com validação
router.post('/register', validateBody(registerUserSchema), UserController.register);
router.post('/login', validateBody(loginUserSchema), UserController.login);
router.post('/refresh-token', validateBody(refreshTokenSchema), UserController.refreshToken);

// Rotas protegidas
router.get('/profile', AuthMiddleware.authenticate, UserController.getProfile);

// Rotas administrativas com validação
router.get(
  '/',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManagerOrAbove,
  UserController.getAll
);
router.get(
  '/:id',
  validateParams(idParamSchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManagerOrAbove,
  UserController.getById
);
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManagerOrAbove,
  UserController.update
);
router.delete(
  '/:id',
  validateParams(idParamSchema),
  AuthMiddleware.authenticate,
  AuthMiddleware.requireAdmin,
  UserController.delete
);

export default router;
