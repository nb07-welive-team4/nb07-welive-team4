import * as eventRepository from "../repositories/event.repository.js";
import { NotFoundError, BadRequestError } from "../errors/errors.js";
import { EventResponse, GetEventsQuery, UpsertEventQuery } from "../types/event.types.js";
import prisma from "../lib/prisma.js";

// 응답 포맷
const formatEvent = (event: any): EventResponse => ({
  id: event.id,
  start: event.start.toISOString(),
  end: event.end.toISOString(),
  title: event.title,
  category: event.category,
  type: event.type,
});

// 이벤트 목록 조회
export const getEvents = async (query: GetEventsQuery): Promise<EventResponse[]> => {
  const { apartmentId, year, month } = query;

  if (!apartmentId) throw new BadRequestError("apartmentId는 필수입니다.");
  if (!year || !month) throw new BadRequestError("year, month는 필수입니다.");

  const events = await eventRepository.findEventsByApartmentAndMonth(
    apartmentId,
    year,
    month,
  );

  return events.map(formatEvent);
};

// 이벤트 생성 또는 업데이트 (upsert)
export const upsertEvent = async (
  query: UpsertEventQuery,
  tx?: any,
): Promise<void> => {
  const { boardType, boardId, startDate, endDate } = query;

  const client = tx ?? prisma;

  // boardId로 게시글 정보 조회
  let title = "";
  let category = "";
  let apartmentId = "";

  if (boardType === "NOTICE") {
    const notice = await client.notice.findUnique({
      where: { id: boardId },
      include: { board: { select: { apartmentId: true } } },
    });
    if (!notice) throw new NotFoundError("공지사항을 찾을 수 없습니다.");
    title = notice.title;
    category = notice.category;
    apartmentId = notice.board.apartmentId;
  } else if (boardType === "POLL") {
    const poll = await client.poll.findUnique({
      where: { id: boardId },
      include: { board: { select: { apartmentId: true } } },
    });
    if (!poll) throw new NotFoundError("투표를 찾을 수 없습니다.");
    title = poll.title;
    category = "RESIDENT_VOTE";
    apartmentId = poll.board.apartmentId;
  } else {
    throw new BadRequestError("boardType은 NOTICE 또는 POLL이어야 합니다.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 기존 이벤트 있으면 업데이트, 없으면 생성
  const existing = await eventRepository.findEventByBoardId(boardId);

  if (existing) {
    await eventRepository.updateEvent(existing.id, { title, start, end });
  } else {
    await eventRepository.createEvent({
      apartmentId,
      boardType,
      boardId,
      title,
      category,
      type: boardType,
      start,
      end,
    });
  }
};

// 이벤트 삭제
export const deleteEvent = async (eventId: string): Promise<void> => {
  const event = await eventRepository.findEventById(eventId);
  if (!event) throw new NotFoundError("이벤트를 찾을 수 없습니다.");

  await eventRepository.deleteEvent(eventId);
};