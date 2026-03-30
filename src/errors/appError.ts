export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "리소스를 찾을 수 없습니다.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class BadRequestError extends AppError {
  constructor(message = "잘못된 요청입니다.") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "인증이 필요합니다.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "접근 권한이 없습니다.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message = "이미 존재하는 데이터입니다.") {
    super(message, 409, "CONFLICT");
  }
}