import prisma from "../lib/prisma.js";
import { CreateNoticeBody, UpdateNoticeBody, NoticeListQuery } from "../types/notice.types";
import { getSkip } from "../utils/pagination.util.js";

// 공지사항 목록 조회
export const findNotices = async (apartmentId: string, query: NoticeListQuery) => {
  const { page = 1, limit = 11, category, search } = query;

  const where: any = {
    board: { apartmentId },
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [notices, totalCount] = await Promise.all([
    prisma.notice.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: getSkip(page, limit),
      take: limit,
    }),
    prisma.notice.count({ where }),
  ]);

  return { notices, totalCount };
};

// 공지사항 단건 조회
export const findNoticeById = async (noticeId: string) => {
  return prisma.notice.findUnique({
    where: { id: noticeId },
    include: {
      author: { select: { id: true, name: true } },
      board: { select: { name: true, apartmentId: true } },
    },
  });
};

// 공지사항 생성
export const createNotice = async (authorId: string, body: CreateNoticeBody) => {
  return prisma.notice.create({
    data: {
      category: body.category as any,
      title: body.title,
      content: body.content,
      boardId: body.boardId,
      authorId,
      isPinned: body.isPinned,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
    include: {
      author: { select: { id: true, name: true } },
      board: { select: { name: true, apartmentId: true } },
    },
  });
};

// 공지사항 수정
export const updateNotice = async (noticeId: string, body: UpdateNoticeBody) => {
  return prisma.notice.update({
    where: { id: noticeId },
    data: {
      ...(body.category && { category: body.category as any }),
      ...(body.title && { title: body.title }),
      ...(body.content && { content: body.content }),
      ...(body.boardId && { boardId: body.boardId }),
      ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      ...(body.startDate !== undefined && {
        startDate: body.startDate ? new Date(body.startDate) : null,
      }),
      ...(body.endDate !== undefined && {
        endDate: body.endDate ? new Date(body.endDate) : null,
      }),
    },
    include: {
      author: { select: { id: true, name: true } },
      board: { select: { name: true, apartmentId: true } },
    },
  });
};

// 공지사항 삭제
export const deleteNotice = async (noticeId: string) => {
  return prisma.notice.delete({
    where: { id: noticeId },
  });
};

// 조회수 증가
export const incrementViewsCount = async (noticeId: string) => {
  return prisma.notice.update({
    where: { id: noticeId },
    data: { viewsCount: { increment: 1 } },
  });
};