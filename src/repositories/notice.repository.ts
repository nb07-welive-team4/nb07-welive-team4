import prisma from "../lib/prisma";
import { getSkip } from "../utils/pagination.util";

export interface NoticeListQuery {
  page: number;
  limit: number;
  boardId?: string | undefined;
  category?: string | undefined;
  keyword?: string | undefined;
}

export async function findNotices(apartmentId: string, query: NoticeListQuery) {
  const { page, limit, boardId, category, keyword } = query;

  const where: any = {
    board: { apartmentId },
    ...(boardId && { boardId }),
    ...(category && { category: category as any }),
    ...(keyword && {
      OR: [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ],
    }),
  };

  const [notices, totalCount] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: getSkip(page, limit),
      take: limit,
      include: { author: { select: { name: true } } },
    }),
    prisma.notice.count({ where }),
  ]);

  return { notices, totalCount };
}

export async function findNoticeById(noticeId: string) {
  return prisma.notice.findUnique({
    where: { id: noticeId },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function createNotice(data: {
  category: string;
  title: string;
  content: string;
  isPinned?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  boardId: string;
  authorId: string;
}) {
  return prisma.notice.create({
    data: {
      category: data.category as any,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned ?? false,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      boardId: data.boardId,
      authorId: data.authorId,
    },
    include: {
      board: { select: { apartmentId: true } },
      author: { select: { id: true, name: true } },
    },
  });
}

export async function updateNotice(
  noticeId: string,
  data: {
    category?: string;
    title?: string;
    content?: string;
    isPinned?: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
  },
) {
  return prisma.notice.update({
    where: { id: noticeId },
    data: {
      ...(data.category !== undefined && { category: data.category as any }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
    },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function deleteNotice(noticeId: string) {
  return prisma.notice.delete({ where: { id: noticeId } });
}
