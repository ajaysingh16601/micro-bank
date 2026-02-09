const config = require('../config');
const redisClient = require('../utils/redisClient');
const logger = require('../utils/logger');

/**
 * Rate limiting middleware using Redis
 * Implements sliding window rate limiting per IP address
 */
const rateLimitMiddleware = async (req, res, next) => {
  try {
    const redis = redisClient.getClient();
    
    // Get client IP
    const clientIp = req.ip || req.connection.remoteAddress;
    const key = `rate:${clientIp}`;
    
    // Get current request count
    const currentCount = await redis.get(key);
    
    if (currentCount === null) {
      // First request in window
      await redis.setEx(key, config.rateLimit.windowMs, '1');
      logger.debug(`Rate limit initialized for IP: ${clientIp}`);
      return next();
    }
    
    const requestCount = parseInt(currentCount);
    
    if (requestCount >= config.rateLimit.maxRequests) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key);
      logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
      
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: ttl,
        },
      });
    }
    
    // Increment request count
    await redis.incr(key);
    logger.debug(`Rate limit count for IP ${clientIp}: ${requestCount + 1}/${config.rateLimit.maxRequests}`);
    
    next();
  } catch (error) {
    logger.error(`Rate limiting error: ${error.message}`);
    // On Redis error, allow request to proceed (fail open)
    next();
  }
};

module.exports = rateLimitMiddleware;
