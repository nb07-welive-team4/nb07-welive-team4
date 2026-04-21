import { redisPub, redisSub } from "../lib/redis";
import { NOTIFICATION_CREATED_CHANNEL, NOTIFICATION_SSE_EVENT, NOTIFICATION_STREAM_KEY } from "../constants/notification.constants";
import { emitToUser } from "../services/notification-sse.service";
import { NotificationDto } from "../types/notification.type";
import { logger } from "../lib/logger";

interface NotificationRealtimeMessage {
  userId: string;
  notification: NotificationDto;
};


export function emitNotificationToLocalClient(userId: string, notification: NotificationDto) {
  emitToUser(userId, NOTIFICATION_SSE_EVENT, {
    type : NOTIFICATION_SSE_EVENT,
    data: [notification],

  })
};

export async function publishNotificationCreated(userId: string, notification: NotificationDto) {
  const message: NotificationRealtimeMessage = { userId, notification };
  const payload = JSON.stringify(message);

  try {
    await redisPub.publish(NOTIFICATION_CREATED_CHANNEL, payload);
    logger.info('[REDIS] published notification', { userId, notificationId: notification.notificationId });
  } catch (err) {
    logger.error('[REDIS] publish failed', { userId, error: String(err) });
    throw err;
  }

  // Redis Streams 보조 기록 (Pub/Sub 보조 계층, 대체 아님)
  try {
    await redisPub.xadd(
      NOTIFICATION_STREAM_KEY,
      '*',
      'userId', userId,
      'notificationId', notification.notificationId,
      'payload', payload,
    );
  } catch (err) {
    logger.error('[REDIS STREAM] xadd failed', { userId, error: String(err) });
  }
};


export async function subscribeNotificationChannel() {
  await redisSub.subscribe(NOTIFICATION_CREATED_CHANNEL);
  
  redisSub.on('message', (channel, payload) => {
    if (channel !== NOTIFICATION_CREATED_CHANNEL) return;
    const message = JSON.parse(payload) as NotificationRealtimeMessage;
    emitToUser(message.userId, NOTIFICATION_SSE_EVENT, {
      type: NOTIFICATION_SSE_EVENT,
      data: [message.notification],
    });
  }
    )
  
};

