import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { CreateUserDTO, SafeUser, UserRole } from '../types';

export class UserService {
  static async createUser(userData: CreateUserDTO): Promise<SafeUser> {
    try {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      const user = await User.create(userData);
      return user.toSafeObject();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'SequelizeValidationError') {
          const validationError = error as unknown as { errors: Array<{ message: string }> };
          throw new Error(validationError.errors.map((e) => e.message).join(', '));
        }
      }
      throw error;
    }
  }

  static async authenticateUser(email: string, password: string): Promise<{ user: SafeUser; token: string; refreshToken: string }> {
    const user = await User.findOne({ where: { email } });
    
    if (!user || !user.isActive) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // ✅ SOLUÇÃO STACK OVERFLOW (Resultado 3): Verificar se JWT_SECRET existe
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado no ambiente');
    }

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET não configurado no ambiente');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // ✅ SOLUÇÃO FREECODECAMP (Resultado 6): Usar variável verificada
    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    // ✅ SOLUÇÃO FREECODECAMP (Resultado 6): Usar variável verificada
    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtRefreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return {
      user: user.toSafeObject(),
      token,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    // ✅ SOLUÇÃO STACK OVERFLOW (Resultado 3): Verificar se existe
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET não configurado');
    }

    try {
      // ✅ SOLUÇÃO FREECODECAMP (Resultado 6): Usar variável verificada
      const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as { userId: number };
      
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      // ✅ SOLUÇÃO STACK OVERFLOW (Resultado 3): Verificar se existe
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não configurado');
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      // ✅ SOLUÇÃO FREECODECAMP (Resultado 6): Usar variável verificada
      const newToken = jwt.sign(tokenPayload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      });

      // ✅ SOLUÇÃO FREECODECAMP (Resultado 6): Usar variável verificada
      const newRefreshToken = jwt.sign(
        { userId: user.id },
        jwtRefreshSecret,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  static async getAllUsers(): Promise<SafeUser[]> {
    const users = await User.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });
    
    return users.map(user => user.toSafeObject());
  }

  static async getUserById(id: number): Promise<SafeUser | null> {
    const user = await User.findByPk(id);
    return user ? user.toSafeObject() : null;
  }

  static async updateUser(id: number, userData: Partial<CreateUserDTO>): Promise<SafeUser> {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('Email já está em uso');
      }
    }

    await user.update(userData);
    return user.toSafeObject();
  }

  static async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await user.update({ isActive: false });
  }
}
