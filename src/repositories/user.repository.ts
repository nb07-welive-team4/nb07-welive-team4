import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export class UserRepo {
  findByUserId = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, password: true },
    });
    return user;
  };

  updatePassword = async (userId: string, newPassword: string, tx: Prisma.TransactionClient) => {
    await tx.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  };

  updateProfile = async (userId: string, imageUrl: string, tx: Prisma.TransactionClient) => {
    await tx.user.update({
      where: { id: userId },
      data: { avatar: imageUrl },
    });
  };
}
