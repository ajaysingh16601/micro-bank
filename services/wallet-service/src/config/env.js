require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wallet_db',
  
  // RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'banking.events',
    exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || 'topic',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0,
    cacheTTL: parseInt(process.env.REDIS_CACHE_TTL) || 300, // 5 minutes
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  },
};
