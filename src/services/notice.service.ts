import * as noticeRepository from "../repositories/notice.repository";
import * as notificationRepository from "../repositories/notification.repository";
import {
  CreateNoticeBody,
  UpdateNoticeBody,
  NoticeListQuery,
  NoticeListResponse,
  NoticeDetail,
  NoticeListItem,
} from "../types/notice.types";
import { NotFoundError, ForbiddenError } from "../errors/errors";
import prisma from "../lib/prisma.js";

// 응답 포맷 - 목록
const formatNoticeListItem = (notice: any): NoticeListItem => ({
  noticeId: notice.id,
  userId: notice.authorId,
  category: notice.category,
  title: notice.title,
  writerName: notice.author?.name ?? "",
  createdAt: notice.createdAt,
  updatedAt: notice.updatedAt,
  viewsCount: notice.viewsCount,
  commentsCount: notice.commentsCount,
  isPinned: notice.isPinned,
});

// 응답 포맷 - 상세
const formatNoticeDetail = (notice: any): NoticeDetail => ({
  noticeId: notice.id,
  userId: notice.authorId,
  category: notice.category,
  title: notice.title,
  writerName: notice.author?.name ?? "",
  createdAt: notice.createdAt,
  updatedAt: notice.updatedAt,
  viewsCount: notice.viewsCount,
  commentsCount: notice.commentsCount,
  isPinned: notice.isPinned,
  content: notice.content,
  boardName: notice.board?.name ?? "",
  startDate: notice.startDate,
  endDate: notice.endDate,
  comments: [],
});

// 공지사항 목록 조회
export const getNotices = async (
  apartmentId: string,
  query: NoticeListQuery,
): Promise<NoticeListResponse> => {
  const { notices, totalCount } = await noticeRepository.findNotices(apartmentId, query);
  return {
    notices: notices.map(formatNoticeListItem),
    totalCount,
  };
};

// 공지사항 상세 조회
export const getNoticeById = async (noticeId: string): Promise<NoticeDetail> => {
  const notice = await noticeRepository.findNoticeById(noticeId);
  if (!notice) throw new NotFoundError("공지사항을 찾을 수 없습니다.");

  // 조회수 증가
  await noticeRepository.incrementViewsCount(noticeId);

  return formatNoticeDetail({ ...notice, viewsCount: notice.viewsCount + 1 });
};

// 공지사항 등록
export const createNotice = async (
  authorId: string,
  body: CreateNoticeBody,
) => {
  const notice = await noticeRepository.createNotice(authorId, body);

  // 아파트 입주민 전체에게 알림 전송
  const apartmentId = (notice as any).board?.apartmentId;
  if (apartmentId) {
    const residents = await prisma.user.findMany({
      where: {
        role: "USER",
        joinStatus: "APPROVED",
        managedApartment: null,
        apartmentName: {
          not: null,
        },
      },
      select: { id: true },
    });

    for (const resident of residents) {
      const dedupeKey = `notice-created-${notice.id}-${resident.id}`;
      const existing = await notificationRepository.findNotificationByDedupeKey(dedupeKey);
      if (!existing) {
        await notificationRepository.createNotifiacationRecord({
          userId: resident.id,
          content: `새로운 공지사항이 등록되었습니다: ${notice.title}`,
          notificationType: "NOTICE_CREATED",
          dedupeKey,
          noticeId: notice.id,
        });
      }
    }
  }

  // startDate 있으면 이벤트 자동 등록
  if (body.startDate) {
    const board = await prisma.board.findUnique({
      where: { id: body.boardId },
      select: { apartmentId: true },
    });

    if (board) {
      await prisma.event.create({
        data: {
          title: notice.title,
          category: notice.category,
          type: "NOTICE",
          boardType: "NOTICE",
          boardId: notice.id,
          apartmentId: board.apartmentId,
          start: new Date(body.startDate),
          end: body.endDate ? new Date(body.endDate) : new Date(body.startDate),
        },
      });
    }
  }

  return { message: "정상적으로 등록 처리되었습니다" };
};

// 공지사항 수정
export const updateNotice = async (
  noticeId: string,
  body: UpdateNoticeBody,
) => {
  const notice = await noticeRepository.findNoticeById(noticeId);
  if (!notice) throw new NotFoundError("공지사항을 찾을 수 없습니다.");

  const updated = await noticeRepository.updateNotice(noticeId, body);
  return formatNoticeListItem(updated);
};

// 공지사항 삭제
export const deleteNotice = async (noticeId: string) => {
  const notice = await noticeRepository.findNoticeById(noticeId);
  if (!notice) throw new NotFoundError("공지사항을 찾을 수 없습니다.");

  await noticeRepository.deleteNotice(noticeId);
  return { message: "정상적으로 삭제 처리되었습니다" };
};