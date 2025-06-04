import request from 'supertest';
import { initializeModels, getSequelize } from '../src/models';
import app from '../src/app';
import { UserRole } from '../src/types';

describe('Validation Tests', () => {
  let adminToken: string;

  beforeAll(async () => {
    await initializeModels();
    const sequelize = getSequelize();
    await sequelize.sync({ force: true });

    const adminUserData = {
      name: 'Admin Validation User',
      email: `admin.validation.${Date.now()}@example.com`,
      password: 'password123',
      role: UserRole.ADMIN,
    };
    await request(app).post('/api/users/register').send(adminUserData);
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ email: adminUserData.email, password: adminUserData.password });
    if (loginResponse.body.data?.token) {
      adminToken = loginResponse.body.data.token;
    } else {
      console.error('VALIDATION_TEST_SETUP: Falha ao obter token de admin.');
      // Considerar lançar um erro aqui se o token for crucial para todos os testes
      // throw new Error('Falha ao obter token de admin no setup de validation.test.ts');
    }
  });

  afterAll(async () => {
    const sequelize = getSequelize();
    await sequelize.close();
  });

  describe('User Validation', () => {
    it('deve rejeitar registro com email inválido', async () => {
      const usuarioInvalido = {
        name: 'User Email Inválido',
        email: 'email-invalido-format',
        password: 'password123',
        role: UserRole.WAITER,
      };
      const response = await request(app)
        .post('/api/users/register')
        .set('Content-Type', 'application/json')
        .send(usuarioInvalido);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email deve ter um formato válido');
    });

    it('deve rejeitar registro com senha muito curta', async () => {
      const usuarioInvalido = {
        name: 'User Senha Curta',
        email: `senha.curta.${Date.now()}@example.com`,
        password: '123',
        role: UserRole.KITCHEN,
      };
      const response = await request(app)
        .post('/api/users/register')
        .set('Content-Type', 'application/json')
        .send(usuarioInvalido);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Senha deve ter pelo menos 6 caracteres');
    });

    it('deve rejeitar login sem email', async () => {
      const loginInvalido = {
        password: 'password123',
      };
      const response = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginInvalido);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email é obrigatório');
    });
  });

  describe('Category Validation', () => {
    it('deve rejeitar categoria sem nome', async () => {
      const categoriaInvalida = {
        description: 'Categoria sem nome para teste',
      };
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json')
        .send(categoriaInvalida);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Nome é obrigatório');
    });

    it('deve rejeitar categoria com nome muito curto', async () => {
      const categoriaInvalida = {
        name: 'X',
        description: 'Categoria com nome curto',
      };
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json')
        .send(categoriaInvalida);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Nome deve ter pelo menos 2 caracteres');
    });
  });

  describe('Parameter Validation', () => {
    it('deve rejeitar ID inválido na URL (não numérico)', async () => {
      const response = await request(app).get('/api/categories/not-a-number');

      console.log(
        'TEST_ParameterValidation_ID_Inválido_URL - Resposta:',
        response.status,
        response.body
      );
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('id must be a number'); // Mensagem padrão Joi sem aspas no nome do campo
    });

    it('deve rejeitar ID negativo na URL', async () => {
      const response = await request(app).get('/api/categories/-5'); // ID negativo

      console.log(
        'TEST_ParameterValidation_ID_Negativo_URL - Resposta:',
        response.status,
        response.body
      );
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      // ✅ CORREÇÃO DEFINITIVA: Alinhar com a mensagem em português do schema
      expect(response.body.error).toBe('ID deve ser um número positivo');
    });
  });

  describe('Authentication Tests', () => {
    it('deve negar acesso a rota protegida sem token', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Content-Type', 'application/json')
        .send({ name: 'Categoria No Token' });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token de acesso requerido');
    });

    it('deve negar acesso com token inválido', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer an-invalid-token-string')
        .set('Content-Type', 'application/json')
        .send({ name: 'Categoria Invalid Token' });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token inválido');
    });
  });
});
