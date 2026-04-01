export interface CreateUserDTO {
  username: string;
  password: string;
  contact: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  apartmentName?: string;
  apartmentDong?: string;
  apartmentHo?: string;
  joinStatus?: "APPROVED";
}