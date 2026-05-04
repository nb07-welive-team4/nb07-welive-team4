import { createAndDispatchNotification } from './notification.dispatcher.service';
import {
  NotificationDto,
  CreateComplaintNotificationInput,
  CreateNoticeCreatedNotificationInput,
  CreatePollCreatedNotificationInput,
  CreateNoticeCreatedNotificationsForUsersInput,
  CreatePollCreatedNotificationsForUsersInput,
} from '../types/notification.type';

// ─── 단일 알림 helper ─────────────────────────────────────────────────────────

export async function createComplaintCreatedNotification(
  input: CreateComplaintNotificationInput,
): Promise<NotificationDto> {
  return createAndDispatchNotification({
    userId: input.userId,
    content: input.content,
    notificationType: 'COMPLAINT_CREATED',
    sourceType: 'COMPLAINT',
    sourceId: input.complaintId,
    complaintId: input.complaintId,
    dedupeKey: `COMPLAINT_CREATED:COMPLAINT:${input.complaintId}`,
    title: input.title ?? null,
  });
}

export async function createComplaintResolvedNotification(
  input: CreateComplaintNotificationInput,
): Promise<NotificationDto> {
  return createAndDispatchNotification({
    userId: input.userId,
    content: input.content,
    notificationType: 'COMPLAINT_RESOLVED',
    sourceType: 'COMPLAINT',
    sourceId: input.complaintId,
    complaintId: input.complaintId,
    dedupeKey: `COMPLAINT_RESOLVED:COMPLAINT:${input.complaintId}`,
    title: input.title ?? null,
  });
}

export async function createNoticeCreatedNotification(
  input: CreateNoticeCreatedNotificationInput,
): Promise<NotificationDto> {
  return createAndDispatchNotification({
    userId: input.userId,
    content: input.content,
    notificationType: 'NOTICE_CREATED',
    sourceType: 'NOTICE',
    sourceId: input.noticeId,
    noticeId: input.noticeId,
    dedupeKey: `NOTICE_CREATED:NOTICE:${input.noticeId}`,
    title: input.title ?? null,
  });
}

export async function createPollCreatedNotification(
  input: CreatePollCreatedNotificationInput,
): Promise<NotificationDto> {
  return createAndDispatchNotification({
    userId: input.userId,
    content: input.content,
    notificationType: 'POLL_CREATED',
    sourceType: 'POLL',
    sourceId: input.pollId,
    pollId: input.pollId,
    dedupeKey: `POLL_CREATED:POLL:${input.pollId}`,
    title: input.title ?? null,
  });
}

// ─── 다수 사용자 batch helper ──────────────────────────────────────────────────

export async function createNoticeCreatedNotificationsForUsers(
  input: CreateNoticeCreatedNotificationsForUsersInput,
): Promise<void> {
  await Promise.allSettled(
    input.userIds.map((userId) =>
      createNoticeCreatedNotification({
        userId,
        noticeId: input.noticeId,
        content: input.content,
        title: input.title,
      }),
    ),
  );
}

export async function createPollCreatedNotificationsForUsers(
  input: CreatePollCreatedNotificationsForUsersInput,
): Promise<void> {
  await Promise.allSettled(
    input.userIds.map((userId) =>
      createPollCreatedNotification({
        userId,
        pollId: input.pollId,
        content: input.content,
        title: input.title,
      }),
    ),
  );
}
