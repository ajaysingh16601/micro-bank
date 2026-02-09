const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const walletRoutes = require('./routes/wallet.routes');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || 'no-request-id';
  logger.http(`${req.method} ${req.path} | Request ID: ${requestId}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wallet Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/wallet', walletRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

module.exports = app;
