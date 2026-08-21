import { Response, NextFunction } from "express";
import { AuthRequest } from './auth';
import { ApiError } from "../utils/ApiError";

export function requireRole(...role: string[]) {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user || !role.includes(req.user.role)) {
            return next(new ApiError(403, 'Accès refusé'));
        }
        next();
    };
}