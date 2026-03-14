import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './utils/logger';
import { setupSwagger } from './config/swagger';

// Routes
import authRoutes from './routes/auth.routes';
import milkRoutes from './routes/milk.routes';
import driverRoutes from './routes/driver.routes';
import paymentRoutes from './routes/payment.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Akshaya Dairy API is running',
    timestamp: new Date().toISOString(),
  });
});

// Swagger Documentation
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/milk', milkRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/payment', paymentRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

