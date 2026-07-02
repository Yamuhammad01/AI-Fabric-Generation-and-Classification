export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, details);
  }

  static unprocessable(message: string, details?: unknown) {
    return new AppError(422, message, details);
  }

  static internal(message: string, details?: unknown) {
    return new AppError(500, message, details);
  }

  static badGateway(message: string, details?: unknown) {
    return new AppError(502, message, details);
  }
}
