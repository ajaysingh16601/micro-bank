const redisClient = require('../config/redis');
const logger = require('../utils/logger');

const IDEMPOTENCY_TTL = 86400; // 24 hours

class IdempotencyService {
  /**
   * Check if idempotency key already exists
   * @param {String} idempotencyKey - Idempotency key
   * @returns {Object|null} Existing transaction data or null
   */
  async checkIdempotency(idempotencyKey) {
    if (!idempotencyKey) {
      return null;
    }

    try {
      const redis = redisClient.getClient();
      const key = `idempotency:${idempotencyKey}`;
      
      const data = await redis.get(key);
      if (data) {
        return JSON.parse(data);
      }
      
      return null;
    } catch (error) {
      logger.error(`Idempotency check error: ${error.message}`);
      // If Redis is down, proceed with request (fail open)
      return null;
    }
  }

  /**
   * Store idempotency key and transaction data
   * @param {String} idempotencyKey - Idempotency key
   * @param {Object} transactionData - Transaction data to store
   */
  async storeIdempotency(idempotencyKey, transactionData) {
    if (!idempotencyKey) {
      return;
    }

    try {
      const redis = redisClient.getClient();
      const key = `idempotency:${idempotencyKey}`;
      
      await redis.setEx(key, IDEMPOTENCY_TTL, JSON.stringify(transactionData));
      logger.debug(`Idempotency key stored: ${idempotencyKey}`);
    } catch (error) {
      logger.error(`Idempotency store error: ${error.message}`);
      // Don't throw, just log
    }
  }
}

module.exports = new IdempotencyService();
