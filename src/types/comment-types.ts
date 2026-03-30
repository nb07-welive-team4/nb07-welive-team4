export type BoardType = "NOTICE" | "COMPLAINT" | "POLL";

export interface CreateCommentBody {
  boardId: string;
  boardType: BoardType;
  content: string;
}

export interface UpdateCommentBody {
  content: string;
  boardId: string;
  boardType: BoardType;
}

export interface CommentResponse {
  id: string;
  userId: number;
  writerName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
