import { Request, Response, NextFunction } from 'express';

/**
 * A middleware for verifying the specified ID param.
 * @param {string} name Name of ID param.
 */
export const verifyIDParam = function(name: string) {
    return function(req: Request, res: Response, next: NextFunction) {
        const param = req.params[name];
        if (!param || !Number.parseInt(param)) {
            res.status(400);
            return next(new Error(`Invalid param ${name}`));
        }
        return next();
    };
};
