const app = require('./app');
const config = require('./config/env');
const database = require('./config/database');
const rabbitmqConnection = require('./config/rabbitmq');
const redisClient = require('./config/redis');
const userEventsConsumer = require('./events/consumers/userEvents.consumer');
const logger = require('./utils/logger');

let server;
let isShuttingDown = false;

async function startServer() {
  try {
    await database.connect();
    logger.info('MongoDB connection established');

    await rabbitmqConnection.connect();
    logger.info('RabbitMQ connection established');

    await redisClient.connect();
    logger.info('Redis connection established');

    // Start consuming user events
    await userEventsConsumer.startConsuming();
    logger.info('Event consumers started');

    server = app.listen(config.port, () => {
      logger.info(`Wallet Service running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try { await database.disconnect(); logger.info('MongoDB closed'); } catch (err) {}
      try { await rabbitmqConnection.disconnect(); logger.info('RabbitMQ closed'); } catch (err) {}
      try { await redisClient.disconnect(); logger.info('Redis closed'); } catch (err) {}

      logger.info('Graceful shutdown completed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  gracefulShutdown('unhandledRejection');
});

startServer();
