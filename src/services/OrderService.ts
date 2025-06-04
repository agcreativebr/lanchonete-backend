import { Order, OrderItem, Product, User } from '../models';
import { CreateOrderDTO, UpdateOrderStatusDTO, OrderStatus, OrderSummary } from '../types';
import { OrderCreationAttributes } from '../models/Order';
import { OrderItemCreationAttributes } from '../models/OrderItem';

export class OrderService {
  static async createOrder(orderData: CreateOrderDTO, userId?: number): Promise<Order> {
    try {
      const validatedItems = await OrderService.validateOrderItems(orderData.items);

      const totalAmount = validatedItems.reduce(
        (total: number, item: any) => total + item.price * item.quantity,
        0
      );
      const estimatedTime = OrderService.calculateEstimatedTime(validatedItems);

      const orderCreationData: OrderCreationAttributes = {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        tableNumber: orderData.tableNumber,
        status: OrderStatus.PENDING,
        totalAmount: totalAmount,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes,
        estimatedTime: estimatedTime,
        userId: userId,
      };

      const order = await Order.create(orderCreationData);

      const orderItemsData: OrderItemCreationAttributes[] = validatedItems.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        notes: item.notes,
      }));

      await OrderItem.bulkCreate(orderItemsData);

      const createdOrder = await OrderService.getOrderById(order.id);
      if (!createdOrder) {
        throw new Error('Erro ao recuperar pedido criado');
      }
      return createdOrder;
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

  static async getAllOrders(filters?: {
    status?: OrderStatus;
    date?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ orders: OrderSummary[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        [require('sequelize').Op.between]: [startOfDay, endOfDay],
      };
    }

    const { rows: orders, count: total } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'price'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset,
    });

    const orderSummaries: OrderSummary[] = orders.map((order) => {
      const orderWithItems = order as Order & { items?: OrderItem[] };
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        itemCount: orderWithItems.items?.length || 0,
        estimatedTime: order.estimatedTime,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return {
      orders: orderSummaries,
      total,
      page,
      limit,
    };
  }

  static async getOrderById(id: number): Promise<Order | null> {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'description'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return order;
  }

  static async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return await Order.findAll({
      where: { status },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  static async updateOrderStatus(id: number, statusData: UpdateOrderStatusDTO): Promise<Order> {
    const order = await Order.findByPk(id);

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    OrderService.validateStatusTransition(order.status, statusData.status);

    await order.update({
      status: statusData.status,
      notes: statusData.notes ? `${order.notes || ''}\n${statusData.notes}`.trim() : order.notes,
    });

    const updatedOrder = await OrderService.getOrderById(order.id);
    if (!updatedOrder) {
      throw new Error('Erro ao recuperar pedido atualizado');
    }
    return updatedOrder;
  }

  static async cancelOrder(id: number, reason?: string): Promise<Order> {
    const order = await Order.findByPk(id);

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new Error('Não é possível cancelar um pedido já entregue');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new Error('Pedido já foi cancelado');
    }

    const cancelNotes = reason ? `Cancelado: ${reason}` : 'Pedido cancelado';

    await order.update({
      status: OrderStatus.CANCELLED,
      notes: order.notes ? `${order.notes}\n${cancelNotes}` : cancelNotes,
    });

    const cancelledOrder = await OrderService.getOrderById(order.id);
    if (!cancelledOrder) {
      throw new Error('Erro ao recuperar pedido cancelado');
    }
    return cancelledOrder;
  }

  static async getOrdersByUser(userId: number): Promise<Order[]> {
    return await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  private static async validateOrderItems(
    items: Array<{ productId: number; quantity: number; notes?: string }>
  ): Promise<
    Array<{
      productId: number;
      quantity: number;
      notes?: string;
      price: number;
      preparationTime: number;
    }>
  > {
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);

      if (!product) {
        throw new Error(`Produto com ID ${item.productId} não encontrado`);
      }

      if (!product.isActive) {
        throw new Error(`Produto "${product.name}" não está disponível`);
      }

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes,
        price: Number(product.price),
        preparationTime: product.preparationTime || 15,
      });
    }

    return validatedItems;
  }

  private static calculateEstimatedTime(
    items: Array<{ preparationTime: number; quantity: number }>
  ): number {
    const maxPreparationTime = Math.max(...items.map((item) => item.preparationTime));
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return maxPreparationTime + Math.ceil(totalItems / 3) * 5;
  }

  private static validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERING, OrderStatus.DELIVERED],
      [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Transição de status inválida: ${currentStatus} → ${newStatus}`);
    }
  }
}
