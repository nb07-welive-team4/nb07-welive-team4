import * as noticeRepository from "../repositories/notice.repository";
import { createNoticeCreatedNotificationsForUsers } from "./notification.helper.service";
import { findNotificationTargetUserIdsByApartmentId } from "../repositories/user.repository";
import { NotFoundError } from "../errors/errors";
import { parsePagination } from "../utils/pagination.util";

const formatNotice = (notice: any) => ({
  noticeId: notice.id,
  category: notice.category,
  title: notice.title,
  content: notice.content,
  isPinned: notice.isPinned,
  startDate: notice.startDate,
  endDate: notice.endDate,
  boardId: notice.boardId,
  authorId: notice.author?.id ?? notice.authorId,
  authorName: notice.author?.name ?? "",
  createdAt: notice.createdAt,
  updatedAt: notice.updatedAt,
});

export const getNotices = async (
  apartmentId: string,
  query: { page?: string | number; limit?: string | number; boardId?: string; category?: string; keyword?: string },
) => {
  const { page, limit } = parsePagination(query.page, query.limit);
  const repoQuery: noticeRepository.NoticeListQuery = { page, limit };
  if (query.boardId !== undefined) repoQuery.boardId = query.boardId;
  if (query.category !== undefined) repoQuery.category = query.category;
  if (query.keyword !== undefined) repoQuery.keyword = query.keyword;

  const { notices, totalCount } = await noticeRepository.findNotices(apartmentId, repoQuery);
  return { notices: notices.map(formatNotice), totalCount };
};

export const getNoticeById = async (noticeId: string) => {
  const notice = await noticeRepository.findNoticeById(noticeId);
  if (!notice) throw new NotFoundError("공지를 찾을 수 없습니다.");
  return formatNotice(notice);
};

export const createNotice = async (
  authorId: string,
  body: {
    category: string;
    title: string;
    content: string;
    isPinned?: boolean;
    startDate?: string | null;
    endDate?: string | null;
    boardId: string;
  },
) => {
  const createData: Parameters<typeof noticeRepository.createNotice>[0] = {
    category: body.category,
    title: body.title,
    content: body.content,
    startDate: body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate ? new Date(body.endDate) : null,
    boardId: body.boardId,
    authorId,
  };
  if (body.isPinned !== undefined) createData.isPinned = body.isPinned;

  const notice = await noticeRepository.createNotice(createData);

  const apartmentId = notice.board?.apartmentId;
  if (apartmentId) {
    try {
      const userIds = await findNotificationTargetUserIdsByApartmentId({ apartmentId });
      if (userIds.length > 0) {
        await createNoticeCreatedNotificationsForUsers({
          userIds,
          noticeId: notice.id,
          content: `새로운 공지가 등록되었습니다: ${notice.title}`,
          title: "새 공지",
        });
      }
    } catch (err) {
      console.error("[Notice] Failed to send notice notifications", err);
    }
  }

  return formatNotice(notice);
};

export const updateNotice = async (
  noticeId: string,
  body: {
    category?: string;
    title?: string;
    content?: string;
    isPinned?: boolean;
    startDate?: string | null;
    endDate?: string | null;
  },
) => {
  const exists = await noticeRepository.findNoticeById(noticeId);
  if (!exists) throw new NotFoundError("공지를 찾을 수 없습니다.");

  const updateData: Parameters<typeof noticeRepository.updateNotice>[1] = {};
  if (body.category !== undefined) updateData.category = body.category;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.isPinned !== undefined) updateData.isPinned = body.isPinned;
  if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;

  const notice = await noticeRepository.updateNotice(noticeId, updateData);
  return formatNotice(notice);
};

export const deleteNotice = async (noticeId: string) => {
  const exists = await noticeRepository.findNoticeById(noticeId);
  if (!exists) throw new NotFoundError("공지를 찾을 수 없습니다.");

  await noticeRepository.deleteNotice(noticeId);
  return { message: "공지가 삭제되었습니다." };
};
