import {
  createUser,
  createAdmin,
  createSuperAdmin,
} from "../structs/auth.struct";
import { AuthRepo } from "../repositories/auth.repository";
import { ApartRepo } from "../repositories/apart.repository";
import bcrypt from "bcrypt";
import prisma from "../../prisma/prisma";

export class AuthService {
  private authRepo = new AuthRepo();
  private apartRepo = new ApartRepo();

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
      const user = await this.authRepo.createUser({
        ...commonData,
        role: "USER",
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
}
