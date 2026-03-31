import { Prisma } from "@prisma/client";
import prisma from "../../prisma/prisma";
import { CreateUserDTO } from "../types/auth.type";

export class AuthRepo {
  createUser = async (data: CreateUserDTO, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        joinStatus: true,
        isActive: true,
        role: true,
      },
    });
  };

  findByUsername = async (username: string) => {
    return await prisma.user.findUnique({
      where: { username },
      include: {
        residenceApartment: {
          include: {
            boards: true,
          },
        },
      },
    });
  };

  saveRefreshToken = async (userId: string, token: string, expiresAt: Date, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  };

  deleteManyRefreshTokens = async (userId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    await client.refreshToken.deleteMany({
      where: { userId },
    });
  };

  findRefreshToken = async (token: string) => {
    return await prisma.refreshToken.findUnique({
      where: { token },
      select: {
        expiresAt: true,
        userId: true,
        user: { select: { id: true, username: true, role: true } },
      },
    });
  };
}
