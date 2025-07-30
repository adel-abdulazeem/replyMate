import { MessageQueue } from '../queues/messageQueue.js';
import { logger } from '../utilis/logger.js';

export class WhatsAppWebhook {
  static verify(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
      logger.info('WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }

  static async handle(req, res) {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              for (const message of change.value.messages || []) {
                if (message.type === 'text') {
                  await MessageQueue.addMessage({
                    platform: 'whatsapp',
                    senderId: message.from,
                    recipientId: change.value.metadata.phone_number_id,
                    messageText: message.text.body,
                    timestamp: message.timestamp,
                    messageId: message.id
                  });
                }
              }
            }
          }
        }
        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      logger.error('WhatsApp webhook error:', error);
      res.sendStatus(500);
    }
  }
}