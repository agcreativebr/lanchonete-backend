import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Importar rotas (seguindo padrão da MEMORIA.md)
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products'; // ✅ NOVA ROTA

const app = express();

// Middlewares (seguindo padrão da MEMORIA.md)
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API (seguindo padrão da MEMORIA.md)
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes); // ✅ NOVA ROTA

// Health check (seguindo padrão da MEMORIA.md)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      categories: '/api/categories',
      products: '/api/products' // ✅ NOVO ENDPOINT
    }
  });
});

// 404 handler (seguindo padrão da MEMORIA.md)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

export default app;
