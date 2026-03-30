export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  apartmentId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}