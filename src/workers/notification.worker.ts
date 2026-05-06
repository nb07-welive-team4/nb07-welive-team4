import { Worker } from "bullmq";
import { createRedisQueueConnection } from "../lib/redis";
import { NOTIFICATION_JOB_NAME, NOTIFICATION_QUEUE_NAME, OUTBOX_RETRY_JOB_NAME } from "../constants/queue.constants";
import { NotificationJobData } from "../types/queue.type";
import { createAndDispatchNotification } from "../services/notification.dispatcher.service";
import { processPendingOutboxes } from "../services/notification.outbox.service";
import { getNotificationQueue } from "../queue/notification.queue";
import { logger } from "../lib/logger";

export function startNotificationWorker(): Worker {
  const worker = new Worker(
    NOTIFICATION_QUEUE_NAME,
    async (job) => {
      if (job.name === NOTIFICATION_JOB_NAME) {
        const data = job.data as NotificationJobData;
        await createAndDispatchNotification(data.notification);
      } else if (job.name === OUTBOX_RETRY_JOB_NAME) {
        await processPendingOutboxes();
      }
    },
    { connection: createRedisQueueConnection() },
  );

  worker.on('completed', (job) => {
    logger.info('[WORKER] job completed', { jobId: job.id, jobName: job.name });
  });

  worker.on('failed', (job, err) => {
    logger.error('[WORKER] job failed', { jobId: job?.id, jobName: job?.name, error: String(err) });
  });

  const queue = getNotificationQueue();
  queue.add(OUTBOX_RETRY_JOB_NAME, {}, {
    jobId: OUTBOX_RETRY_JOB_NAME,
    repeat: { every: 60_000 },
    removeOnComplete: true,
    removeOnFail: true,
  }).catch((err) => {
    logger.error('[WORKER] Failed to schedule outbox retry job', { error: String(err) });
  });

  return worker;
}
