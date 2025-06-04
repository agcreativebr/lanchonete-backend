import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { ApiResponse, OrderStatus } from '../types';

export class OrderController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const order = await OrderService.createOrder(req.body, userId);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Pedido criado com sucesso',
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
      const { status, date, page, limit } = req.query;

      const filters = {
        status: status as OrderStatus,
        date: date ? new Date(date as string) : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      const result = await OrderService.getAllOrders(filters);

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
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
      const order = await OrderService.getOrderById(Number(id));

      if (!order) {
        res.status(404).json({ success: false, error: 'Pedido não encontrado' });
        return;
      }

      res.json({ success: true, data: order });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async getByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;

      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        res.status(400).json({
          success: false,
          error:
            'Status inválido. Use: pending, confirmed, preparing, ready, delivering, delivered, cancelled',
        });
        return;
      }

      const orders = await OrderService.getOrdersByStatus(status as OrderStatus);

      res.json({ success: true, data: orders });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await OrderService.updateOrderStatus(Number(id), req.body);

      res.json({
        success: true,
        data: order,
        message: 'Status do pedido atualizado com sucesso',
      });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await OrderService.cancelOrder(Number(id), reason);

      res.json({
        success: true,
        data: order,
        message: 'Pedido cancelado com sucesso',
      });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }
  }

  static async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }

      const orders = await OrderService.getOrdersByUser(req.user.id);

      res.json({ success: true, data: orders });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
      return;
    }
  }
}
