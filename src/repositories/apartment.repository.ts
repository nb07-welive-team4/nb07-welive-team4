import prisma from "../models/prisma";
import { getSkip } from "../utils/pagination.util";
import type { ApartmentPublicQuery, ApartmentAdminQuery } from "../types/apartment.types";

export const findApartmentsPublic = async (filters: ApartmentPublicQuery) => {
  const { keyword, name, address } = filters;
  return prisma.apartment.findMany({
    where: {
      apartmentStatus: "APPROVED",
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: "insensitive" } },
          { address: { contains: keyword, mode: "insensitive" } },
        ],
      }),
      ...(name && { name: { contains: name, mode: "insensitive" } }),
      ...(address && { address: { contains: address, mode: "insensitive" } }),
    },
    select: { id: true, name: true, address: true },
  });
};

export const findApartmentPublicById = async (id: string) => {
  return prisma.apartment.findUnique({
    where: { id, apartmentStatus: "APPROVED" },
    select: {
      id: true,
      name: true,
      address: true,
      startComplexNumber: true,
      endComplexNumber: true,
      startDongNumber: true,
      endDongNumber: true,
      startFloorNumber: true,
      endFloorNumber: true,
      startHoNumber: true,
      endHoNumber: true,
    },
  });
};

export const findApartments = async (
  filters: ApartmentAdminQuery & { page: number; limit: number }
) => {
  const { name, address, searchKeyword, apartmentStatus, page, limit } = filters;
  const where = {
    ...(name && { name: { contains: name, mode: "insensitive" as const } }),
    ...(address && { address: { contains: address, mode: "insensitive" as const } }),
    ...(apartmentStatus && { apartmentStatus }),
    ...(searchKeyword && {
      OR: [
        { name: { contains: searchKeyword, mode: "insensitive" as const } },
        { address: { contains: searchKeyword, mode: "insensitive" as const } },
        { adminName: { contains: searchKeyword, mode: "insensitive" as const } },
        { adminEmail: { contains: searchKeyword, mode: "insensitive" as const } },
      ],
    }),
  };

  const [apartments, totalCount] = await Promise.all([
    prisma.apartment.findMany({ where, skip: getSkip(page, limit), take: limit }),
    prisma.apartment.count({ where }),
  ]);

  return { apartments, totalCount };
};

export const findApartmentById = async (id: string) => {
  return prisma.apartment.findUnique({ where: { id } });
};