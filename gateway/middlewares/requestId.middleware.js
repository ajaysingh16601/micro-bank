const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to generate and attach a unique request ID to each request
 * The request ID is used for distributed tracing and logging
 */
const requestIdMiddleware = (req, res, next) => {
  // Check if request already has an ID (from NGINX or load balancer)
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Set response header for client tracking
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

module.exports = requestIdMiddleware;
