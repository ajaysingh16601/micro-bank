const emailService = require('./email.service');
const smsService = require('./sms.service');
const NotificationLog = require('../models/NotificationLog.model');
const logger = require('../utils/logger');

// Import templates
const emailTemplates = {
  welcome: require('../templates/email/welcome.template'),
  transaction: require('../templates/email/transaction.template'),
  lowBalance: require('../templates/email/lowBalance.template'),
};

const smsTemplates = {
  welcome: require('../templates/sms/welcome.template'),
  transaction: require('../templates/sms/transaction.template'),
};

class NotificationService {
  async sendWelcomeNotification(userData) {
    try {
      const { userId, email, name } = userData;

      // Send email
      const emailContent = emailTemplates.welcome(name);
      await emailService.sendEmail(email, emailContent.subject, emailContent.body);
      await this.logNotification(userId, 'EMAIL', 'USER_REGISTERED', email, emailContent.subject, emailContent.body, 'SENT');

      // Send SMS (assuming email as phone for demo)
      const smsContent = smsTemplates.welcome(name);
      await smsService.sendSMS(email, smsContent);
      await this.logNotification(userId, 'SMS', 'USER_REGISTERED', email, null, smsContent, 'SENT');

      logger.info(`Welcome notifications sent to user: ${userId}`);
    } catch (error) {
      logger.error(`Welcome notification error: ${error.message}`);
      throw error;
    }
  }

  async sendWalletCreatedNotification(walletData) {
    try {
      // For demo: we don't have user email here, would need to fetch from user service
      logger.info(`Wallet created notification for user: ${walletData.userId}`);
    } catch (error) {
      logger.error(`Wallet created notification error: ${error.message}`);
    }
  }

  async sendTransactionNotification(transactionData, transactionType) {
    try {
      // For demo: we don't have user email here
      logger.info(`Transaction notification for user: ${transactionData.userId}, type: ${transactionType}`);
    } catch (error) {
      logger.error(`Transaction notification error: ${error.message}`);
    }
  }

  async sendInsufficientBalanceNotification(data) {
    try {
      logger.info(`Insufficient balance notification for user: ${data.userId}`);
    } catch (error) {
      logger.error(`Insufficient balance notification error: ${error.message}`);
    }
  }

  async logNotification(userId, type, event, recipient, subject, body, status, error = null) {
    try {
      await NotificationLog.create({
        userId,
        type,
        event,
        recipient,
        subject,
        body,
        status,
        error,
        sentAt: status === 'SENT' ? new Date() : null,
      });
    } catch (err) {
      logger.error(`Notification logging error: ${err.message}`);
    }
  }
}

module.exports = new NotificationService();
