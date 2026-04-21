import { Worker } from "bullmq";
import { redisQueueConnection } from "../lib/redis";
import { NOTIFICATION_JOB_NAME, NOTIFICATION_QUEUE_NAME } from "../constants/queue.constants";
import { NotificationJobData } from "../types/queue.type";
import { createAndDispatchNotification } from "../services/notification.dispatcher.service";
import { logger } from "../lib/logger";

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job) => {
    if (job.name !== NOTIFICATION_JOB_NAME) return;

    const data = job.data as NotificationJobData;
    await createAndDispatchNotification(data.notification);
  },
  {
    connection: redisQueueConnection,
  },
);

notificationWorker.on('completed', (job) => {
  logger.info('[WORKER] job completed', { jobId: job.id, jobName: job.name });
});

notificationWorker.on('failed', (job, err) => {
  logger.error('[WORKER] job failed', { jobId: job?.id, jobName: job?.name, error: String(err) });
});
