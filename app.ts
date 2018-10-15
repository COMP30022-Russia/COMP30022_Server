import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';

// Import cron jobs
import './helpers/cron';

// Import router
import router from './routes';

// Init express
const app = express();

// Set up body parsing middleware (for requests)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enable helmet, which sets security headers
app.use(helmet());

// Init routes
app.use('/', router);

// Catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
    const err = new Error('Not Found');
    res.status(404);
    next(err);
});

// Error handler
// Adapted from express-generator - Licensed under MIT
app.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
    // Set locals, only provide error in development
    const response: { message?: string; stack?: string } = {};
    response.message = err.message;
    if (req.app.get('env') === 'development') {
        response.stack = err.stack;
    }

    // If internal server error has occurred, print error and set status code
    if (res.statusCode === 200) {
        console.error(err.stack);
        res.status(500);
    }

    // Send response
    res.json(response);
});

export default app;
