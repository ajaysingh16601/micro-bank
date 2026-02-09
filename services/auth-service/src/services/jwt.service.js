const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

class JWTService {
  /**
   * Generate access token
   * @param {Object} payload - User data to encode
   * @returns {String} JWT access token
   */
  generateAccessToken(payload) {
    try {
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.accessExpiry,
      });
      return token;
    } catch (error) {
      logger.error(`Error generating access token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate refresh token
   * @param {Object} payload - User data to encode
   * @returns {String} JWT refresh token
   */
  generateRefreshToken(payload) {
    try {
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.refreshExpiry,
      });
      return token;
    } catch (error) {
      logger.error(`Error generating refresh token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Tokens object
   */
  generateTokens(user) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded payload
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      logger.warn(`Token verification failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new JWTService();
