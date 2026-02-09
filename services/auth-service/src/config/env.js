require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db',
  
  // RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'banking.events',
    exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || 'topic',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  // Bcrypt
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
};
