import type { Request, Response, NextFunction } from "express";
export interface AppError extends Error {
    code?: string;
    statusCode?: number;
    cyclePath?: string[];
}
export declare function notFoundHandler(req: Request, res: Response, _next: NextFunction): void;
export declare function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map