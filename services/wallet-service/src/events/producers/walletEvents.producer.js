const rabbitmqConnection = require('../../config/rabbitmq');
const config = require('../../config/env');
const logger = require('../../utils/logger');

class WalletEventsProducer {
  /**
   * Publish WALLET_CREATED event
   */
  async publishWalletCreated(data) {
    try {
      const channel = rabbitmqConnection.getChannel();
      const routingKey = 'wallet.created';
      
      const event = {
        eventType: 'WALLET_CREATED',
        eventId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        data,
      };

      channel.publish(
        config.rabbitmq.exchange,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );

      logger.info(`WALLET_CREATED event published for user: ${data.userId}`);
    } catch (error) {
      logger.error(`Error publishing WALLET_CREATED event: ${error.message}`);
    }
  }

  /**
   * Publish WALLET_CREDITED event
   */
  async publishWalletCredited(data) {
    try {
      const channel = rabbitmqConnection.getChannel();
      const routingKey = 'wallet.credited';
      
      const event = {
        eventType: 'WALLET_CREDITED',
        eventId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        data,
      };

      channel.publish(
        config.rabbitmq.exchange,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );

      logger.info(`WALLET_CREDITED event published for user: ${data.userId}`);
    } catch (error) {
      logger.error(`Error publishing WALLET_CREDITED event: ${error.message}`);
    }
  }

  /**
   * Publish WALLET_DEBITED event
   */
  async publishWalletDebited(data) {
    try {
      const channel = rabbitmqConnection.getChannel();
      const routingKey = 'wallet.debited';
      
      const event = {
        eventType: 'WALLET_DEBITED',
        eventId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        data,
      };

      channel.publish(
        config.rabbitmq.exchange,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );

      logger.info(`WALLET_DEBITED event published for user: ${data.userId}`);
    } catch (error) {
      logger.error(`Error publishing WALLET_DEBITED event: ${error.message}`);
    }
  }

  /**
   * Publish INSUFFICIENT_BALANCE event
   */
  async publishInsufficientBalance(data) {
    try {
      const channel = rabbitmqConnection.getChannel();
      const routingKey = 'wallet.insufficient_balance';
      
      const event = {
        eventType: 'INSUFFICIENT_BALANCE',
        eventId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        data,
      };

      channel.publish(
        config.rabbitmq.exchange,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );

      logger.info(`INSUFFICIENT_BALANCE event published for user: ${data.userId}`);
    } catch (error) {
      logger.error(`Error publishing INSUFFICIENT_BALANCE event: ${error.message}`);
    }
  }
}

module.exports = new WalletEventsProducer();
