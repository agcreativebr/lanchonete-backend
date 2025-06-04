import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { ApiResponse, OrderStatus } from '../types';

const orderServiceInstance = new OrderService(); // Instância do serviço

export class OrderController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        'CONTROLLER_OrderController_create: Recebido POST /api/orders. Body:',
        JSON.stringify(req.body, null, 2)
      );
      const userId = req.user?.id;
      console.log(`CONTROLLER_OrderController_create: User ID (se autenticado): ${userId}`);

      const order = await orderServiceInstance.createOrder(req.body, userId);
      console.log('CONTROLLER_OrderController_create: Pedido criado com sucesso. ID:', order.id);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Pedido criado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('❌ CONTROLLER_OrderController_create - Erro ao criar pedido:', error);
      if (error instanceof Error) {
        // Se for um erro lançado pelo OrderService com mensagem específica
        if (
          error.message.includes('Produto com ID') ||
          error.message.includes('Erro de banco de dados') ||
          error.message.includes('Erro ao recuperar pedido criado')
        ) {
          res.status(400).json({ success: false, error: error.message });
          return;
        }
      }
      // Erro genérico ou não tratado especificamente
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      res.status(500).json({ success: false, error: `Erro interno do servidor: ${errorMessage}` });
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
      const result = await orderServiceInstance.getAllOrders(filters);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderServiceInstance.getOrderById(Number(id));
      if (!order) {
        res.status(404).json({ success: false, error: 'Pedido não encontrado' });
        return;
      }
      res.json({ success: true, data: order });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  static async getByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        res.status(400).json({ success: false, error: 'Status inválido.' });
        return;
      }
      const orders = await orderServiceInstance.getOrdersByStatus(status as OrderStatus);
      res.json({ success: true, data: orders });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderServiceInstance.updateOrderStatus(Number(id), req.body);
      res.json({ success: true, data: order, message: 'Status do pedido atualizado com sucesso' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
    }
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const order = await orderServiceInstance.cancelOrder(Number(id), reason);
      res.json({ success: true, data: order, message: 'Pedido cancelado com sucesso' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({ success: false, error: errorMessage });
    }
  }

  static async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        return;
      }
      const orders = await orderServiceInstance.getOrdersByUser(req.user.id);
      res.json({ success: true, data: orders });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
}
