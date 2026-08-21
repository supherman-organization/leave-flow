import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodSchema } from "zod";

export  function validate(schema: ZodSchema ) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const msg = result.error.issues.map((i) => i.message).join(', ');
            return next(new ApiError(400, msg));
        }
        req.body = result.data;
        next();
    };
}