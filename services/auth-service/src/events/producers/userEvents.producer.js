const rabbitmqConnection = require('../../config/rabbitmq');
const config = require('../../config/env');
const logger = require('../../utils/logger');

class UserEventsProducer {
  /**
   * Publish USER_REGISTERED event
   * @param {Object} userData - User data
   */
  async publishUserRegistered(userData) {
    try {
      const channel = rabbitmqConnection.getChannel();
      const routingKey = 'user.registered';
      
      const event = {
        eventType: 'USER_REGISTERED',
        eventId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        data: {
          userId: userData.userId,
          email: userData.email,
          name: userData.name,
        },
      };

      const published = channel.publish(
        config.rabbitmq.exchange,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );

      if (published) {
        logger.info(`USER_REGISTERED event published for user: ${userData.userId}`);
      } else {
        logger.warn(`Failed to publish USER_REGISTERED event for user: ${userData.userId}`);
      }
    } catch (error) {
      logger.error(`Error publishing USER_REGISTERED event: ${error.message}`);
      // Don't throw error, just log it (event publishing failure shouldn't break registration)
    }
  }

  /**
   * Publish USER_LOGGED_IN event
   * @param {Object} loginData - Login data
   */
  async publishUserLoggedIn(loginData) {
    try {
      const channel = rabbitmqConnection.getChannel();
      const routingKey = 'user.loggedin';
      
      const event = {
        eventType: 'USER_LOGGED_IN',
        eventId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        data: {
          userId: loginData.userId,
          email: loginData.email,
          ipAddress: loginData.ipAddress || 'unknown',
        },
      };

      const published = channel.publish(
        config.rabbitmq.exchange,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );

      if (published) {
        logger.info(`USER_LOGGED_IN event published for user: ${loginData.userId}`);
      } else {
        logger.warn(`Failed to publish USER_LOGGED_IN event for user: ${loginData.userId}`);
      }
    } catch (error) {
      logger.error(`Error publishing USER_LOGGED_IN event: ${error.message}`);
      // Don't throw error, just log it
    }
  }
}

module.exports = new UserEventsProducer();
