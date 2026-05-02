import * as notificationRepository from '../repositories/notification.repository';
import { CreateNotificationInput, NotificationDto } from '../types/notification.type';
import { toNotificationDto } from './notification.service';
import { publishNotificationCreated } from './notification-realtime.service';


export async function createAndDispatchNotification(
  input: CreateNotificationInput,
): Promise<NotificationDto> {
  if (input.dedupeKey) {
    const existing = await notificationRepository.findNotificationByDedupeKey(input.dedupeKey);
    if (existing) {
      return toNotificationDto(existing);
    }
  }

  // createNotifiacationRecord creates both Notification + NotificationOutbox in a transaction
  const saved = await notificationRepository.createNotifiacationRecord(input);
  const dto = toNotificationDto(saved);

  await publishNotificationCreated(input.userId, dto);

  return dto;
}
