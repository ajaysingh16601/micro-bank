const config = require('../config/env');
const logger = require('../utils/logger');

class EmailService {
  async sendEmail(to, subject, body) {
    try {
      if (!config.email.enabled) {
        logger.info('Email disabled. Would have sent:');
        logger.info(`To: ${to}, Subject: ${subject}`);
        return { success: true, mode: 'disabled' };
      }

      // Console mode for development (replace with SMTP in production)
      logger.info(`\n${'='.repeat(60)}`);
      logger.info(`📧 EMAIL SENT`);
      logger.info(`From: ${config.email.from}`);
      logger.info(`To: ${to}`);
      logger.info(`Subject: ${subject}`);
      logger.info(`Body:\n${body}`);
      logger.info(`${'='.repeat(60)}\n`);

      return { success: true, mode: 'console' };
    } catch (error) {
      logger.error(`Email sending failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailService();
