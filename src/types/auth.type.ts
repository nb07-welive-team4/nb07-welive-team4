export type UserRole = "SUPER_ADMIN" | "ADMIN" | "RESIDENT";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  apartmentId: string;
}

// Express Request 타입 확장 - 인증 미들웨어 연동 후 사용
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}