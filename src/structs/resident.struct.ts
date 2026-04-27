import { enums, object, optional, size, string, Infer, pattern } from "superstruct";

const Contact = pattern(string(), /^010\d{8}$/);

// string 길이별
const ShortString = size(string(), 1, 20);

export const GetResidentsStruct = object({
  page: optional(pattern(string(), /^\d+$/)),
  limit: optional(pattern(string(), /^\d+$/)),
  building: optional(string()),
  unitNumber: optional(string()),
  residenceStatus: optional(enums(["RESIDENCE", "NO_RESIDENCE"])),
  isRegistered: optional(enums(["true", "false"])),
  keyword: optional(size(string(), 2, 100)),
});

export const CreateResidentStruct = object({
  apartmentId: optional(string()),
  approvalStatus: optional(enums(["APPROVED", "REJECTED", "PENDING"])),
  building: ShortString,
  unitNumber: ShortString,
  contact: Contact,
  residenceStatus: optional(enums(["RESIDENCE", "NO_RESIDENCE"])),
  name: ShortString,
  isHouseholder: enums(["HOUSEHOLDER", "MEMBER"]),
});

export const UpdateResidentStruct = object({
  building: optional(ShortString),
  unitNumber: optional(ShortString),
  contact: optional(Contact),
  name: optional(ShortString),
  isHouseholder: optional(enums(["HOUSEHOLDER", "MEMBER"])),
});

export type GetResidentsQuery = Infer<typeof GetResidentsStruct>;
export type CreateResidentDTO = Infer<typeof CreateResidentStruct>;
export type UpdateResidentDTO = Infer<typeof UpdateResidentStruct>;
