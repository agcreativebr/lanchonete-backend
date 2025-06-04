import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus, PaymentMethod } from '../types';

interface OrderAttributes {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  tableNumber?: number;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  estimatedTime: number;
  userId?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    'id' | 'orderNumber' | 'totalAmount' | 'estimatedTime' | 'createdAt' | 'updatedAt'
  > {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare id: number;
  declare orderNumber: string;
  declare customerName: string;
  declare customerPhone?: string;
  declare tableNumber?: number;
  declare status: OrderStatus;
  declare totalAmount: number;
  declare paymentMethod: PaymentMethod;
  declare notes?: string;
  declare estimatedTime: number;
  declare userId?: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare items?: any[];

  public generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    return `ORD${timestamp}${random}`;
  }

  public calculateTotalAmount(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  public calculateEstimatedTime(
    items: Array<{ preparationTime: number; quantity: number }>
  ): number {
    const maxPreparationTime = Math.max(...items.map((item) => item.preparationTime || 15));
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    return maxPreparationTime + Math.ceil(totalItems / 3) * 5;
  }
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[\d\s\-\(\)\+]+$/,
      },
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: 5,
        max: 180,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeCreate: (order: Order) => {
        if (!order.orderNumber) {
          order.orderNumber = order.generateOrderNumber();
        }
      },
    },
  }
);

export default Order;
export type { OrderCreationAttributes };
