import { Request, Response } from 'express';

// Index route
export const homeRoute = async (req: Request, res: Response) => {
    return res.json({ name: 'Team Russia Server' });
};
