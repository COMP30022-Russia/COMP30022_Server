import { Request, Response, NextFunction } from 'express';

// Radix for parseInt should be base 10
const RADIX_BASE_10 = 10;

/**
 * A middleware for verifying the specified ID param.
 * @param name Name of ID param.
 */
export const verifyIDParam = (name: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const param = req.params[name];
        if (!param || !Number.parseInt(param, RADIX_BASE_10)) {
            res.status(400);
            return next(new Error(`Invalid param ${name}`));
        }
        return next();
    };
};
