import { Order, OrderItem, Product, User } from '../models';
import { CreateOrderDTO, UpdateOrderStatusDTO, OrderStatus, OrderSummary } from '../types';
import { OrderCreationAttributes } from '../models/Order';
import { OrderItemCreationAttributes } from '../models/OrderItem'; // Import deve funcionar agora

export class OrderService {
  public async createOrder(orderData: CreateOrderDTO, userId?: number): Promise<Order> {
    try {
      console.log(
        'SERVICE_OrderService_createOrder: Iniciando criação do pedido. Dados recebidos:',
        JSON.stringify(orderData, null, 2)
      );
      const validatedItems = await this.validateOrderItems(orderData.items);
      console.log(
        'SERVICE_OrderService_createOrder: Itens validados:',
        JSON.stringify(validatedItems, null, 2)
      );

      const totalAmount = validatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const estimatedTime = this.calculateEstimatedTime(validatedItems);
      console.log(
        `SERVICE_OrderService_createOrder: Total Amount: ${totalAmount}, Estimated Time: ${estimatedTime}`
      );

      const orderCreationData: Omit<OrderCreationAttributes, 'orderNumber'> = {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        tableNumber: orderData.tableNumber,
        status: OrderStatus.PENDING,
        totalAmount,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes,
        estimatedTime,
        userId,
      };
      console.log(
        'SERVICE_OrderService_createOrder: Dados para Order.create:',
        JSON.stringify(orderCreationData, null, 2)
      );

      const order = await Order.create(orderCreationData as OrderCreationAttributes);
      console.log(
        `SERVICE_OrderService_createOrder: Pedido criado no DB. ID: ${order.id}, Número do Pedido: ${order.orderNumber}`
      );

      const orderItemsData: OrderItemCreationAttributes[] = validatedItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity, // ✅ CALCULAR E INCLUIR totalPrice
        notes: item.notes,
        // id, createdAt, updatedAt serão gerenciados pelo Sequelize/DB
      }));
      console.log(
        'SERVICE_OrderService_createOrder: Dados para OrderItem.bulkCreate:',
        JSON.stringify(orderItemsData, null, 2)
      );

      await OrderItem.bulkCreate(orderItemsData);
      console.log('SERVICE_OrderService_createOrder: Itens do pedido criados.');

      const createdOrder = await this.getOrderById(order.id);
      if (!createdOrder) {
        console.error(
          `SERVICE_OrderService_createOrder: Falha ao recuperar pedido ${order.id} após criação.`
        );
        throw new Error('Erro ao recuperar pedido criado');
      }
      console.log(
        `SERVICE_OrderService_createOrder: Pedido ${createdOrder.id} recuperado com sucesso.`
      );
      return createdOrder;
    } catch (error) {
      console.error('❌ SERVICE_OrderService_createOrder - Erro detalhado:', error);
      if (error instanceof Error) {
        if (
          error.name === 'SequelizeValidationError' ||
          error.name === 'SequelizeUniqueConstraintError'
        ) {
          const sequelizeError = error as any;
          const messages =
            sequelizeError.errors
              ?.map((e: any) => `Campo: ${e.path}, Erro: ${e.message}`)
              .join('; ') || error.message;
          throw new Error(`Erro de banco de dados: ${messages}`);
        }
        throw error;
      }
      throw new Error('Ocorreu um erro inesperado no serviço ao criar o pedido.');
    }
  }

  // ... (métodos validateOrderItems, calculateEstimatedTime, getOrderById e outros devem ser mantidos como na versão anterior)
  // Certifique-se de que todos os métodos chamados com 'this' sejam métodos de instância (não static)

  public async getOrderById(id: number): Promise<Order | null> {
    return await Order.findByPk(id, {
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
  }

  private async validateOrderItems(
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
      const product = await Product.findOne({
        where: { id: item.productId, isActive: true },
      });
      if (!product) {
        throw new Error(`Produto com ID ${item.productId} não encontrado ou inativo.`);
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

  private calculateEstimatedTime(
    items: Array<{ preparationTime: number; quantity: number }>
  ): number {
    const preparationTimes = items.map((item) => item.preparationTime || 0);
    const maxPreparationTime = preparationTimes.length > 0 ? Math.max(...preparationTimes) : 0;
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    return maxPreparationTime + Math.ceil(totalItems / 3) * 5;
  }

  // Adicionar os métodos faltantes como métodos de instância
  public async getAllOrders(filters?: {
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
      const orderWithItems = order as Order & { items?: any[] }; // Use any[] se a estrutura de items não for estritamente OrderItem[] aqui
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        itemCount:
          orderWithItems.items?.reduce((acc, currItem) => acc + (currItem.quantity || 0), 0) || 0,
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

  public async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
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

  public async updateOrderStatus(id: number, statusData: UpdateOrderStatusDTO): Promise<Order> {
    const order = await Order.findByPk(id);
    if (!order) throw new Error('Pedido não encontrado');
    this.validateStatusTransition(order.status, statusData.status);
    await order.update({
      status: statusData.status,
      notes: statusData.notes ? `${order.notes || ''}\n${statusData.notes}`.trim() : order.notes,
    });
    const updatedOrder = await this.getOrderById(order.id);
    if (!updatedOrder) throw new Error('Erro ao recuperar pedido atualizado');
    return updatedOrder;
  }

  public async cancelOrder(id: number, reason?: string): Promise<Order> {
    const order = await Order.findByPk(id);
    if (!order) throw new Error('Pedido não encontrado');
    if (order.status === OrderStatus.DELIVERED)
      throw new Error('Não é possível cancelar um pedido já entregue');
    if (order.status === OrderStatus.CANCELLED) throw new Error('Pedido já foi cancelado');
    const cancelNotes = reason ? `Cancelado: ${reason}` : 'Pedido cancelado';
    await order.update({
      status: OrderStatus.CANCELLED,
      notes: order.notes ? `${order.notes}\n${cancelNotes}` : cancelNotes,
    });
    const cancelledOrder = await this.getOrderById(order.id);
    if (!cancelledOrder) throw new Error('Erro ao recuperar pedido cancelado');
    return cancelledOrder;
  }

  public async getOrdersByUser(userId: number): Promise<Order[]> {
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

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
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
