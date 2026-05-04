import { Request, Response, NextFunction } from "express";
import * as noticeService from "../services/notice.service";
import { parsePagination } from "../utils/pagination.util";

// GET /api/notices
export const getNotices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apartmentId = (req.user as any).apartmentId;
    if (!apartmentId) {
      res.status(400).json({ success: false, message: "아파트 정보를 찾을 수 없습니다." });
      return;
    }

    const { page, limit, boardId, category, keyword } = req.query;
    const query: Parameters<typeof noticeService.getNotices>[1] = {
      page: page as string,
      limit: limit as string,
    };
    if (boardId !== undefined) query.boardId = boardId as string;
    if (category !== undefined) query.category = category as string;
    if (keyword !== undefined) query.keyword = keyword as string;
    const result = await noticeService.getNotices(apartmentId, query);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/notices/:noticeId
export const getNoticeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noticeId = req.params["noticeId"] as string;
    const notice = await noticeService.getNoticeById(noticeId);
    res.status(200).json({ notice });
  } catch (err) {
    next(err);
  }
};

// POST /api/notices
export const createNotice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorId = req.user.id;
    const notice = await noticeService.createNotice(authorId, req.body);
    res.status(201).json({ notice });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notices/:noticeId
export const updateNotice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noticeId = req.params["noticeId"] as string;
    const notice = await noticeService.updateNotice(noticeId, req.body);
    res.status(200).json({ notice });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notices/:noticeId
export const deleteNotice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noticeId = req.params["noticeId"] as string;
    const result = await noticeService.deleteNotice(noticeId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
