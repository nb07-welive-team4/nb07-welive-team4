import prisma from "../lib/prisma";
import { CreateNotificationInput } from "../types/notification.type";

export async function createNotifiacationRecord(input: CreateNotificationInput) {
  return prisma.$transaction(async (tx) => {
    const notification = await tx.notification.create({
      data: {
        userId: input.userId,
        content: input.content,
        notificationType: input.notificationType,
        dedupeKey: input.dedupeKey ?? null,
        complaintId: input.complaintId ?? null,
        noticeId: input.noticeId ?? null,
        pollId: input.pollId ?? null,
        isChecked: false,
        sourceType: input.sourceType ?? null,
        sourceId: input.sourceId ?? null,
      },
    });

    await tx.notificationOutbox.create({
      data: {
        notificationId: notification.notificationId,
        userId: input.userId,
        notificationType: input.notificationType,
        sourceType: input.sourceType ?? null,
        sourceId: input.sourceId ?? null,
        dedupeKey: input.dedupeKey ?? null,
        payload: {
          notificationId: notification.notificationId,
          userId: input.userId,
          content: input.content,
          notificationType: input.notificationType,
          complaintId: input.complaintId ?? null,
          noticeId: input.noticeId ?? null,
          pollId: input.pollId ?? null,
        },
        status: 'PENDING',
      },
    });

    return notification;
  });
}

export async function findNotificationByDedupeKey(dedupeKey: string) {
  return prisma.notification.findFirst({
    where: { dedupeKey },
  });
}


export async function findUnreadNotificationsByUserId(userId: string) {
  return prisma.notification.findMany({
    where: { userId, isChecked: false },
    orderBy: { notifiedAt : 'desc' },
  });
}

export async function findNotificationById(notificationId: string) {
  return prisma.notification.findUnique({
    where: { notificationId },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { notificationId },
    data: { isChecked: true, checkedAt: new Date() },
  });

}


