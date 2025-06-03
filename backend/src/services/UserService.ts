import User, { UserCreationAttributes } from '../models/User';
import { SafeUser } from '../types';
import jwt from 'jsonwebtoken';

export class UserService {
  private static getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não está configurado nas variáveis de ambiente');
    }
    return secret;
  }

  private static getJWTRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET não está configurado nas variáveis de ambiente');
    }
    return secret;
  }

  static async createUser(userData: UserCreationAttributes): Promise<SafeUser> {
    try {
      const user = await User.create(userData);
      return user.toSafeObject();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new Error('Email já está em uso');
        }
        if (error.name === 'SequelizeValidationError') {
          const validationError = error as unknown as { errors: Array<{ message: string }> };
          throw new Error(validationError.errors.map((e) => e.message).join(', '));
        }
      }
      throw error;
    }
  }

  static async authenticateUser(
    email: string,
    password: string
  ): Promise<{ user: SafeUser; token: string; refreshToken: string }> {
    const user = await User.findOne({ where: { email, isActive: true } });

    if (!user || !(await user.verifyPassword(password))) {
      throw new Error('Credenciais inválidas');
    }

    const token = UserService.generateAccessToken(user.toSafeObject());
    const refreshToken = UserService.generateRefreshToken(user.toSafeObject());

    return {
      user: user.toSafeObject(),
      token,
      refreshToken,
    };
  }

  static generateAccessToken(user: SafeUser): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = UserService.getJWTSecret();

    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }

  static generateRefreshToken(user: SafeUser): string {
    const payload = {
      id: user.id,
      type: 'refresh',
    };

    const secret = UserService.getJWTRefreshSecret();

    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      const secret = UserService.getJWTRefreshSecret();
      const decoded = jwt.verify(refreshToken, secret) as { id: number; type: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Token inválido');
      }

      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('Usuário não encontrado');
      }

      const safeUser = user.toSafeObject();
      return {
        token: UserService.generateAccessToken(safeUser),
        refreshToken: UserService.generateRefreshToken(safeUser),
      };
    } catch {
      throw new Error('Refresh token inválido');
    }
  }

  static async getAllUsers(): Promise<SafeUser[]> {
    const users = await User.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });

    return users.map((user) => user.toSafeObject());
  }

  static async getUserById(id: number): Promise<SafeUser | null> {
    const user = await User.findByPk(id);
    return user ? user.toSafeObject() : null;
  }

  static async updateUser(
    id: number,
    updateData: Partial<UserCreationAttributes>
  ): Promise<SafeUser> {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await user.update(updateData);
    return user.toSafeObject();
  }

  // ✅ MÉTODO DELETEUSER IMPLEMENTADO
  static async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Soft delete - marca como inativo em vez de remover do banco
    await user.update({ isActive: false });
    return;
  }
}
