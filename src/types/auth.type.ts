import { JwtPayload } from "jsonwebtoken";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface CreateUserDTO {
  username: string;
  password: string;
  contact: string;
  name: string;
  email: string;
  role: UserRole;
  residentApartmentId?: string;
  apartmentName?: string;
  apartmentDong?: string;
  apartmentHo?: string;
  joinStatus?: "APPROVED";
}

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  username: string;
  role: UserRole;
}
