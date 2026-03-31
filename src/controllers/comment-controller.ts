import { Request, Response, NextFunction } from "express";
import { assert } from "superstruct";
import { commentService } from "../services/comment-service.js";
import {
  CreateCommentStruct,
  UpdateCommentStruct,
} from "../structs/comment-structs.js";

// POST /api/comments
const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    assert(req.body, CreateCommentStruct);

    const authorId = req.user.id;
    const result = await commentService.createComment(authorId, req.body);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/comments/:commentId
const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    assert(req.body, UpdateCommentStruct);

    const commentId = req.params["commentId"] as string;
    const requestUserId = req.user.id;

    const result = await commentService.updateComment(
      commentId,
      requestUserId,
      req.body,
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:commentId
const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commentId = req.params["commentId"] as string;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    await commentService.deleteComment(
      commentId,
      requestUserId,
      requestUserRole,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const commentController = {
  createComment,
  updateComment,
  deleteComment,
};
