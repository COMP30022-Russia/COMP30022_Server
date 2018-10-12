// Starts server
import http, { Server } from 'http';

// Set environment variables and initialise app
import './server_load_env';
import app from './app';

// Initialise database
import models from './models';

// Get port from Node environment and set provided port
const port: string = process.env.PORT || '3000';
app.set('port', port);

// Create HTTP server
const server: Server = http.createServer(app);

// Connect to database, sync tables and start server
export default (async () => {
    try {
        // Get database information
        const db_port = models.sequelize.config.port;
        const db_host = models.sequelize.config.host;

        // Test connection by trying to authenticate
        await models.sequelize.authenticate();
        console.log(`Database running on port ${db_port} of host ${db_host}`);

        // Sync all defined models
        await models.sequelize.sync();

        // Create listener on port
        await server.listen(port);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();

// Event listener for HTTP server "listening" event
server.on('listening', function() {
    const addr = server.address();
    const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Express listening on ${bind} in ${app.get('env')} mode`);
});

// Event listener for HTTP server "error" event
// istanbul ignore next
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

export const sequelize = models.sequelize;
export { app };
