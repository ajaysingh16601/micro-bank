const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Catches all errors and returns standardized error responses
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error(`Error: ${err.message} | Request ID: ${req.requestId} | Path: ${req.path}`);
  logger.error(err.stack);

  // Default error response
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      requestId: req.requestId,
    },
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      requestId: req.requestId,
    },
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
