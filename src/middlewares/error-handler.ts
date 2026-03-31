import { Request, Response, NextFunction } from "express";
import { StructError } from "superstruct";
import { AppError } from "../errors/app-error.js";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // superstruct 유효성 검사 오류
  if (err instanceof StructError) {
    res.status(400).json({
      success: false,
      message: `유효성 검사 오류: ${err.message}`,
    });
    return;
  }

  // 커스텀 앱 에러
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // 예상치 못한 에러
  console.error("[ERROR]", err);
  res.status(500).json({
    success: false,
    message: "서버 내부 오류가 발생했습니다.",
  });
};

export default errorHandler;
