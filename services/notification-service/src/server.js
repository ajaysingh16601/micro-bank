const app = require('./app');
const config = require('./config/env');
const database = require('./config/database');
const rabbitmqConnection = require('./config/rabbitmq');
const eventsConsumer = require('./events/consumers/events.consumer');
const logger = require('./utils/logger');

let server;

async function startServer() {
  try {
    await database.connect();
    await rabbitmqConnection.connect();
    await eventsConsumer.startConsuming();

    server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Notification Service running on port ${config.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start: ${error.message}`);
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received`);
  if (server) {
    server.close(async () => {
      await database.disconnect();
      await rabbitmqConnection.disconnect();
      process.exit(0);
    });
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
