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
}
