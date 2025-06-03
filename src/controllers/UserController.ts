import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { ApiResponse } from '../types';

export class UserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Usuário criado com sucesso',
      };
      res.status(201).json(response);
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await UserService.authenticateUser(email, password);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login realizado com sucesso',
      };

      res.json(response);
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(401).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ success: false, error: 'Refresh token é obrigatório' });
        return;
      }

      const result = await UserService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
        message: 'Token renovado com sucesso',
      });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(401).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: req.user,
        message: 'Perfil obtido com sucesso',
      });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.json({ success: true, data: users });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(Number(id));
      if (!user) {
        res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        return;
      }
      res.json({ success: true, data: user });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.updateUser(Number(id), req.body);
      res.json({ success: true, data: user, message: 'Usuário atualizado com sucesso' });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // ✅ USANDO O MÉTODO DELETEUSER CORRETO
      await UserService.deleteUser(Number(id));
      res.json({ success: true, message: 'Usuário removido com sucesso' });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }
  }
}
