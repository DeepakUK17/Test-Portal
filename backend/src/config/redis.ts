import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Setup Redis client
export const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
    console.log('Successfully connected to Redis');
});
