import request from 'supertest';
import { initializeModels, getSequelize } from '../src/models';
import app from '../src/app';

describe('API Tests', () => {
  let adminToken: string;

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

    // Fazer login e obter token
    const loginResponse = await request(app).post('/api/users/login').send({
      email: 'admin@teste.com',
      password: '123456',
    });

    adminToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    const sequelize = getSequelize();
    await sequelize.close();
  });

  describe('Health Check', () => {
    it('deve retornar status 200 para /api/health', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API funcionando perfeitamente!');
    });
  });

  describe('Categories API', () => {
    it('deve criar uma nova categoria', async () => {
      const novaCategoria = {
        name: 'Lanches',
        description: 'Categoria de lanches',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`) // ✅ CORREÇÃO: Adicionar token
        .send(novaCategoria);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Lanches');
    });

    it('deve listar todas as categorias', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve retornar erro ao criar categoria sem nome', async () => {
      const categoriaInvalida = {
        description: 'Sem nome',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`) // ✅ CORREÇÃO: Adicionar token
        .send(categoriaInvalida);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve negar criação de categoria sem token', async () => {
      const novaCategoria = {
        name: 'Categoria Negada',
        description: 'Não deve ser criada',
      };

      const response = await request(app).post('/api/categories').send(novaCategoria);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token de acesso requerido');
    });
  });

  describe('Users API', () => {
    it('deve registrar um novo usuário', async () => {
      const novoUsuario = {
        name: 'João Silva',
        email: 'joao@teste.com',
        password: '123456',
        role: 'waiter',
      };

      const response = await request(app).post('/api/users/register').send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('joao@teste.com');
    });

    it('deve fazer login com credenciais válidas', async () => {
      const credenciais = {
        email: 'joao@teste.com',
        password: '123456',
      };

      const response = await request(app).post('/api/users/login').send(credenciais);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });
  });
});
