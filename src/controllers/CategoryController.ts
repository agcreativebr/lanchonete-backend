import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { ApiResponse } from '../types';

export class CategoryController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      const response: ApiResponse = {
        success: true,
        data: category,
        message: 'Categoria criada com sucesso',
      };
      res.status(201).json(response);
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(Number(id));
      if (!category) {
        res.status(404).json({ success: false, error: 'Categoria não encontrada' });
        return;
      }
      res.json({ success: true, data: category });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await CategoryService.updateCategory(Number(id), req.body);
      res.json({ success: true, data: category, message: 'Categoria atualizada com sucesso' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(Number(id));
      res.json({ success: true, message: 'Categoria removida com sucesso' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
