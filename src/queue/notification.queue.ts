import {Queue} from 'bullmq';
import { redisQueueConnection } from '../lib/redis';
import { NOTIFICATION_QUEUE_NAME } from '../constants/queue.constants';

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redisQueueConnection,
});
