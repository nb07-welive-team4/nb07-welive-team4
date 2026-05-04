import prisma from '../lib/prisma';
import {
  CreateComplaintBody,
  UpdateComplaintBody,
  ComplaintListQuery,
} from '../types/complaint.types';
import { getSkip } from '../utils/pagination.util';

// 민원 단건 조회
export const findComplaintById = async (complaintId: string) => {
  return prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      author: { select: { id: true, name: true, apartmentDong: true, apartmentHo: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
};

// 민원 목록 조회
export const findComplaints = async (
  apartmentId: string,
  query: ComplaintListQuery,
  isAdmin: boolean,
  requestUserId: string,
) => {
  const { page = 1, limit = 11, status, isPublic, dong, ho, keyword } = query;

  const where: any = {
    board: { apartmentId },
  };

  if (status) where.status = status;
  if (dong) where.dong = dong;
  if (ho) where.ho = ho;
  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { author: { name: { contains: keyword, mode: 'insensitive' } } },
    ];
  }

  // 비공개 처리: 관리자는 전체 조회, 입주민은 본인 것 + 공개글만
  if (!isAdmin) {
    where.OR = [
      { isPublic: true },
      { authorId: requestUserId },
    ];
  } else if (isPublic !== undefined) {
    where.isPublic = isPublic;
  }

  const [complaints, totalCount] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, apartmentDong: true, apartmentHo: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: getSkip(page, limit),
      take: limit,
    }),
    prisma.complaint.count({ where }),
  ]);

  return { complaints, totalCount };
};

// 민원 생성
export const createComplaint = async (authorId: string, body: CreateComplaintBody) => {
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { apartmentDong: true, apartmentHo: true },
  });

  return prisma.complaint.create({
    data: {
      title: body.title,
      content: body.content,
      isPublic: body.isPublic,
      boardId: body.boardId,
      authorId,
      dong: author?.apartmentDong ?? '',
      ho: author?.apartmentHo ?? '',
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });
};

// 민원 수정
export const updateComplaint = async (complaintId: string, body: UpdateComplaintBody) => {
  return prisma.complaint.update({
    where: { id: complaintId },
    data: {
      title: body.title,
      content: body.content,
      isPublic: body.isPublic,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });
};

// 민원 상태 변경
export const updateComplaintStatus = async (complaintId: string, status: string) => {
  return prisma.complaint.update({
    where: { id: complaintId },
    data: { status: status as any },
  });
};

// 민원 삭제
export const deleteComplaint = async (complaintId: string) => {
  return prisma.complaint.delete({
    where: { id: complaintId },
  });
};

// 조회수 증가
export const incrementViewsCount = async (complaintId: string) => {
  return prisma.complaint.update({
    where: { id: complaintId },
    data: { viewsCount: { increment: 1 } },
  });
};

// 댓글 수 업데이트
export const updateCommentsCount = async (complaintId: string) => {
  const count = await prisma.comment.count({
    where: { boardId: complaintId, boardType: 'COMPLAINT' },
  });
  return prisma.complaint.update({
    where: { id: complaintId },
    data: { commentsCount: count },
  });
};