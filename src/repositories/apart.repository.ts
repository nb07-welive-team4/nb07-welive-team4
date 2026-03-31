import { Prisma } from "@prisma/client";
import { CreateApartDto } from "../types/apart.type";

export class ApartRepo {
  createApart = async (data: CreateApartDto, tx: Prisma.TransactionClient) => {
    return await tx.apartment.create({ data });
  };
}
