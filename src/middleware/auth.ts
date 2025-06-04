import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { UserRole } from '../types';

interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

export class AuthMiddleware {
  static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({ success: false, error: 'Token de acesso requerido' });
        return;
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res
          .status(401)
          .json({ success: false, error: 'Formato de token inválido. Use: Bearer <token>' });
        return;
      }

      const token = parts[1];

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET não configurado');
        res.status(500).json({ success: false, error: 'Configuração de JWT não encontrada' });
        return;
      }

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      } catch (jwtError) {
        console.error('Erro JWT:', jwtError);
        res.status(401).json({ success: false, error: 'Token inválido' });
        return;
      }

      const user = await User.findByPk(decoded.userId);
      if (!user) {
        res.status(401).json({ success: false, error: 'Usuário não encontrado' });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({ success: false, error: 'Usuário inativo' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      console.error('Erro no middleware de autenticação:', error);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
      return;
    }
  }

  static authorize(roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: `Acesso negado. Roles permitidos: ${roles.join(', ')}`,
        });
        return;
      }

      next();
    };
  }

  static requireManagerOrAbove(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      return;
    }

    const managerRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER];
    if (!managerRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Acesso restrito a gerentes ou administradores',
      });
      return;
    }

    next();
  }

  static requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      return;
    }

    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Acesso restrito a administradores',
      });
      return;
    }

    next();
  }
}
