import { object, string, pattern, enums, size, Infer, optional, type, refine } from "superstruct";

const Contact = pattern(string(), /^010\d{8}$/);

const Email = pattern(string(), /^[^\s@]+@[^\s@]+\.[^\s@]+$/);

// string 길이별
const ShortString = size(string(), 1, 20);
const MediumString = size(string(), 1, 100);
const LongString = size(string(), 5, 255);

// 유저 기본 필드
const commonFields = {
  username: size(string(), 3, 20),
  password: size(string(), 8, 20),
  contact: Contact,
  name: size(string(), 2, 10),
  email: Email,
};

// user 필드
export const UserStruct = object({
  ...commonFields,
  role: enums(["USER"]),
  apartmentName: MediumString,
  apartmentDong: ShortString,
  apartmentHo: ShortString,
});

// admin 필드
export const AdminStruct = object({
  ...commonFields,
  role: enums(["ADMIN"]),
  description: size(string(), 0, 1000),
  startComplexNumber: ShortString,
  endComplexNumber: ShortString,
  startDongNumber: ShortString,
  endDongNumber: ShortString,
  startFloorNumber: ShortString,
  endFloorNumber: ShortString,
  startHoNumber: ShortString,
  endHoNumber: ShortString,
  apartmentName: MediumString,
  apartmentAddress: LongString,
  apartmentManagementNumber: pattern(string(), /^\d{7,15}$/),
});

// super-admin 필드
export const SuperAdminStruct = object({
  ...commonFields,
  role: enums(["SUPER_ADMIN"]),
  joinStatus: enums(["APPROVED"]),
});

// 로그인 데이터 타입 검증
export const LoginStruct = object({
  username: size(string(), 3, 20),
  password: size(string(), 8, 20),
});

// 가입 승인
export const UpdateStatusStruct = object({
  status: enums(["APPROVED", "REJECTED"]),
});

export const AdminIdStruct = type({
  adminId: string(),
});

export const ResidentIdStruct = type({
  residentId: string(),
});

// admin 수정(아파트 정보) - superAdmin 전용
const UpdateAdminBase = object({
  contact: optional(Contact),
  name: optional(ShortString),
  email: optional(Email),
  description: optional(string()),
  apartmentName: optional(MediumString),
  apartmentAddress: optional(LongString),
  apartmentManagementNumber: optional(pattern(string(), /^\d+$/)),
});

// admin update 요청시 최소 하나 이상의 필드가 있는지 검증
export const UpdateAdminStruct = refine(
  UpdateAdminBase,
  "AtLeastOneField", // 에러 발생 시 표시될 이름
  (value) => {
    // 객체의 키 배열 길이를 확인하여 0보다 커야 함
    const keys = Object.keys(value);
    return keys.length > 0 || "최소 하나 이상의 수정할 정보를 입력해야 합니다.";
  },
);

export type CreateUserType = Infer<typeof UserStruct>;
export type CreateAdmin = Infer<typeof AdminStruct>;
export type CreateSuperAdmin = Infer<typeof SuperAdminStruct>;
export type LoginData = Infer<typeof LoginStruct>;
export type UpdateAdminInfo = Infer<typeof UpdateAdminStruct>;
export type AdminId = Infer<typeof AdminIdStruct>;
export type UpdateStatus = Infer<typeof UpdateStatusStruct>;
export type ResidentId = Infer<typeof ResidentIdStruct>;
