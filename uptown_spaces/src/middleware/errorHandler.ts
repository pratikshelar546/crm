import type { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../utility/response.handler.js";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("error in:", req.originalUrl + " " + err);
    
    res.status(err.statusCode || 500).send(new ResponseHandler(null, err));
}