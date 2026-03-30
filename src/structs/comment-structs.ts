import { object, string, enums } from "superstruct";

const boardTypeValues = ["NOTICE", "COMPLAINT", "POLL"] as const;

export const CreateCommentStruct = object({
  boardId: string(),
  boardType: enums(boardTypeValues),
  content: string(),
});

export const UpdateCommentStruct = object({
  content: string(),
  boardId: string(),
  boardType: enums(boardTypeValues),
});
