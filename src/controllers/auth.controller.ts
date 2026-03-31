import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { create } from "superstruct";
import { AdminStruct, LoginStruct, SuperAdminStruct, UserStruct } from "../structs/auth.struct";
import { UnauthorizedError } from "../errors/errors";

export class AuthController {
  private authService = new AuthService();

  // 유저 회원가입
  createUser = async (req: Request, res: Response) => {
    const createUserDto = create(req.body, UserStruct);
    const user = await this.authService.register(createUserDto);

    res.status(201).json(user);
  };

  // 관리자 회원가입
  createAdmin = async (req: Request, res: Response) => {
    const createAdminDto = create(req.body, AdminStruct);
    const admin = await this.authService.register(createAdminDto);

    res.status(201).json(admin);
  };

  // 통합 관리자 회원가입
  createSuperAdmin = async (req: Request, res: Response) => {
    const createSuperAdminDto = create(req.body, SuperAdminStruct);
    const superAdmin = await this.authService.register(createSuperAdminDto);

    res.status(201).json(superAdmin);
  };

  // 로그인
  login = async (req: Request, res: Response) => {
    const loginDto = create(req.body, LoginStruct);
    const { user, accessToken, refreshToken } = await this.authService.login(loginDto);
    this.setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json(user);
  };

  // 쿠키 설정
  private setAuthCookies = (res: Response, access: string, refresh: string) => {
    const commonOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };

    res.cookie("accessToken", access, {
      ...commonOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refresh, {
      ...commonOptions,
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });
  };

  refresh = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new UnauthorizedError("인증 토큰이 없습니다.");
    }
    const { accessToken, refreshToken } = await this.authService.refresh(token);
    this.setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({ message: "토큰이 성공적으로 갱신되었습니다." });
  };
}
