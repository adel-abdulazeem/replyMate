import Redis from 'ioredis';
import dotenv from 'dotenv';

import { logger } from "../utilis/logger.js";

dotenv.config({ path: `./config/.env`});

const redisConfig = {
  host: process.env.REDIS_HOST ,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD ,
  db: process.env.REDIS_DB || 0,
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  lazyConnect: true,
  keepAlive: 3000,
  connectTimeout: 5000,
  family: 4, //IPv4
  retryStrategy(times) { //times = attempts: 2
    if (times > 3) return null;
    const delay = Math.min(times * 200, 2000);
    logger.warn(`🔁 Redis retry attempt #${times}, delaying ${delay}ms`);
    return delay;
  },
};

// Connection with reconnection logic
const redisClient = () => {
  const redis = new Redis(redisConfig);
  
  redis.on('connect', () => logger.info('✅ Redis connected'));
  redis.on('error', (err) => logger.error('❌ Redis error:', err));
  redis.on('close', () => logger.warn('⚠️ Redis connection closed'));
  return redis;
};

// Redis
const checkRedisConnection = async () => {

  try {
    const redisConn = redisClient();
    await redisConn.connect();
  } catch (err) {
    logger.fatal('❌ Initial Redis connection failed:', err.message);
    throw err;
  }};

export {redisClient, checkRedisConnection }

