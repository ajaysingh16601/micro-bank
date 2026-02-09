const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validators/auth.validator');

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @route   GET /auth/me
 * @desc    Get current user
 * @access  Protected (via Gateway)
 */
router.get('/me', authController.getCurrentUser);

module.exports = router;
