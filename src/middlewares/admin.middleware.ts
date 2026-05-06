import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/errors';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user.role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('관리자만 접근할 수 있습니다.');
    }
    next();
  } catch (err) {
    next(err);
  }
};