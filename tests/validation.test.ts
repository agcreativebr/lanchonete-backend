import request from 'supertest';
import { initializeModels, getSequelize } from '../src/models';
import app from '../src/app';

describe('Validation Tests', () => {
  beforeAll(async () => {
    await initializeModels();
    const sequelize = getSequelize();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    const sequelize = getSequelize();
    await sequelize.close();
  });

  describe('User Validation', () => {
    it('deve rejeitar registro com email inválido', async () => {
      const usuarioInvalido = {
        name: 'Teste User',
        email: 'email-invalido',
        password: '123456',
        role: 'waiter',
      };

      const response = await request(app).post('/api/users/register').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email deve ter um formato válido');
    });

    it('deve rejeitar registro com senha muito curta', async () => {
      const usuarioInvalido = {
        name: 'Teste User',
        email: 'teste@teste.com',
        password: '123',
        role: 'waiter',
      };

      const response = await request(app).post('/api/users/register').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Senha deve ter pelo menos 6 caracteres');
    });

    it('deve rejeitar login sem email', async () => {
      const loginInvalido = {
        password: '123456',
      };

      const response = await request(app).post('/api/users/login').send(loginInvalido);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email é obrigatório');
    });
  });

  describe('Category Validation', () => {
    let adminToken: string;

    beforeAll(async () => {
      // Criar usuário admin para testes
      const adminUser = {
        name: 'Admin User',
        email: 'admin@validation.com',
        password: '123456',
        role: 'admin',
      };

      await request(app).post('/api/users/register').send(adminUser);

      const loginResponse = await request(app).post('/api/users/login').send({
        email: 'admin@validation.com',
        password: '123456',
      });

      adminToken = loginResponse.body.data.token;
    });

    it('deve rejeitar categoria sem nome', async () => {
      const categoriaInvalida = {
        description: 'Categoria sem nome',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoriaInvalida);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Nome é obrigatório');
    });

    it('deve rejeitar categoria com nome muito curto', async () => {
      const categoriaInvalida = {
        name: 'A',
        description: 'Nome muito curto',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoriaInvalida);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Nome deve ter pelo menos 2 caracteres');
    });
  });

  describe('Parameter Validation', () => {
    it('deve rejeitar ID inválido na URL', async () => {
      const response = await request(app).get('/api/categories/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('"id" must be a number');
    });

    it('deve rejeitar ID negativo na URL', async () => {
      const response = await request(app).get('/api/categories/-1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ID deve ser um número positivo');
    });
  });

  describe('Authentication Tests', () => {
    it('deve negar acesso a rota protegida sem token', async () => {
      const response = await request(app).post('/api/categories').send({ name: 'Categoria Teste' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token de acesso requerido');
    });

    it('deve negar acesso com token inválido', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer token-invalido')
        .send({ name: 'Categoria Teste' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token inválido');
    });
  });
});
