import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  cyclePath?: string[];
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("API Error:", err);

  if (err.code === "CIRCULAR_DEPENDENCY" || err.statusCode === 409) {
    res.status(409).json({
      error: "CIRCULAR_DEPENDENCY",
      message:
        err.message ||
        "A movie cannot depend on itself directly or through other movies.",
      ...(err.cyclePath ? { cyclePath: err.cyclePath } : {}),
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Something went wrong on the server.",
  });
}