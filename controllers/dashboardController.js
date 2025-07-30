import { MessageService } from '../services/messageService.js';
import { PlatformService } from '../services/platformService.js';
import { logger } from '../utilis/logger.js';

export class DashboardController {
  static async getMessages(req, res) {
    try {
      const { status, platform, page = 1, limit = 20 } = req.query;
      
      const messages = await MessageService.getMessages({ status, platform });
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedMessages = messages.slice(startIndex, endIndex);
      
      res.json({
        messages: paginatedMessages,
        total: messages.length,
        page: parseInt(page),
        totalPages: Math.ceil(messages.length / limit)
      });
    } catch (error) {
      logger.error('Dashboard get messages error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  static async approveMessage(req, res) {
    try {
      const { id } = req.params;
      const message = await MessageService.getMessage(id);
      
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Send the message
      await PlatformService.sendMessage(message.platform, {
        recipientId: message.senderId,
        message: message.responseDraft.text
      });

      // Update status
      await MessageService.updateStatus(parseInt(id), 'sent');
      
      res.json({ success: true, message: 'Message approved and sent' });
    } catch (error) {
      logger.error('Approve message error:', error);
      res.status(500).json({ error: 'Failed to approve message' });
    }
  }

  static async rejectMessage(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;// eslint-disable-line no-unused-vars
      
      await MessageService.updateStatus(parseInt(id), 'rejected');
      
      res.json({ success: true, message: 'Message rejected' });
    } catch (error) {
      logger.error('Reject message error:', error);
      res.status(500).json({ error: 'Failed to reject message' });
    }
  }

  static async editMessage(req, res) {
    try {
      const { id } = req.params;
      const { message: editedMessage } = req.body;
      
      const message = await MessageService.getMessage(id);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Send the edited message
      await PlatformService.sendMessage(message.platform, {
        recipientId: message.senderId,
        message: editedMessage
      });

      // Update the message record
      message.responseDraft.text = editedMessage;
      message.responseDraft.edited = true;
      await MessageService.updateStatus(parseInt(id), 'sent');
      
      res.json({ success: true, message: 'Message edited and sent' });
    } catch (error) {
      logger.error('Edit message error:', error);
      res.status(500).json({ error: 'Failed to edit message' });
    }
  }
}
