import IORedis from 'ioredis';
import { env } from '../config/env';

export const redisPub = new IORedis(env.REDIS_URL);
export const redisSub = new IORedis(env.REDIS_URL);

export const redisQueueConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});