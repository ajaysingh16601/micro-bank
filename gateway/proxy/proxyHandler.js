const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Proxy handler to forward requests to microservices
 * Adds internal authentication headers and handles errors
 */
const proxyRequest = async (req, res, serviceUrl, servicePath) => {
  try {
    const targetUrl = `${serviceUrl}${servicePath}`;
    
    logger.info(`Proxying ${req.method} ${req.path} -> ${targetUrl} | Request ID: ${req.requestId}`);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-ID': req.requestId,
    };

    // Add user info for authenticated requests
    if (req.user) {
      headers['X-User-ID'] = req.user.userId;
      headers['X-User-Email'] = req.user.email;
    }

    // Forward idempotency key if present
    if (req.headers['x-idempotency-key']) {
      headers['X-Idempotency-Key'] = req.headers['x-idempotency-key'];
    }

    // Make request to microservice
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers,
      params: req.query,
      timeout: 30000, // 30 seconds
      validateStatus: () => true, // Don't throw on any HTTP status
    });

    // Forward the response
    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Proxy error: ${error.message} | Request ID: ${req.requestId}`);

    // Handle different error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Service is temporarily unavailable',
          requestId: req.requestId,
        },
      });
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: {
          code: 'GATEWAY_TIMEOUT',
          message: 'Request timeout',
          requestId: req.requestId,
        },
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: {
        code: 'PROXY_ERROR',
        message: 'Error communicating with service',
        requestId: req.requestId,
      },
    });
  }
};

module.exports = { proxyRequest };
