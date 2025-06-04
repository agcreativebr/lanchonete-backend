import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus, PaymentMethod } from '../types';

export interface OrderAttributes {
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

export interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'orderNumber' | 'status' | 'totalAmount' | 'estimatedTime'
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

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `PED${timestamp}${random}`;
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
        is: /^$|^[\d\s\-\(\)\+]{10,20}$/,
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
      beforeValidate: (order: Order) => {
        if (!order.orderNumber) {
          order.orderNumber = order['generateOrderNumber']();
        }
        if (order.customerPhone === '') {
          order.customerPhone = undefined;
        }
      },
    },
  }
);

export default Order;
