import prisma from "../lib/prisma.js";
import { CreateCommentBody } from "../types/comment-types.js";

// 댓글 단건 조회
const findCommentById = async (commentId: string) => {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: { author: { select: { id: true, name: true } } },
  });
};

// 댓글 생성
const createComment = async (authorId: string, body: CreateCommentBody) => {
  return prisma.comment.create({
    data: {
      content: body.content,
      boardId: body.boardId,
      boardType: body.boardType,
      authorId,
    },
    include: { author: { select: { id: true, name: true } } },
  });
};

// 댓글 수정
const updateComment = async (commentId: string, content: string) => {
  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: { author: { select: { id: true, name: true } } },
  });
};

// 댓글 삭제
const deleteComment = async (commentId: string) => {
  return prisma.comment.delete({
    where: { id: commentId },
  });
};

export const commentRepository = {
  findCommentById,
  createComment,
  updateComment,
  deleteComment,
};