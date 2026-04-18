import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-key";

type AuthTokenPayload = {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
};

export const tokenValidator = (excludedPaths: ExcludedPath[]) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const isExcludedPath = excludedPaths.some(
            (path) => req.path === path.url && req.method === path.method
        );

        if (isExcludedPath) return next();

        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return next({ message: "Authorization token missing", statusCode: 401 });
        }

        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch (error) {
        return next({ message: "Token is invalid or expired", statusCode: 401 });
    }
}


export class ExcludedPath {
    url:string;
    method:string;
    excludeFromExcludePath:string[];
    constructor(url:string, method:string, ...excludeFromExcludePath:string[]) {
        this.url = url;
        this.method = method;
        this.excludeFromExcludePath = excludeFromExcludePath;
    }
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
            };
        }
    }
}