const redis = require('redis');
const config = require('../config');
const logger = require('./logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisConfig = {
        socket: {
          host: config.redis.host,
          port: config.redis.port,
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Max Redis reconnection attempts reached');
              return new Error('Max retries reached');
            }
            return Math.min(retries * 100, 3000);
          },
        },
        database: config.redis.db,
      };

      // Only add password if provided
      if (config.redis.password) {
        redisConfig.password = config.redis.password;
      }

      this.client = redis.createClient(redisConfig);

      this.client.on('error', (err) => {
        logger.error(`Redis Client Error: ${err.message}`);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis Client Reconnecting');
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error(`Failed to connect to Redis: ${error.message}`);
      throw error;
    }
  }

  getClient() {
    if (!this.isConnected) {
      throw new Error('Redis client is not connected');
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis Client Disconnected');
    }
  }
}

module.exports = new RedisClient();
