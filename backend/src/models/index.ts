import sequelize from '../config/database';
import User from './User';
import Category from './Category';
import Product from './Product';

// Relacionamentos
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products',
});

Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

const initializeModels = async (): Promise<void> => {
  return Promise.resolve();
};

const getSequelize = () => sequelize;

export { initializeModels, getSequelize, User, Category, Product };
