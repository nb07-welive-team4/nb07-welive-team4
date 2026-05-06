import { Router } from 'express';
import * as complaintController from '../controllers/complaint.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const complaintRouter = Router();

// 전체 민원 조회 (관리자/입주민 모두)
complaintRouter.get('/', authMiddleware, complaintController.getComplaints);

// 민원 등록 (입주민)
complaintRouter.post('/', authMiddleware, complaintController.createComplaint);

// 민원 상세 조회
complaintRouter.get('/:complaintId', authMiddleware, complaintController.getComplaintById);

// 민원 수정 (입주민 본인, PENDING 상태만)
complaintRouter.patch('/:complaintId', authMiddleware, complaintController.updateComplaint);

// 민원 상태 변경 (관리자 전용)
complaintRouter.patch('/:complaintId/status', authMiddleware, adminMiddleware, complaintController.updateComplaintStatus);

// 민원 삭제
complaintRouter.delete('/:complaintId', authMiddleware, complaintController.deleteComplaint);

export default complaintRouter;