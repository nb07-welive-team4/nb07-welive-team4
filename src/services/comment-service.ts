import prisma from "../lib/prisma.js";
import { commentRepository } from "../repositories/comment-repository.js";
import {
  CreateCommentBody,
  UpdateCommentBody,
  CommentResponse,
} from "../types/comment-types.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../errors/errors.js";
import { Prisma } from "@prisma/client";
import { UserRole } from "../types/auth.type.js";

// Prisma 반환 타입 별칭
type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: { author: { select: { id: true; name: true } } };
}>;

// 응답 포맷 정제
const formatComment = (comment: CommentWithAuthor): CommentResponse => ({
  id: comment.id,
  userId: comment.authorId,
  writerName: comment.author?.name ?? "",
  content: comment.content,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  board: {
    id: comment.boardId,
    boardType: comment.boardType as CommentResponse["board"]["boardType"],
  },
});

// 댓글 생성
const createComment = async (
  authorId: string,
  body: CreateCommentBody,
): Promise<{ comment: CommentResponse }> => {

  const board = await prisma.board.findUnique({ where: { id: body.boardId } });
  if (!board) throw new NotFoundError("게시판을 찾을 수 없습니다.");
  if (board.type !== body.boardType) throw new BadRequestError("boardType이 실제 게시판 유형과 일치하지 않습니다.");
  
  const comment = await commentRepository.createComment(authorId, body);
  return { comment: formatComment(comment) };
};

// 댓글 수정 (본인만)
const updateComment = async (
  commentId: string,
  requestUserId: string,
  body: UpdateCommentBody,
): Promise<{ comment: CommentResponse }> => {
  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) throw new NotFoundError("댓글을 찾을 수 없습니다.");
  if (comment.authorId !== requestUserId)
    throw new ForbiddenError("본인 댓글만 수정할 수 있습니다.");

  const updated = await commentRepository.updateComment(commentId, body.content);
  return { comment: formatComment(updated) };
};

// 댓글 삭제 (본인 또는 관리자)
const deleteComment = async (
  commentId: string,
  requestUserId: string,
  requestUserRole: UserRole,
): Promise<void> => {
  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) throw new NotFoundError("댓글을 찾을 수 없습니다.");

  const isOwner = comment.authorId === requestUserId;
  const isAdmin =
    requestUserRole === "ADMIN" || requestUserRole === "SUPER_ADMIN";

  if (!isOwner && !isAdmin)
    throw new ForbiddenError("댓글을 삭제할 권한이 없습니다.");

  await commentRepository.deleteComment(commentId);
};

export const commentService = {
  createComment,
  updateComment,
  deleteComment,
};