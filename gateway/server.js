const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const redisClient = require('./utils/redisClient');

// Track server state
let server;
let isShuttingDown = false;

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to Redis
    await redisClient.connect();
    logger.info('Redis connection established');

    // Start HTTP server
    server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`API Gateway running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      // Close Redis connection
      try {
        await redisClient.disconnect();
        logger.info('Redis connection closed');
      } catch (error) {
        logger.error(`Error closing Redis: ${error.message}`);
      }

      logger.info('Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();
