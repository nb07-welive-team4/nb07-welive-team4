import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const commentRouter = Router();

commentRouter.post("/", authMiddleware, commentController.createComment);
commentRouter.patch("/:commentId", authMiddleware, commentController.updateComment);
commentRouter.delete("/:commentId", authMiddleware, commentController.deleteComment);

export default commentRouter;