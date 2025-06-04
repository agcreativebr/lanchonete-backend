import dotenv from 'dotenv';

// CARREGAR VARIÁVEIS DE AMBIENTE PRIMEIRO
dotenv.config();

import app from './app';
import { initializeModels } from './models';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Verificar se JWT_SECRET está configurado
    if (!process.env.JWT_SECRET) {
      console.error('❌ ERRO CRÍTICO: JWT_SECRET não configurado no arquivo .env');
      console.error('Execute: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      console.error('E adicione o resultado no arquivo .env como JWT_SECRET=<resultado>');
      process.exit(1);
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      console.error('❌ ERRO CRÍTICO: JWT_REFRESH_SECRET não configurado no arquivo .env');
      process.exit(1);
    }

    console.log('✅ JWT_SECRET configurado corretamente');
    console.log('✅ JWT_REFRESH_SECRET configurado corretamente');

    await initializeModels();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
