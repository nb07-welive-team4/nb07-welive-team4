import * as pollRepository from "../repositories/poll.repository";
import prisma from "../lib/prisma";
import { createNoticeCreatedNotificationsForUsers } from "../services/notification.helper.service";
import { findNotificationTargetUserIdsByApartmentId } from "../repositories/user.repository";

const runSchedule = async () => {
  try {
    // PENDING → IN_PROGRESS: 시작일 도달한 투표 활성화
    const toStart = await pollRepository.findPendingToStart();
    for (const poll of toStart) {
      await pollRepository.updatePollStatus(poll.id, "IN_PROGRESS");
      console.log(`[SCHEDULER] 투표 시작: ${poll.id} (${poll.title})`);
    }

    // IN_PROGRESS → CLOSED: 종료일 지난 투표 마감 + 공지 자동 등록
    const toClose = await pollRepository.findInProgressToClose();
    for (const poll of toClose) {
      await pollRepository.updatePollStatus(poll.id, "CLOSED");
      console.log(`[SCHEDULER] 투표 마감: ${poll.id} (${poll.title})`);

      // 해당 아파트의 NOTICE 게시판에 결과 공지 등록
      const noticeBoard = poll.board.apartment.boards.find((b) => b.type === "NOTICE");
      if (noticeBoard) {
        const resultText = poll.options
          .map((opt) => `- ${opt.title}: ${opt._count.votes}표`)
          .join("\n");

        const notice = await prisma.notice.create({
          data: {
            category: "RESIDENT_VOTE",
            title: `[투표 결과] ${poll.title}`,
            content: `투표가 종료되었습니다.\n\n${resultText}`,
            boardId: noticeBoard.id,
            authorId: poll.authorId,
          },
        });
        console.log(`[SCHEDULER] 투표 결과 공지 등록: ${poll.id}`);

        // NOTE: 이 NOTICE_CREATED 알림은 투표 종료 시 스케줄러가 자동 생성하는 공지에 대한 알림이다.
        // 일반 공지 생성 API(notice.service/route/controller)가 없으므로 현재 공지 생성 경로는
        // 이 스케줄러 흐름 단 하나뿐이다. 추후 일반 notice API가 추가되면
        // 해당 생성 흐름에도 createNoticeCreatedNotificationsForUsers를 별도로 연결해야 한다.
        try {
          const apartmentId = poll.board.apartment.id;
          const targetUserIds = await findNotificationTargetUserIdsByApartmentId({ apartmentId });
          if (targetUserIds.length > 0) {
            await createNoticeCreatedNotificationsForUsers({
              userIds: targetUserIds,
              noticeId: notice.id,
              content: `새로운 공지가 등록되었습니다: ${notice.title}`,
              title: '새 공지',
            });
          }
        } catch (error) {
          console.error('[Notification] Failed to create scheduler notice notifications', error);
        }
      }
    }
  } catch (err) {
    console.error("[SCHEDULER] 투표 상태 업데이트 오류:", err);
  }
};

export const startPollScheduler = () => {
  console.log("[SCHEDULER] 투표 스케줄러 시작 (1분 주기)");
  void runSchedule(); // 서버 시작 시 즉시 1회 실행
  setInterval(() => void runSchedule(), 60 * 1000);
};
