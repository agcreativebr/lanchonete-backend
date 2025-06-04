import request from 'supertest';
import { initializeModels, getSequelize, Product } from '../src/models';
import app from '../src/app';

describe('Orders API Tests', () => {
  let adminToken: string;
  let managerToken: string;
  let categoryId: number;
  let validProductId: number;

  beforeAll(async () => {
    await initializeModels();
    const sequelize = getSequelize();
    await sequelize.sync({ force: true });

    const adminUser = {
      name: 'Admin Test',
      email: `admin${Date.now()}@test.com`,
      password: 'password123',
      role: 'admin',
    };
    await request(app).post('/api/users/register').send(adminUser);
    const adminLogin = await request(app)
      .post('/api/users/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.data.token;

    const managerUser = {
      name: 'Manager Test',
      email: `manager${Date.now()}@test.com`,
      password: 'password123',
      role: 'manager',
    };
    await request(app).post('/api/users/register').send(managerUser);
    const managerLogin = await request(app)
      .post('/api/users/login')
      .send({ email: managerUser.email, password: managerUser.password });
    managerToken = managerLogin.body.data.token;

    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Categoria Teste' });
    categoryId = categoryRes.body.data.id;

    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Produto Teste',
        description: 'Descrição Produto Teste',
        price: 10.0,
        categoryId,
        preparationTime: 10,
        isActive: true,
      });
    validProductId = productRes.body.data.id;

    const productInDb = await Product.findByPk(validProductId);
    if (!productInDb || !productInDb.isActive) {
      throw new Error('Produto inválido para testes');
    }
  });

  afterAll(async () => {
    const sequelize = getSequelize();
    await sequelize.close();
  });

  describe('Orders CRUD', () => {
    it('deve criar um novo pedido', async () => {
      const novoPedido = {
        customerName: 'Cliente Teste',
        customerPhone: '11999999999',
        tableNumber: 5,
        items: [{ productId: validProductId, quantity: 2, notes: 'Sem cebola' }],
        notes: 'Pedido teste',
        paymentMethod: 'card',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .send(novoPedido);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('Cliente Teste');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.orderNumber).toMatch(/^PED\d{9}$/);
    });

    // Outros testes mantidos conforme padrão...
  });
});
