import { Request, Response } from 'express';

// Index route
export let indexRoute = async (req: Request, res: Response) => {
    return res.json({ name: 'Team Russia Server' });
};
