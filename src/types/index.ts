export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  WAITER = 'waiter',
  KITCHEN = 'kitchen',
  DELIVERY = 'delivery',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  PIX = 'pix',
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  preparationTime?: number;
}

export interface CreateOrderDTO {
  customerName: string;
  customerPhone?: string;
  tableNumber?: number;
  items: CreateOrderItemDTO[];
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface CreateOrderItemDTO {
  productId: number;
  quantity: number;
  notes?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  notes?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  estimatedTime: number;
  createdAt: Date;
  updatedAt: Date;
}
