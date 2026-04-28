import { object, string, boolean, optional, enums } from "superstruct";

const noticeCategoryValues = [
  "MAINTENANCE",
  "EMERGENCY",
  "COMMUNITY",
  "RESIDENT_VOTE",
  "RESIDENT_COUNCIL",
  "ETC",
] as const;

export const CreateNoticeStruct = object({
  category: enums(noticeCategoryValues),
  title: string(),
  content: string(),
  boardId: string(),
  isPinned: boolean(),
  startDate: optional(string()),
  endDate: optional(string()),
});

export const UpdateNoticeStruct = object({
  category: optional(enums(noticeCategoryValues)),
  title: optional(string()),
  content: optional(string()),
  boardId: optional(string()),
  isPinned: optional(boolean()),
  startDate: optional(string()),
  endDate: optional(string()),
  userId: optional(string()),
});