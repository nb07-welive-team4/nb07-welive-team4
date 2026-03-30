import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError";
import type { UserRole } from "../types/auth.type";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // TODO: 인증 담당자 JWT 코드 연동 후 교체
    // const token = req.headers.authorization?.split(" ")[1];
    // if (!token) throw new UnauthorizedError();
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    // req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("해당 기능에 접근 권한이 없습니다."));
    }
    next();
  };
};