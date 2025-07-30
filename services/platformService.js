import axios from 'axios';
import { logger } from '../utilis/logger.js';

export class PlatformService {
  static async sendMessage(platform, { recipientId, message }) {
    try {
      if (platform === 'facebook') {
        return await this.sendFacebookMessage(recipientId, message);
      } else if (platform === 'whatsapp') {
        return await this.sendWhatsAppMessage(recipientId, message);
      }
      throw new Error(`Unsupported platform: ${platform}`);
    } catch (error) {
      logger.error(`Failed to send ${platform} message:`, error);
      throw error;
    }
  }

  static async sendFacebookMessage(recipientId, message) {
    const url = `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/messages`;
    
    const response = await axios.post(url, {
      recipient: { id: recipientId },
      message: { text: message }
    }, {
      params: { access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN }
    });

    logger.info(`Facebook message sent: ${response.data.message_id}`);
    return response.data;
  }

  static async sendWhatsAppMessage(recipientId, message) {
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      to: recipientId,
      text: { body: message }
    }, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
    });

    logger.info(`WhatsApp message sent: ${response.data.messages[0].id}`);
    return response.data;
  }
}
