import { Queue } from 'bullmq';
import { logger } from '../utilis/logger.js';
import { redisClient } from "../config/redisConfig.js";


const messageQueue = new Queue('message-processing', {
  connection: redisClient(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export class MessageQueue {
  static async addMessage(messageData) {
    try {
      await messageQueue.add('process-message', messageData, {
        priority: messageData.platform === 'whatsapp' ? 10 : 5,
      });
      logger.info(`Message queued: ${messageData.messageId}`);
    } catch (error) {
      logger.error('Failed to queue message:', error);
      throw error;
    }
  }

  static getQueue() {
    return messageQueue;
  }
}