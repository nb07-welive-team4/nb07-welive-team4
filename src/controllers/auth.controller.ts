import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { create } from "superstruct";
import {
  AdminStruct,
  SuperAdminStruct,
  UserStruct,
} from "../structs/auth.struct";

export class AuthController {
  private authService = new AuthService();

  // 유저 회원가입
  createUser = async (req: Request, res: Response) => {
    const createUserDto = create(req.body, UserStruct);
    const user = await this.authService.register(createUserDto);

    res.status(201).json(user);
  };

  createAdmin = async (req: Request, res: Response) => {
    const createAdminDto = create(req.body, AdminStruct);
    const admin = await this.authService.register(createAdminDto);

    res.status(201).json(admin);
  };

  createSuperAdmin = async (req: Request, res: Response) => {
    const createSuperAdminDto = create(req.body, SuperAdminStruct);
    const superAdmin = await this.authService.register(createSuperAdminDto);
  };
}
