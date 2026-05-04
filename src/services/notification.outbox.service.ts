import * as notificationRepository from '../repositories/notification.repository';
import { publishNotificationCreated } from './notification-realtime.service';
import { toNotificationDto } from './notification.service';
import { logger } from '../lib/logger';

export async function processPendingOutboxes(): Promise<void> {
  // claimPendingOutboxesForProcessing: SELECT FOR UPDATE SKIP LOCKED 트랜잭션으로
  // 조회와 PROCESSING 전환을 원자적으로 처리한다. 반환된 항목은 이미 claim된 상태다.
  const outboxes = await notificationRepository.claimPendingOutboxesForProcessing(50);

  for (const outbox of outboxes) {
    try {
      if (!outbox.notificationId || !outbox.userId) {
        await notificationRepository.markNotificationOutboxFailed(outbox.id, 'Missing notificationId or userId');
        continue;
      }

      const notification = await notificationRepository.findNotificationById(outbox.notificationId);
      if (!notification) {
        await notificationRepository.markNotificationOutboxFailed(outbox.id, 'Notification record not found');
        continue;
      }

      const dto = toNotificationDto(notification);
      await publishNotificationCreated(outbox.userId, dto);

      await notificationRepository.markNotificationOutboxProcessed(outbox.id);
      await notificationRepository.updateNotificationDeliveryStatus(outbox.notificationId, 'SENT', {
        sentAt: new Date(),
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      logger.error('[OUTBOX] Failed to process outbox entry', { outboxId: outbox.id, reason });
      try {
        await notificationRepository.markNotificationOutboxFailed(outbox.id, reason);
        if (outbox.notificationId) {
          await notificationRepository.updateNotificationDeliveryStatus(outbox.notificationId, 'FAILED', {
            failedAt: new Date(),
            failedReason: reason,
          });
        }
      } catch (updateErr) {
        logger.error('[OUTBOX] Failed to update outbox failure status', { outboxId: outbox.id, error: String(updateErr) });
      }
    }
  }
}
