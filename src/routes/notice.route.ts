import { Router } from "express";
import * as noticeController from "../controllers/notice.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const noticeRouter = Router();

noticeRouter.get("/", authMiddleware, noticeController.getNotices);
noticeRouter.get("/:noticeId", authMiddleware, noticeController.getNoticeById);
noticeRouter.post("/", authMiddleware, adminMiddleware, noticeController.createNotice);
noticeRouter.patch("/:noticeId", authMiddleware, adminMiddleware, noticeController.updateNotice);
noticeRouter.delete("/:noticeId", authMiddleware, adminMiddleware, noticeController.deleteNotice);

export default noticeRouter;
