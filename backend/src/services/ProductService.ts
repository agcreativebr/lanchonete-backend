import Product, { ProductCreationAttributes } from '../models/Product';
import Category from '../models/Category';

export class ProductService {
  static async createProduct(productData: ProductCreationAttributes): Promise<Product> {
    // Verificar se categoria existe
    const category = await Category.findByPk(productData.categoryId);
    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    return await Product.create(productData);
  }

  static async getAllProducts(): Promise<Product[]> {
    return await Product.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  static async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await Product.findAll({
      where: { categoryId, isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  static async getProductById(id: number): Promise<Product | null> {
    return await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  static async updateProduct(
    id: number,
    updateData: Partial<ProductCreationAttributes>
  ): Promise<Product> {
    const product = await Product.findByPk(id);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Se está mudando categoria, verificar se existe
    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        throw new Error('Categoria não encontrada');
      }
    }

    await product.update(updateData);
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
