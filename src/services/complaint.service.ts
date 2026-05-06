import * as complaintRepository from '../repositories/complaint.repository';
import * as notificationRepository from '../repositories/notification.repository';
import {
  CreateComplaintBody,
  UpdateComplaintBody,
  UpdateComplaintStatusBody,
  ComplaintListQuery,
  ComplaintDetail,
  ComplaintListItem,
  ComplaintListResponse,
} from '../types/complaint.types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/errors';
import prisma from '../lib/prisma';

// 응답 포맷 - 목록
const formatComplaintListItem = (complaint: any): ComplaintListItem => ({
  complaintId: complaint.id,
  userId: complaint.authorId,
  title: complaint.title,
  writerName: complaint.author?.name ?? '',
  createdAt: complaint.createdAt,
  isPublic: complaint.isPublic,
  viewsCount: complaint.viewsCount,
  commentsCount: complaint._count?.comments ?? complaint.commentsCount ?? 0,
  status: complaint.status,
  dong: complaint.dong ?? '',
  ho: complaint.ho ?? '',
});

// 응답 포맷 - 상세
const formatComplaintDetail = (complaint: any): ComplaintDetail => ({
  complaintId: complaint.id,
  title: complaint.title,
  category: 'COMPLAINT',
  userId: complaint.authorId,
  createdAt: complaint.createdAt,
  viewsCount: complaint.viewsCount,
  commentsCount: complaint._count?.comments ?? complaint.comments?.length ?? 0,
  status: complaint.status,
  content: complaint.content,
  isPublic: complaint.isPublic,
  comments: (complaint.comments ?? []).map((c: any) => ({
    id: c.id,
    userId: c.authorId,
    content: c.content,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    writerName: c.author?.name ?? '',
  })),
});

// boardId로 관리자 ID 조회
const getAdminIdByBoardId = async (boardId: string): Promise<string | null> => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      apartment: {
        include: { admin: { select: { id: true } } },
      },
    },
  });
  return board?.apartment?.admin?.id ?? null;
};

// 민원 목록 조회
export const getComplaints = async (
  apartmentId: string,
  query: ComplaintListQuery,
  isAdmin: boolean,
  requestUserId: string,
): Promise<ComplaintListResponse> => {
  const { complaints, totalCount } = await complaintRepository.findComplaints(
    apartmentId,
    query,
    isAdmin,
    requestUserId,
  );

  return {
    complaints: complaints.map(formatComplaintListItem),
    totalCount,
  };
};

// 민원 상세 조회
export const getComplaintById = async (
  complaintId: string,
  requestUserId: string,
  isAdmin: boolean,
): Promise<ComplaintDetail> => {
  const complaint = await complaintRepository.findComplaintById(complaintId);

  if (!complaint) throw new NotFoundError('민원을 찾을 수 없습니다.');

  // 비공개 글 접근 권한 체크
  if (!complaint.isPublic && !isAdmin && complaint.authorId !== requestUserId) {
    throw new ForbiddenError('비공개 민원은 작성자와 관리자만 열람 가능합니다.');
  }

  // 조회수 증가
  await complaintRepository.incrementViewsCount(complaintId);

  return formatComplaintDetail({ ...complaint, viewsCount: complaint.viewsCount + 1 });
};

// 민원 등록
export const createComplaint = async (
  authorId: string,
  body: CreateComplaintBody,
) => {
  const complaint = await complaintRepository.createComplaint(authorId, body);

  // boardId로 관리자 ID 조회 후 알림 전송
  const adminId = await getAdminIdByBoardId(body.boardId);

  if (adminId) {
    const dedupeKey = `complaint-created-${complaint.id}`;
    const existing = await notificationRepository.findNotificationByDedupeKey(dedupeKey);

    if (!existing) {
      await notificationRepository.createNotifiacationRecord({
        userId: adminId,
        content: '새로운 민원이 등록되었습니다.',
        notificationType: 'COMPLAINT_CREATED' as any,
        dedupeKey,
        complaintId: complaint.id,
      });
    }
  }

  return complaint;
};

// 민원 수정
export const updateComplaint = async (
  complaintId: string,
  requestUserId: string,
  body: UpdateComplaintBody,
) => {
  const complaint = await complaintRepository.findComplaintById(complaintId);

  if (!complaint) throw new NotFoundError('민원을 찾을 수 없습니다.');
  if (complaint.authorId !== requestUserId)
    throw new ForbiddenError('본인이 작성한 민원만 수정할 수 있습니다.');
  if (complaint.status !== 'PENDING')
    throw new BadRequestError('처리 중이거나 완료된 민원은 수정할 수 없습니다.');

  return complaintRepository.updateComplaint(complaintId, body);
};

// 민원 상태 변경 (관리자 전용)
export const updateComplaintStatus = async (
  complaintId: string,
  body: UpdateComplaintStatusBody,
) => {
  const complaint = await complaintRepository.findComplaintById(complaintId);

  if (!complaint) throw new NotFoundError('민원을 찾을 수 없습니다.');

  await complaintRepository.updateComplaintStatus(complaintId, body.status);

  // 작성 입주민에게 알림 전송
  const dedupeKey = `complaint-status-${complaintId}-${body.status}`;
  const existing = await notificationRepository.findNotificationByDedupeKey(dedupeKey);

  if (!existing) {
    const statusLabel: Record<string, string> = {
      PENDING: '접수전',
      IN_PROGRESS: '처리중',
      COMPLETED: '처리완료',
    };

    await notificationRepository.createNotifiacationRecord({
      userId: complaint.authorId,
      content: `민원 상태가 "${statusLabel[body.status]}"(으)로 변경되었습니다.`,
      notificationType: 'COMPLAINT_RESOLVED' as any,
      dedupeKey,
      complaintId,
    });
  }

  return { message: '민원 상태가 변경되었습니다.' };
};

// 민원 삭제
export const deleteComplaint = async (
  complaintId: string,
  requestUserId: string,
  isAdmin: boolean,
) => {
  const complaint = await complaintRepository.findComplaintById(complaintId);

  if (!complaint) throw new NotFoundError('민원을 찾을 수 없습니다.');

  const isOwner = complaint.authorId === requestUserId;

  if (!isOwner && !isAdmin)
    throw new ForbiddenError('민원을 삭제할 권한이 없습니다.');

  if (!isAdmin && complaint.status !== 'PENDING')
    throw new BadRequestError('처리 중이거나 완료된 민원은 삭제할 수 없습니다.');

  await complaintRepository.deleteComplaint(complaintId);

  return { message: '정상적으로 삭제 처리되었습니다.' };
};