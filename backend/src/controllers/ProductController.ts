import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ApiResponse } from '../types';

export class ProductController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      const response: ApiResponse = {
        success: true,
        data: product,
        message: 'Produto criado com sucesso'
      };
      res.status(201).json(response);
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductService.getAllProducts();
      res.json({ success: true, data: products });
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
      const product = await ProductService.getProductById(Number(id));
      if (!product) {
        res.status(404).json({ success: false, error: 'Produto não encontrado' });
        return;
      }
      res.json({ success: true, data: product });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const products = await ProductService.getProductsByCategory(Number(categoryId));
      res.json({ success: true, data: products });
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
      const product = await ProductService.updateProduct(Number(id), req.body);
      res.json({ success: true, data: product, message: 'Produto atualizado com sucesso' });
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
      await ProductService.deleteProduct(Number(id));
      res.json({ success: true, message: 'Produto removido com sucesso' });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }
  }
}
