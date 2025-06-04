import { Sequelize } from 'sequelize';
import User from './User';
import Category from './Category';
import Product from './Product';
import Order from './Order';
import OrderItem from './OrderItem';
import sequelize from '../config/database';

// Relacionamentos existentes
User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Relacionamentos para pedidos
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export { User, Category, Product, Order, OrderItem };

export const initializeModels = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar com banco de dados:', error);
    throw error;
  }
};

export const getSequelize = (): Sequelize => sequelize;

export default {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  sequelize,
  initializeModels,
  getSequelize,
};
