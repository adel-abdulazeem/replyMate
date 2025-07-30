import express from 'express';
import { FacebookWebhook } from '../webhooks/facebookWebhook.js';
import { WhatsAppWebhook } from '../webhooks/whatsappWebhook.js';
import { validateWebhook } from '../middleware/webhookValidation.js';

const router = express.Router();

// Facebook webhook
router.get('/facebook', FacebookWebhook.verify);
router.post('/facebook', validateWebhook, FacebookWebhook.handle);

// WhatsApp webhook
router.get('/whatsapp', WhatsAppWebhook.verify);
router.post('/whatsapp', validateWebhook, WhatsAppWebhook.handle);

export { router as webhookRouter };
