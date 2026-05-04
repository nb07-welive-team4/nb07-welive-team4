import * as notificationRepository from '../repositories/notification.repository';
import { CreateNotificationInput, NotificationDto } from '../types/notification.type';
import { toNotificationDto } from './notification.service';
import { publishNotificationCreated } from './notification-realtime.service';


export async function createAndDispatchNotification(
  input: CreateNotificationInput,
): Promise<NotificationDto> {
  if (input.dedupeKey) {
    const existing = await notificationRepository.findNotificationByDedupeKey(input.userId, input.dedupeKey);
    if (existing) {
      return toNotificationDto(existing);
    }
  }

  // createNotifiacationRecord creates both Notification + NotificationOutbox in a transaction
  const saved = await notificationRepository.createNotifiacationRecord(input);
  const dto = toNotificationDto(saved);

  // Redis publish is best-effort; Outbox ensures guaranteed delivery even if this fails
  try {
    await publishNotificationCreated(input.userId, dto);
  } catch {
    // ignore — NotificationOutbox handles eventual delivery
  }

  return dto;
}
