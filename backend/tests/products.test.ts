import request from 'supertest';
import { initializeModels, getSequelize } from '../src/models';
import app from '../src/app';

describe('Products API Tests', () => {
  let adminToken: string;
  let categoryId: number;

  beforeAll(async () => {
    await initializeModels();
    const sequelize = getSequelize();
    await sequelize.sync({ force: true });

    // Criar usuário admin para testes (seguindo padrão da MEMORIA.md)
    const adminUser = {
      name: 'Admin User',
      email: 'admin@teste.com',
      password: '123456',
      role: 'admin'
    };

    await request(app)
      .post('/api/users/register')
      .send(adminUser);

    // Fazer login e obter token (seguindo padrão da MEMORIA.md)
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@teste.com',
        password: '123456'
      });

    adminToken = loginResponse.body.data.token;

    // Criar categoria para testes de produto
    const categoryResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Categoria Teste',
        description: 'Categoria para testes de produto'
      });

    categoryId = categoryResponse.body.data.id;
  });

  afterAll(async () => {
    const sequelize = getSequelize();
    await sequelize.close();
  });

  describe('Products CRUD', () => {
    it('deve criar um novo produto', async () => {
      const novoProduto = {
        name: 'Hambúrguer Clássico',
        description: 'Hambúrguer com carne, queijo e salada',
        price: 25.90,
        categoryId: categoryId,
        preparationTime: 15
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novoProduto);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Hambúrguer Clássico');
      expect(response.body.data.price).toBe(25.90);
    });

    it('deve listar todos os produtos', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve buscar produto por ID', async () => {
      // Primeiro criar um produto
      const novoProduto = {
        name: 'Pizza Margherita',
        description: 'Pizza com molho de tomate, mussarela e manjericão',
        price: 35.00,
        categoryId: categoryId,
        preparationTime: 25
      };

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novoProduto);

      const productId = createResponse.body.data.id;

      // Buscar por ID
      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Pizza Margherita');
    });

    it('deve buscar produtos por categoria', async () => {
      const response = await request(app)
        .get(`/api/products/category/${categoryId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve negar criação de produto sem token', async () => {
      const novoProduto = {
        name: 'Produto Negado',
        description: 'Não deve ser criado',
        price: 10.00,
        categoryId: categoryId
      };

      const response = await request(app)
        .post('/api/products')
        .send(novoProduto);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token de acesso requerido');
    });

    it('deve retornar erro ao criar produto com dados inválidos', async () => {
      const produtoInvalido = {
        name: 'A', // Nome muito curto
        price: -10, // Preço negativo
        categoryId: 999999 // Categoria inexistente
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(produtoInvalido);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
