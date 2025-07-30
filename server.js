import express from "express";
import dotenv from 'dotenv';
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import flash from "express-flash";

import { webhookRouter } from './routes/webhooks.js';
import { dashboardRouter } from './routes/dashboard.js';
import { logger } from './utilis/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import {redisClient, checkRedisConnection } from './config/redisConfig.js';

const env = process.env.NODE_ENV;
dotenv.config({ path: `./config/.env.${env}`});

const app = express();

app.set('trust proxy', 1);

// ---- MIDDLEWARES ----
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.static("public", { maxAge: '1d' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '1mb' }));
app.use(flash());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, //15min
  max: 100, //each IP can send 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
}));

// ---- ROUTES ----
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/webhooks', webhookRouter);
app.use('/dashboard', dashboardRouter);
app.use(errorHandler);

// ---- CRASH HANDLERS ----
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

let server;

const gracefulShutdown = async () => {
  logger.warn('🛑 Graceful shutdown initiated');
  if (server) {
    server.close(async () => {
      logger.info('✅ HTTP server closed');
      try {
        await redisClient.pause(true);
        await redisClient.close();  
        await redisClient.quit();
        logger.info('✅ Redis disconnected');
      } catch (e) {
        logger.error('❌Redis disconnect failed:', e.message);
      }

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ---- BOOT + LISTEN ----
const port = process.env.PORT || 4000;

const boot = async () => {
  try {
    await Promise.all([
      checkRedisConnection()
    ]);
   server = app.listen(port, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} on port ${port}`);
    });
  } catch (err) {
    logger.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
};

boot();
