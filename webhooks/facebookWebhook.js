import { MessageQueue } from '../queues/messageQueue.js';
import { logger } from '../utilis/logger.js';

export class FacebookWebhook {
  static verify(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
      logger.info('Facebook webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }

  static async handle(req, res) {
    try {
      const body = req.body;

      if (body.object === 'page') {
        for (const entry of body.entry) {
          for (const messaging of entry.messaging || []) {
            if (messaging.message && !messaging.message.is_echo) {
              await MessageQueue.addMessage({
                platform: 'facebook',
                senderId: messaging.sender.id,
                recipientId: messaging.recipient.id,
                messageText: messaging.message.text,
                timestamp: messaging.timestamp,
                messageId: messaging.message.mid
              });
            }
          }
        }
        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      logger.error('Facebook webhook error:', error);
      res.sendStatus(500);
    }
  }
}
