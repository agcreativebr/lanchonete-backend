import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuração de banco de dados com fallback para diferentes ambientes
 */
function createSequelizeInstance(): Sequelize {
  const nodeEnv = process.env.NODE_ENV;

  // Ambiente de teste - usar SQLite em memória
  if (nodeEnv === 'test') {
    return new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    });
  }

  // Ambiente de desenvolvimento/produção - usar PostgreSQL
  const dbConfig = {
    dialect: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'lanchonete_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    logging: nodeEnv === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };

  return new Sequelize(dbConfig);
}

const sequelize = createSequelizeInstance();

export default sequelize;
