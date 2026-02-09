const app = require('./app');
const config = require('./config/env');
const database = require('./config/database');
const rabbitmqConnection = require('./config/rabbitmq');
const logger = require('./utils/logger');

// Track server state
let server;
let isShuttingDown = false;

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();
    logger.info('MongoDB connection established');

    // Connect to RabbitMQ
    await rabbitmqConnection.connect();
    logger.info('RabbitMQ connection established');

    // Start HTTP server
    server = app.listen(config.port, () => {
      logger.info(`Auth Service running on port ${config.port}`);
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

      // Close database connection
      try {
        await database.disconnect();
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error(`Error closing MongoDB: ${error.message}`);
      }

      // Close RabbitMQ connection
      try {
        await rabbitmqConnection.disconnect();
        logger.info('RabbitMQ connection closed');
      } catch (error) {
        logger.error(`Error closing RabbitMQ: ${error.message}`);
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
