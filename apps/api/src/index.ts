// apps/api/src/index.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { config } from './config';

// Routes
import authRoutes from './routes/auth';
import baziRoutes from './routes/bazi';
import paymentRoutes from './routes/payment';
import userRoutes from './routes/user';
import stripeRoutes from './routes/stripe';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);

// Body parser middleware (must be before stripe webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Stripe webhook (uses raw body parser)
app.use('/api/stripe', stripeRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bazi', baziRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// Database connection
async function connectDatabase() {
  try {
    await mongoose.connect(config.database.url);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`
        🚀 Server running on port ${config.port}
        📍 Environment: ${config.nodeEnv}
        🌍 Health check: http://localhost:${config.port}/health
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await mongoose.disconnect();
  process.exit(0);
});

startServer();

export default app;
