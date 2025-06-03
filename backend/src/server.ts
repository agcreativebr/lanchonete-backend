import dotenv from 'dotenv';
import app from './app';
import { initializeModels, getSequelize } from './models';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await initializeModels();
    console.log('✅ Models inicializados');

    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');

    await sequelize.sync({ force: false });
    console.log('✅ Tabelas sincronizadas');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
