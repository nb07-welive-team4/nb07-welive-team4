import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const eventRouter = Router();

// 이벤트 목록 조회 (관리자/입주민 모두)
eventRouter.get("/", authMiddleware, eventController.getEvents);

// 이벤트 생성 또는 업데이트 (관리자 전용)
eventRouter.put("/", authMiddleware, adminMiddleware, eventController.upsertEvent);

// 이벤트 삭제 (관리자 전용)
eventRouter.delete("/:eventId", authMiddleware, adminMiddleware, eventController.deleteEvent);

export default eventRouter;