const amqp = require('amqplib');
const logger = require('../utils/logger');
const config = require('./env');

class RabbitMQConnection {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Create connection
      this.connection = await amqp.connect(config.rabbitmq.url);
      logger.info('RabbitMQ connection established');

      // Create channel
      this.channel = await this.connection.createChannel();
      logger.info('RabbitMQ channel created');

      // Assert exchange
      await this.channel.assertExchange(
        config.rabbitmq.exchange,
        config.rabbitmq.exchangeType,
        { durable: true }
      );
      logger.info(`Exchange '${config.rabbitmq.exchange}' asserted`);

      this.isConnected = true;

      // Handle connection events
      this.connection.on('error', (err) => {
        logger.error(`RabbitMQ connection error: ${err.message}`);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.isConnected = false;
        // Attempt reconnection
        setTimeout(() => this.connect(), 5000);
      });

      return this.channel;
    } catch (error) {
      logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      // Retry connection after 5 seconds
      setTimeout(() => this.connect(), 5000);
      throw error;
    }
  }

  getChannel() {
    if (!this.isConnected) {
      throw new Error('RabbitMQ is not connected');
    }
    return this.channel;
  }

  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
        logger.info('RabbitMQ channel closed');
      }
      if (this.connection) {
        await this.connection.close();
        logger.info('RabbitMQ connection closed');
      }
      this.isConnected = false;
    } catch (error) {
      logger.error(`Error closing RabbitMQ: ${error.message}`);
    }
  }
}

module.exports = new RabbitMQConnection();
