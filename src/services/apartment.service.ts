import * as apartmentRepository from "../repositories/apartment.repository";
import { NotFoundError, BadRequestError } from "../errors/AppError";
import { parsePagination } from "../utils/pagination.util";
import { calcDongRange, calcHoRange } from "../utils/apartment.util";
import type {
  ApartmentPublicQuery,
  ApartmentAdminQuery,
  ApartmentListPublicResponse,
  ApartmentListAdminResponse,
  ApartmentPublicDetail,
} from "../types/apartment.types";

export const getApartmentsPublic = async (
  filters: ApartmentPublicQuery
): Promise<ApartmentListPublicResponse> => {
  const apartments = await apartmentRepository.findApartmentsPublic(filters);
  return { apartments, count: apartments.length };
};

export const getApartmentPublicById = async (id: number): Promise<ApartmentPublicDetail> => {
  const apartment = await apartmentRepository.findApartmentPublicById(id);
  if (!apartment) throw new NotFoundError("아파트를 찾을 수 없습니다.");
  return {
    ...apartment,
    dongRange: calcDongRange(apartment.startDongNumber, apartment.endDongNumber),
    hoRange: calcHoRange(apartment.startHoNumber, apartment.endHoNumber),
  };
};

export const getApartments = async (
  query: ApartmentAdminQuery
): Promise<ApartmentListAdminResponse> => {
  const { page, limit } = parsePagination(query.page, query.limit);
  return apartmentRepository.findApartments({ ...query, page, limit });
};

export const getApartmentById = async (id: number) => {
  const apartment = await apartmentRepository.findApartmentById(id);
  if (!apartment) throw new NotFoundError("아파트를 찾을 수 없습니다.");
  return {
    ...apartment,
    dongRange: calcDongRange(apartment.startDongNumber, apartment.endDongNumber),
    hoRange: calcHoRange(apartment.startHoNumber, apartment.endHoNumber),
  };
};