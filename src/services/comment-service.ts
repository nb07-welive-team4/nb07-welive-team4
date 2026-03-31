import { commentRepository } from "../repositories/comment-repository.js";
import {
  CreateCommentBody,
  UpdateCommentBody,
  CommentResponse,
} from "../types/comment-types.js";
import { NotFoundError, ForbiddenError } from "../errors/app-error.js";

// 응답 포맷 정제
const formatComment = (comment: any): CommentResponse => ({
  id: comment.id,
  userId: comment.authorId,
  writerName: comment.author?.name ?? "",
  content: comment.content,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

// 댓글 생성
const createComment = async (
  authorId: number,
  body: CreateCommentBody,
): Promise<{ comment: CommentResponse }> => {
  const comment = await commentRepository.createComment(authorId, body);
  return { comment: formatComment(comment) };
};

// 댓글 수정 (본인만)
const updateComment = async (
  commentId: string,
  requestUserId: number,
  body: UpdateCommentBody,
): Promise<CommentResponse> => {
  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) throw new NotFoundError("댓글을 찾을 수 없습니다.");
  if (comment.authorId !== requestUserId)
    throw new ForbiddenError("본인 댓글만 수정할 수 있습니다.");

  const updated = await commentRepository.updateComment(commentId, body);
  return formatComment(updated);
};

// 댓글 삭제 (본인 또는 관리자)
const deleteComment = async (
  commentId: string,
  requestUserId: number,
  requestUserRole: string,
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
