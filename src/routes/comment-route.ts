import { Router } from "express";
import { commentController } from "../controllers/comment-controller";

const commentRouter = Router();

commentRouter.post("/", commentController.createComment);
commentRouter.patch("/:commentId", commentController.updateComment);
commentRouter.delete("/:commentId", commentController.deleteComment);

export default commentRouter;
