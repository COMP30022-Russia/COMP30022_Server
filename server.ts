// Starts server
// Adapated from: https://github.com/YC/Workflow/blob/dist/src/bin/www.ts
import http, { Server } from 'http';
import app from './app';

// Configure dotenv for development environment
if (app.get('env') === 'development') {
    require('dotenv').config();
}

// Get port from Node environment and set provided port
const port: string = process.env.PORT || '3000';
app.set('port', port);

// Create HTTP server
const server: Server = http.createServer(app);

// Listen for HTTP requests on provided port
server.listen(port);
server.on('listening', function() {
    const addr = server.address();
    const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Express listening on ${bind} in ${app.get('env')} mode`);
});

// Event listener for HTTP server "error" event
server.on('error', function(err: any) {
    if (err.syscall !== 'listen') {
        throw err;
    }
    const bind: string = 'Port ' + port;

    // Handle specific errors with friendly messages
    switch (err.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw err;
    }
});
export default app;
