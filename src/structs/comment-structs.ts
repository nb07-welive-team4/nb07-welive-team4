import { object, string, enums, size } from "superstruct";

const boardTypeValues = ["NOTICE", "COMPLAINT", "POLL"] as const;

export const CreateCommentStruct = object({
  boardId: string(),
  boardType: enums(boardTypeValues),
  content: size(string(), 1, 500),
});

export const UpdateCommentStruct = object({
  content: size(string(), 1, 500),
});