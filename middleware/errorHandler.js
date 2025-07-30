import { logger } from '../utilis/logger.js';

export const errorHandler = (err, req, res, next) => {// eslint-disable-line no-unused-vars
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString()
  });
};

