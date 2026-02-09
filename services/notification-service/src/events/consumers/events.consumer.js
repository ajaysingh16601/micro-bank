const rabbitmqConnection = require('../../config/rabbitmq');
const notificationService = require('../../services/notification.service');
const config = require('../../config/env');
const logger = require('../../utils/logger');

class EventsConsumer {
  async startConsuming() {
    try {
      const channel = rabbitmqConnection.getChannel();
      
      // User events queue
      const userQueue = 'notification.user_events';
      await channel.assertQueue(userQueue, { durable: true });
      await channel.bindQueue(userQueue, config.rabbitmq.exchange, 'user.registered');
      await channel.bindQueue(userQueue, config.rabbitmq.exchange, 'user.loggedin');

      // Wallet events queue
      const walletQueue = 'notification.wallet_events';
      await channel.assertQueue(walletQueue, { durable: true });
      await channel.bindQueue(walletQueue, config.rabbitmq.exchange, 'wallet.*');

      logger.info(`Notification Service listening for events`);

      // Consume user events
      channel.consume(userQueue, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            logger.info(`Received ${event.eventType}`);

            if (event.eventType === 'USER_REGISTERED') {
              await notificationService.sendWelcomeNotification(event.data);
            }

            channel.ack(msg);
          } catch (error) {
            logger.error(`Error processing user event: ${error.message}`);
            channel.nack(msg, false, true);
          }
        }
      });

      // Consume wallet events
      channel.consume(walletQueue, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            logger.info(`Received ${event.eventType}`);

            switch (event.eventType) {
              case 'WALLET_CREATED':
                await notificationService.sendWalletCreatedNotification(event.data);
                break;
              case 'WALLET_CREDITED':
                await notificationService.sendTransactionNotification(event.data, 'CREDIT');
                break;
              case 'WALLET_DEBITED':
                await notificationService.sendTransactionNotification(event.data, 'DEBIT');
                break;
              case 'INSUFFICIENT_BALANCE':
                await notificationService.sendInsufficientBalanceNotification(event.data);
                break;
            }

            channel.ack(msg);
          } catch (error) {
            logger.error(`Error processing wallet event: ${error.message}`);
            channel.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      logger.error(`Error starting consumers: ${error.message}`);
      setTimeout(() => this.startConsuming(), 5000);
    }
  }
}

module.exports = new EventsConsumer();
