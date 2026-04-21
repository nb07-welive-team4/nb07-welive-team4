import { Request, Response } from 'express';
import { notificationQueue } from '../queue/notification.queue';

export async function getQueueSummary(_req: Request, res: Response) {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      notificationQueue.getWaitingCount(),
      notificationQueue.getActiveCount(),
      notificationQueue.getCompletedCount(),
      notificationQueue.getFailedCount(),
      notificationQueue.getDelayedCount(),
    ]);

    return res.status(200).json({ waiting, active, completed, failed, delayed });
  } catch (err) {
    console.error('[QUEUE SUMMARY ERROR]', err);
    return res.status(500).json({ message: 'Failed to get queue summary' });
  }
}

export async function getRecentFailedJobs(_req: Request, res: Response) {
  const jobs = await notificationQueue.getFailed(0, 19);
  const result = jobs.map((job) => ({
    id: job.id,
    name: job.name,
    data: job.data,
    failedReason: job.failedReason,
    attemptsMade: job.attemptsMade,
    timestamp: job.timestamp,
  }));
  return res.status(200).json(result);
}
