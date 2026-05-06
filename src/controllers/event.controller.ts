import { Request, Response, NextFunction } from "express";
import * as eventService from "../services/event.service.js";

// GET /api/event
export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apartmentId, year, month } = req.query;

    const result = await eventService.getEvents({
      apartmentId: apartmentId as string,
      year: Number(year),
      month: Number(month),
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// PUT /api/event
export const upsertEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardType, boardId, startDate, endDate } = req.query;

    await eventService.upsertEvent({
      boardType: boardType as "NOTICE" | "POLL",
      boardId: boardId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// DELETE /api/event/:eventId
export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params["eventId"] as string;

    await eventService.deleteEvent(eventId);

    res.status(200).json({ message: "이벤트가 삭제되었습니다." });
  } catch (err) {
    next(err);
  }
};