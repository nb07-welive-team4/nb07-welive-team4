import { Router } from "express";
import * as noticeController from "../controllers/notice.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const noticeRouter = Router();

// 공지사항 목록 조회 (관리자/입주민 모두)
noticeRouter.get("/", authMiddleware, noticeController.getNotices);

// 공지사항 등록 (관리자 전용)
noticeRouter.post("/", authMiddleware, adminMiddleware, noticeController.createNotice);

// 공지사항 상세 조회 (관리자/입주민 모두)
noticeRouter.get("/:noticeId", authMiddleware, noticeController.getNoticeById);

// 공지사항 수정 (관리자 전용)
noticeRouter.patch("/:noticeId", authMiddleware, adminMiddleware, noticeController.updateNotice);

// 공지사항 삭제 (관리자 전용)
noticeRouter.delete("/:noticeId", authMiddleware, adminMiddleware, noticeController.deleteNotice);

export default noticeRouter;