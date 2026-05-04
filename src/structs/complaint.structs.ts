import { object, string, boolean, enums, optional } from 'superstruct';

const complaintStatusValues = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;

export const CreateComplaintStruct = object({
  title: string(),
  content: string(),
  isPublic: boolean(),
  boardId: string(),
});

export const UpdateComplaintStruct = object({
  title: string(),
  content: string(),
  isPublic: boolean(),
});

export const UpdateComplaintStatusStruct = object({
  status: enums(complaintStatusValues),
});