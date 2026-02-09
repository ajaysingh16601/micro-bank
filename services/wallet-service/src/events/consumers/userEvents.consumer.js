const rabbitmqConnection = require('../../config/rabbitmq');
const walletService = require('../../services/wallet.service');
const config = require('../../config/env');
const logger = require('../../utils/logger');

class UserEventsConsumer {
  /**
   * Start consuming USER_REGISTERED events
   */
  async startConsuming() {
    try {
      const channel = rabbitmqConnection.getChannel();
      const queueName = 'wallet.user_events';
      
      // Assert queue
      await channel.assertQueue(queueName, { durable: true });
      
      // Bind queue to exchange with routing key
      await channel.bindQueue(queueName, config.rabbitmq.exchange, 'user.registered');
      
      logger.info(`Wallet Service listening for user events on queue: ${queueName}`);

      // Consume messages
      channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            logger.info(`Received ${event.eventType} event: ${event.eventId}`);

            // Handle USER_REGISTERED event
            if (event.eventType === 'USER_REGISTERED') {
              await this.handleUserRegistered(event.data);
            }

            // Acknowledge message
            channel.ack(msg);
          } catch (error) {
            logger.error(`Error processing event: ${error.message}`);
            // Reject and requeue message
            channel.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      logger.error(`Error starting user events consumer: ${error.message}`);
      // Retry after 5 seconds
      setTimeout(() => this.startConsuming(), 5000);
    }
  }

  /**
   * Handle USER_REGISTERED event
   */
  async handleUserRegistered(data) {
    try {
      const { userId } = data;
      logger.info(`Creating wallet for user: ${userId}`);
      
      await walletService.createWallet(userId);
      
      logger.info(`Wallet created successfully for user: ${userId}`);
    } catch (error) {
      logger.error(`Error handling USER_REGISTERED event: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserEventsConsumer();
