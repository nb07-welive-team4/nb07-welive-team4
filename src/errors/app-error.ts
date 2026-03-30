export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "리소스를 찾을 수 없습니다.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "권한이 없습니다.") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "잘못된 요청입니다.") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "인증이 필요합니다.") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
