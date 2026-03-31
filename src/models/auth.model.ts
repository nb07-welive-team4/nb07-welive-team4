export class UserDto {
  id: string;
  name: string;
  email: string;
  joinStatus: string;
  isActive: boolean;
  role: string;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.joinStatus = user.joinStatus;
    this.isActive = user.isActive;
    this.role = user.role;
  }
}
