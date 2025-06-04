import Product, { ProductCreationAttributes } from '../models/Product'; // ✅ Import correto
import { Category } from '../models';
import { CreateProductDTO } from '../types';

export class ProductService {
  static async createProduct(productData: CreateProductDTO): Promise<Product> {
    try {
      // Verificar se categoria existe
      const category = await Category.findByPk(productData.categoryId);
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      // ✅ Usar ProductCreationAttributes para tipagem correta na criação
      const newProductData: ProductCreationAttributes = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        categoryId: productData.categoryId,
        preparationTime: productData.preparationTime,
        // isActive é true por default no model
      };

      const product = await Product.create(newProductData);
      return product;
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

  static async getAllProducts(): Promise<Product[]> {
    return await Product.findAll({
      where: { isActive: true },
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']],
    });
  }

  static async getProductById(id: number): Promise<Product | null> {
    return await Product.findOne({
      where: { id, isActive: true },
      include: [{ model: Category, as: 'category' }],
    });
  }

  static async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await Product.findAll({
      where: { categoryId, isActive: true },
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']],
    });
  }

  static async updateProduct(id: number, productData: Partial<CreateProductDTO>): Promise<Product> {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (productData.categoryId) {
      const category = await Category.findByPk(productData.categoryId);
      if (!category) {
        throw new Error('Categoria não encontrada para atualização do produto');
      }
    }

    await product.update(productData);
    return product;
  }

  static async deleteProduct(id: number): Promise<void> {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    await product.update({ isActive: false });
  }
}
