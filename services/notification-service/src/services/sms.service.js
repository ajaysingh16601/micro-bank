const config = require('../config/env');
const logger = require('../utils/logger');

class SMSService {
  async sendSMS(to, body) {
    try {
      if (!config.sms.enabled) {
        logger.info('SMS disabled. Would have sent:');
        logger.info(`To: ${to}`);
        return { success: true, mode: 'disabled' };
      }

      // Console mode for development (replace with Twilio/SNS in production)
      logger.info(`\n${'='.repeat(60)}`);
      logger.info(`📱 SMS SENT`);
      logger.info(`From: ${config.sms.from}`);
      logger.info(`To: ${to}`);
      logger.info(`Message: ${body}`);
      logger.info(`${'='.repeat(60)}\n`);

      return { success: true, mode: 'console' };
    } catch (error) {
      logger.error(`SMS sending failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SMSService();
