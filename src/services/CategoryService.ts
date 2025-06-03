import Category, { CategoryCreationAttributes } from '../models/Category';

export class CategoryService {
  static async createCategory(data: CategoryCreationAttributes): Promise<Category> {
    return Category.create(data);
  }

  static async getAllCategories(): Promise<Category[]> {
    return Category.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  static async getCategoryById(id: number): Promise<Category | null> {
    return Category.findByPk(id);
  }

  static async updateCategory(
    id: number,
    data: Partial<CategoryCreationAttributes>
  ): Promise<Category> {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Categoria não encontrada');
    await category.update(data);
    return category;
  }

  static async deleteCategory(id: number): Promise<void> {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Categoria não encontrada');
    await category.update({ isActive: false });
  }
}
