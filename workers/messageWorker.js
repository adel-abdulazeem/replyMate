import { Worker } from 'bullmq';
import { AIService } from '../services/aiServices.js';
import { MessageService } from '../services/messageService.js';
import { PlatformService } from '../services/platformService.js';
import { logger } from '../utilis/logger.js';
import { redisClient } from "../config/redisConfig.js";


const worker = new Worker('message-processing', async (job) => {
  const { data } = job;
  logger.info(`Processing message: ${data.messageId}`);

  try {
    // Analyze message with AI
    const analysis = await AIService.analyzeMessage(data.messageText);
    
    // Generate response draft
    const responseDraft = await AIService.generateResponse(data.messageText, analysis);
    
    // Store in database
    const messageRecord = await MessageService.saveMessage({
      ...data,
      analysis,
      responseDraft,
      status: analysis.confidence >= parseFloat(process.env.AUTO_SEND_CONFIDENCE) 
        ? 'auto_approved' 
        : 'pending_review'
    });

    // Auto-send if confidence is high
    if (analysis.confidence >= parseFloat(process.env.AUTO_SEND_CONFIDENCE)) {
      await PlatformService.sendMessage(data.platform, {
        recipientId: data.senderId,
        message: responseDraft.text
      });
      
      await MessageService.updateStatus(messageRecord.id, 'sent');
      logger.info(`Auto-sent response for message: ${data.messageId}`);
    } else {
      logger.info(`Message queued for review: ${data.messageId}`);
    }

  } catch (error) {
    logger.error(`Failed to process message ${data.messageId}:`, error);
    throw error;
  }
}, { connection: redisClient() });

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err);
});

logger.info('Message worker started');