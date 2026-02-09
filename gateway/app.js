const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');

// Middleware
const requestIdMiddleware = require('./middlewares/requestId.middleware');
const rateLimitMiddleware = require('./middlewares/rateLimit.middleware');
const authMiddleware = require('./middlewares/auth.middleware');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');

// Proxy handler
const { proxyRequest } = require('./proxy/proxyHandler');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: '*', // Configure properly in production
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path} | Request ID: ${req.requestId}`);
  next();
});

// Rate limiting (apply to all routes except health check)
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  rateLimitMiddleware(req, res, next);
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// AUTH SERVICE ROUTES (Public - No Auth Required)
// ============================================
app.post('/api/auth/register', (req, res) => {
  proxyRequest(req, res, config.services.auth, '/auth/register');
});

app.post('/api/auth/login', (req, res) => {
  proxyRequest(req, res, config.services.auth, '/auth/login');
});

app.post('/api/auth/refresh', (req, res) => {
  proxyRequest(req, res, config.services.auth, '/auth/refresh');
});

// ============================================
// AUTH SERVICE ROUTES (Protected)
// ============================================
app.get('/api/auth/me', authMiddleware, (req, res) => {
  proxyRequest(req, res, config.services.auth, '/auth/me');
});

// ============================================
// WALLET SERVICE ROUTES (All Protected)
// ============================================
app.get('/api/wallet', authMiddleware, (req, res) => {
  proxyRequest(req, res, config.services.wallet, '/wallet');
});

app.post('/api/wallet/credit', authMiddleware, (req, res) => {
  proxyRequest(req, res, config.services.wallet, '/wallet/credit');
});

app.post('/api/wallet/debit', authMiddleware, (req, res) => {
  proxyRequest(req, res, config.services.wallet, '/wallet/debit');
});

app.get('/api/wallet/transactions', authMiddleware, (req, res) => {
  proxyRequest(req, res, config.services.wallet, '/wallet/transactions');
});

// ============================================
// 404 Handler
// ============================================
app.use(notFoundHandler);

// ============================================
// Error Handler (must be last)
// ============================================
app.use(errorHandler);

module.exports = app;
