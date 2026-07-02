import { NextFunction, Request, Response } from "express";
import { ErrorResponseDto } from "../dto/fabric-analysis.dto";
import { AppError } from "../utils/app-error";

export function notFoundHandler(req: Request, res: Response): void {
  const body: ErrorResponseDto = {
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(body);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: ErrorResponseDto = {
      success: false,
      message: err.message,
      details: err.details,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);

  const body: ErrorResponseDto = {
    success: false,
    message: "An unexpected error occurred.",
  };
  res.status(500).json(body);
}
