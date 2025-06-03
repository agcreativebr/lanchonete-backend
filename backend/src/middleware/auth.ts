import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { SafeUser } from '../types';

// Estender Request globalmente
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthMiddleware {
  private static getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não está configurado nas variáveis de ambiente');
    }
    return secret;
  }

  static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: 'Token de acesso requerido',
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Formato de token inválido',
        });
        return;
      }

      const secret = AuthMiddleware.getJWTSecret();
      const decoded = jwt.verify(token, secret) as JWTPayload;

      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Usuário não encontrado ou inativo',
        });
        return;
      }

      req.user = user.toSafeObject();
      next();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'JsonWebTokenError') {
          res.status(401).json({
            success: false,
            error: 'Token inválido',
          });
          return;
        }

        if (err.name === 'TokenExpiredError') {
          res.status(401).json({
            success: false,
            error: 'Token expirado',
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }

  static authorize(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado. Permissão insuficiente',
        });
        return;
      }

      next();
    };
  }

  static requireAdmin(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(['admin'])(req, res, next);
  }

  static requireManagerOrAbove(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(['admin', 'manager'])(req, res, next);
  }

  static async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        next();
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        next();
        return;
      }

      const secret = AuthMiddleware.getJWTSecret();
      const decoded = jwt.verify(token, secret) as JWTPayload;

      const user = await User.findByPk(decoded.id);
      if (user && user.isActive) {
        req.user = user.toSafeObject();
      }

      next();
    } catch {
      next();
    }
  }
}
