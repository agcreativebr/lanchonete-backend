import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

const app = express();

app.use(helmet());
app.use(cors()); // ✅ CORS ATIVADO - OK
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

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
      products: '/api/products',
      orders: '/api/orders', // ✅ NOVO ENDPOINT
    },
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
