import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASS: string;
  PORT: number;
  NODE_ENV: string;
}

/**
 * Validar e obter configurações do ambiente
 */
export function getEnvConfig(): EnvConfig {
  const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER'];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Variável de ambiente obrigatória não encontrada: ${varName}`);
    }
  }

  return {
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: parseInt(process.env.DB_PORT || '5432'),
    DB_NAME: process.env.DB_NAME!,
    DB_USER: process.env.DB_USER!,
    DB_PASS: process.env.DB_PASS || '',
    PORT: parseInt(process.env.PORT || '3001'),
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

// Validar configuração na inicialização
export const envConfig = getEnvConfig();
