import prisma from "../lib/prisma.js";
import { BoardType } from "@prisma/client";

// 이벤트 목록 조회 (아파트 + 연월 기준)
export const findEventsByApartmentAndMonth = async (
  apartmentId: string,
  year: number,
  month: number,
) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  return prisma.event.findMany({
    where: {
      apartmentId,
      start: { gte: startOfMonth },
      end: { lte: endOfMonth },
    },
    orderBy: { start: "asc" },
  });
};

// 이벤트 단건 조회 (boardId 기준)
export const findEventByBoardId = async (boardId: string) => {
  return prisma.event.findFirst({
    where: { boardId },
  });
};

// 이벤트 단건 조회 (id 기준)
export const findEventById = async (eventId: string) => {
  return prisma.event.findUnique({
    where: { id: eventId },
  });
};

// 이벤트 생성
export const createEvent = async (data: {
  apartmentId: string;
  boardType: BoardType;
  boardId: string;
  title: string;
  category: string;
  type: string;
  start: Date;
  end: Date;
}) => {
  return prisma.event.create({ data });
};

// 이벤트 업데이트
export const updateEvent = async (
  eventId: string,
  data: {
    title?: string;
    start?: Date;
    end?: Date;
  },
) => {
  return prisma.event.update({
    where: { id: eventId },
    data,
  });
};

// 이벤트 삭제
export const deleteEvent = async (eventId: string) => {
  return prisma.event.delete({
    where: { id: eventId },
  });
};
