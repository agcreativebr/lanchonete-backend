import request from 'supertest';
import { initializeModels, getSequelize } from '../src/models';
import app from '../src/app';

describe('Orders API Tests', () => {
  let adminToken: string;
  let managerToken: string;
  let categoryId: number;
  let productId: number;

  beforeAll(async () => {
    await initializeModels();
    const sequelize = getSequelize();
    await sequelize.sync({ force: true });

    // Criar usuário admin para testes
    const adminUser = {
      name: 'Admin User',
      email: 'admin@teste.com',
      password: '123456',
      role: 'admin',
    };

    await request(app).post('/api/users/register').send(adminUser);

    // Criar usuário manager para testes
    const managerUser = {
      name: 'Manager User',
      email: 'manager@teste.com',
      password: '123456',
      role: 'manager',
    };

    await request(app).post('/api/users/register').send(managerUser);

    // Fazer login admin
    const adminLoginResponse = await request(app).post('/api/users/login').send({
      email: 'admin@teste.com',
      password: '123456',
    });

    adminToken = adminLoginResponse.body.data.token;

    // Fazer login manager
    const managerLoginResponse = await request(app).post('/api/users/login').send({
      email: 'manager@teste.com',
      password: '123456',
    });

    managerToken = managerLoginResponse.body.data.token;

    // Criar categoria para testes
    const categoryResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Categoria Teste',
        description: 'Categoria para testes de pedido',
      });

    categoryId = categoryResponse.body.data.id;

    // Criar produto para testes
    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Produto Teste',
        description: 'Produto para testes de pedido',
        price: 25.9,
        categoryId: categoryId,
        preparationTime: 15,
      });

    productId = productResponse.body.data.id;
  });

  afterAll(async () => {
    const sequelize = getSequelize();
    await sequelize.close();
  });

  describe('Orders CRUD', () => {
    it('deve criar um novo pedido', async () => {
      const novoPedido = {
        customerName: 'João Silva',
        customerPhone: '11999999999',
        tableNumber: 5,
        items: [
          {
            productId: productId,
            quantity: 2,
            notes: 'Sem cebola',
          },
        ],
        notes: 'Pedido para entrega rápida',
        paymentMethod: 'card',
      };

      const response = await request(app).post('/api/orders').send(novoPedido);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('João Silva');
      expect(response.body.data.items).toHaveLength(1);
    });

    it('deve listar todos os pedidos (manager)', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve buscar pedidos por status', async () => {
      const response = await request(app)
        .get('/api/orders/status/pending')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve negar acesso a pedidos sem autenticação', async () => {
      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro ao criar pedido com dados inválidos', async () => {
      const pedidoInvalido = {
        customerName: 'A', // Nome muito curto
        items: [], // Sem itens
        paymentMethod: 'invalid', // Método inválido
      };

      const response = await request(app).post('/api/orders').send(pedidoInvalido);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
