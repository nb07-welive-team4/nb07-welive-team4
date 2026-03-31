import { createUser, createAdmin, createSuperAdmin, loginData } from "../structs/auth.struct";
import { AuthRepo } from "../repositories/auth.repository";
import { ApartRepo } from "../repositories/apart.repository";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import { LoginResponseDto } from "../models/auth.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken, expiresIn14Days } from "../utils/auth.utill";
import prisma from "../../prisma/prisma";

export class AuthService {
  private authRepo = new AuthRepo();
  private apartRepo = new ApartRepo();

  // 회원가입
  register = async (data: createUser | createAdmin | createSuperAdmin) => {
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRound);

    const commonData = {
      username: data.username,
      password: hashedPassword,
      contact: data.contact,
      name: data.name,
      email: data.email,
    };

    if (data.role === "USER") {
      const apartmentId = await this.apartRepo.getApartmentId(data.apartmentName);
      if (!apartmentId) {
        throw new NotFoundError(`해당 아파트가 존재하지 않습니다.`);
      }

      const user = await this.authRepo.createUser({
        ...commonData,
        role: "USER",
        residentApartmentId: apartmentId.id,
        apartmentName: data.apartmentName,
        apartmentDong: data.apartmentDong,
        apartmentHo: data.apartmentHo,
      });

      return user;
    }

    if (data.role === "ADMIN") {
      return await prisma.$transaction(async (tx) => {
        const createdAdmin = await this.authRepo.createUser(
          {
            ...commonData,
            role: "ADMIN",
          },
          tx,
        );

        await this.apartRepo.createApart(
          {
            name: data.apartmentName,
            address: data.apartmentAddress,
            officeNumber: data.apartmentManagementNumber,
            description: data.description,
            startComplexNumber: data.startComplexNumber,
            endComplexNumber: data.endComplexNumber,
            startDongNumber: data.startDongNumber,
            endDongNumber: data.endDongNumber,
            startFloorNumber: data.startFloorNumber,
            endFloorNumber: data.endFloorNumber,
            startHoNumber: data.startHoNumber,
            endHoNumber: data.endHoNumber,
            adminId: createdAdmin.id,
          },
          tx,
        );

        return createdAdmin;
      });
    }

    if (data.role === "SUPER_ADMIN") {
      const superAdmin = await this.authRepo.createUser({
        ...commonData,
        role: "SUPER_ADMIN",
        joinStatus: data.joinStatus,
      });

      return superAdmin;
    }
  };

  // 로그인
  login = async (data: loginData) => {
    const user = await this.authRepo.findByUsername(data.username);
    if (!user) {
      throw new UnauthorizedError("아이디 또는 비밀번호가 일치하지 않습니다.");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("아이디 또는 비밀번호가 일치하지 않습니다.");
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "14d" },
    );
    const expiresAt = expiresIn14Days;

    await prisma.$transaction(async (tx) => {
      await this.authRepo.deleteManyRefreshTokens(user.id, tx);
      await this.authRepo.saveRefreshToken(user.id, refreshToken, expiresAt, tx);
    });

    const userResponse = new LoginResponseDto(user);
    return { user: userResponse, accessToken, refreshToken };
  };

  // 토큰 재발급
  refresh = async (token: string) => {
    const decoded = await verifyToken(token, process.env.JWT_REFRESH_SECRET!);

    const savedToken = await this.authRepo.findRefreshToken(token);
    if (!savedToken || savedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("유효하지 않거나 만료된 세션입니다.");
    }

    const user = savedToken.user;

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "14d" },
    );

    const newExpiresAt = expiresIn14Days;

    await prisma.$transaction(async (tx) => {
      await this.authRepo.deleteManyRefreshTokens(user.id, tx);
      await this.authRepo.saveRefreshToken(user.id, newRefreshToken, newExpiresAt, tx);
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  };
}
