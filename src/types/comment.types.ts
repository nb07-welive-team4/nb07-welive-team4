export type BoardType = "NOTICE" | "COMPLAINT" | "POLL";

export interface CreateCommentBody {
  boardId: string;
  boardType: BoardType;
  content: string;
}

export interface UpdateCommentBody {
  content: string;
}

export interface CommentResponse {
  id: string;
  userId: string;
  writerName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  board: {
    id: string;
    boardType: BoardType;
  };
}