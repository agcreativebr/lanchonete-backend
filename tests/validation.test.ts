import request from 'supertest';
import { initializeModels, getSequelize } from '../src/models';
import app from '../src/app';

describe('Validation Tests', () => {
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

  describe('User Validation', () => {
    it('deve rejeitar registro com email inválido', async () => {
      const dadosInvalidos = {
        name: 'João',
        email: 'email-invalido',
        password: '123456',
        role: 'waiter',
      };

      const response = await request(app).post('/api/users/register').send(dadosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados de entrada inválidos');
      expect(response.body.details).toContain('Email deve ter um formato válido');
    });

    it('deve rejeitar registro com senha muito curta', async () => {
      const dadosInvalidos = {
        name: 'João',
        email: 'joao@teste.com',
        password: '123',
        role: 'waiter',
      };

      const response = await request(app).post('/api/users/register').send(dadosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Senha deve ter pelo menos 6 caracteres');
    });

    it('deve rejeitar login sem email', async () => {
      const dadosInvalidos = {
        password: '123456',
      };

      const response = await request(app).post('/api/users/login').send(dadosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Email é obrigatório');
    });
  });

  describe('Category Validation', () => {
    it('deve rejeitar categoria sem nome', async () => {
      const dadosInvalidos = {
        description: 'Descrição sem nome',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`) // ✅ CORREÇÃO: Adicionar token
        .send(dadosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Nome é obrigatório');
    });

    it('deve rejeitar categoria com nome muito curto', async () => {
      const dadosInvalidos = {
        name: 'A',
        description: 'Nome muito curto',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`) // ✅ CORREÇÃO: Adicionar token
        .send(dadosInvalidos);

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Nome deve ter pelo menos 2 caracteres');
    });
  });

  describe('Parameter Validation', () => {
    it('deve rejeitar ID inválido na URL', async () => {
      const response = await request(app).get('/api/categories/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Parâmetros inválidos');
    });

    it('deve rejeitar ID negativo na URL', async () => {
      const response = await request(app).get('/api/categories/-1');

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('ID deve ser um número positivo');
    });
  });

  describe('Authentication Tests', () => {
    it('deve negar acesso a rota protegida sem token', async () => {
      const response = await request(app).post('/api/categories').send({ name: 'Categoria Teste' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token de acesso requerido');
    });

    it('deve negar acesso com token inválido', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer token_invalido')
        .send({ name: 'Categoria Teste' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token inválido');
    });
  });
});
