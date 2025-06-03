import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductAttributes {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  preparationTime: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductCreationAttributes
  extends Optional<
    ProductAttributes,
    'id' | 'preparationTime' | 'isActive' | 'createdAt' | 'updatedAt'
  > {}

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  // ✅ USAR 'declare' em vez de 'public'
  declare id: number;
  declare name: string;
  declare description?: string;
  declare price: number;
  declare categoryId: number;
  declare imageUrl?: string;
  declare preparationTime: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public getFormattedPrice(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.price);
  }
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      get() {
        const value = this.getDataValue('price');
        return value ? parseFloat(value.toString()) : 0;
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'products',
    timestamps: true,
  }
);

export default Product;
export type { ProductCreationAttributes };
