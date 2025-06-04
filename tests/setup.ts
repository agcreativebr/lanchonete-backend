// ✅ SOLUÇÃO BASEADA NO MATTERMOST BLOG: Configurar JWT_SECRET para testes
process.env.JWT_SECRET = '4c0d608098b78d61cf5654965dab8b53632bf831dc6b43f29289411376ac107b';
process.env.JWT_REFRESH_SECRET = 'f6e5d4c3b2a1098765432109876543210fedcba0987654321fedcba098765432';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '24h';
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test';
process.env.DB_PASS = 'test';

console.log('✅ Variáveis de ambiente de teste configuradas');
console.log('✅ JWT_SECRET:', process.env.JWT_SECRET ? 'CONFIGURADO' : 'FALTANDO');
console.log('✅ JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'CONFIGURADO' : 'FALTANDO');
