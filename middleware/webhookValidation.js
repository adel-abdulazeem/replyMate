import crypto from 'crypto';
import { logger } from '../utilis/logger.js';

export const validateWebhook = (req, res, next) => {
  try {
    const signature = req.get('X-Hub-Signature-256');
    if (!signature) {
      return res.status(401).send('No signature provided');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== `sha256=${expectedSignature}`) {
      logger.warn('Invalid webhook signature');
      return res.status(401).send('Invalid signature');
    }

    next();
  } catch (error) {
    logger.error('Webhook validation error:', error);
    res.status(500).send('Validation error');
  }
};