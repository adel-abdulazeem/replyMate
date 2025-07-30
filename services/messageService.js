import { logger } from '../utilis/logger.js';

// Simple in-memory storage for MVP - replace with real database
const messages = new Map();
let messageCounter = 0;

export class MessageService {
  static async saveMessage(messageData) {
    try {
      const id = ++messageCounter;
      const message = {
        id,
        ...messageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      messages.set(id, message);
      logger.info(`Message saved: ${id}`);
      return message;
    } catch (error) {
      logger.error('Failed to save message:', error);
      throw error;
    }
  }

  static async updateStatus(messageId, status) {
    try {
      const message = messages.get(messageId);
      if (message) {
        message.status = status;
        message.updatedAt = new Date().toISOString();
        messages.set(messageId, message);
      }
      return message;
    } catch (error) {
      logger.error('Failed to update message status:', error);
      throw error;
    }
  }

  static async getMessages(filters = {}) {
    try {
      let messageList = Array.from(messages.values());
      
      if (filters.status) {
        messageList = messageList.filter(msg => msg.status === filters.status);
      }
      
      if (filters.platform) {
        messageList = messageList.filter(msg => msg.platform === filters.platform);
      }
      
      return messageList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      logger.error('Failed to get messages:', error);
      throw error;
    }
  }

  static async getMessage(messageId) {
    return messages.get(parseInt(messageId));
  }
}