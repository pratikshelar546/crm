import type { NextFunction, Request, Response } from "express";

export const pathLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method}: ${req.originalUrl}`);
    next();
};