const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const userData = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.ip;
      const result = await authService.login(req.body, ipAddress);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const userData = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
