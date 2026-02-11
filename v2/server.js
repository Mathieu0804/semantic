import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

// Import routes
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import websitesRoutes from './routes/websites.js';
import identityRoutes from './routes/identity.js';
import chatRoutes from './routes/chat.js';
import seoRoutes from './routes/seo.js';
import analyticsRoutes from './routes/analytics.js';
import mediaRoutes from './routes/media.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import logger from './utils/logger.js';

// Configuration
dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.API_PORT || 5000;
const HOST = process.env.API_HOST || '0.0.0.0';

// =====================================================
// MIDDLEWARE CONFIGURATION
// =====================================================

// Security
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// =====================================================
// API ROUTES
// =====================================================

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées (nécessitent authentification)
app.use('/api/products', authMiddleware, productsRoutes);
app.use('/api/websites', authMiddleware, websitesRoutes);
app.use('/api/identity', authMiddleware, identityRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/seo', authMiddleware, seoRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

// Global error handler
app.use(errorHandler);

// =====================================================
// SERVER STARTUP
// =====================================================

// Graceful shutdown
const shutdown = () => {
  logger.info('Arrêt gracieux du serveur...');
  httpServer.close(() => {
    logger.info('Serveur arrêté');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Arrêt forcé du serveur');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, HOST, () => {
    logger.info(`🚀 API Backend démarrée sur http://${HOST}:${PORT}`);
    logger.info(`📝 Environnement: ${process.env.NODE_ENV}`);
    logger.info(`🔧 Health check: http://${HOST}:${PORT}/health`);
  });
}

export default app;
