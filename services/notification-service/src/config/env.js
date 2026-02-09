require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3003,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_db',
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'banking.events',
    exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || 'topic',
    maxRetries: parseInt(process.env.RABBITMQ_MAX_RETRIES) || 3,
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    from: process.env.EMAIL_FROM || 'noreply@bankingapp.com',
  },
  sms: {
    enabled: process.env.SMS_ENABLED === 'true',
    from: process.env.SMS_FROM || '+1234567890',
  },
};
