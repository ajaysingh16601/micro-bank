const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const jwtService = require('./jwt.service');
const userEventsProducer = require('../events/producers/userEvents.producer');
const config = require('../config/env');
const logger = require('../utils/logger');
const { ValidationError, AuthenticationError, DuplicateError } = require('../utils/errors');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User and tokens
   */
  async register({ name, email, password }) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new DuplicateError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      logger.info(`New user registered: ${user._id}`);

      // Publish USER_REGISTERED event
      await userEventsProducer.publishUserRegistered({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      // Return user without password
      return {
        userId: user._id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {String} ipAddress - IP address of the client
   * @returns {Object} User and tokens
   */
  async login({ email, password }, ipAddress) {
    try {
      // Find user and include password field
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const tokens = jwtService.generateTokens(user);

      // Save refresh token to database
      await User.findByIdAndUpdate(user._id, {
        refreshToken: tokens.refreshToken,
        lastLogin: new Date(),
      });

      logger.info(`User logged in: ${user._id}`);

      // Publish USER_LOGGED_IN event
      await userEventsProducer.publishUserLoggedIn({
        userId: user._id.toString(),
        email: user.email,
        ipAddress,
      });

      return {
        user: {
          userId: user._id,
          email: user.email,
          name: user.name,
        },
        tokens,
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {String} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwtService.verifyToken(refreshToken);

      // Find user with this refresh token
      const user = await User.findOne({
        _id: decoded.userId,
        refreshToken,
      }).select('+refreshToken');

      if (!user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = jwtService.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
      });

      logger.info(`Access token refreshed for user: ${user._id}`);

      return {
        accessToken,
      };
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @returns {Object} User data
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      return {
        userId: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };
    } catch (error) {
      logger.error(`Get user error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AuthService();
