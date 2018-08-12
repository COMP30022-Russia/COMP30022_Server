# Russia Server
## Installation
- Install `Node.JS` and `npm`

## Development
- Clone repository
- Copy `.env.sample` to `.env` and fill in required environment variables
- Install dependencies
    ````
    npm install
    ````
- Run server.
This command will watch the files and restart the server when changes are made.
    ````
    npm run dev
    ````
- Prettify code
    ````
    npm run prettify
    ````
- Run linter
    ````
    npm run linter
    ````
- Run tests
    ````
    npm run test
    ````

## Builds
### The quick way
Run `npm run build`, which will build the project to the `dist/` folder.
The server can then be started using `npm start` from within the `dist/` folder.

### Docker
TBD

## Configuration
Here are a list of environment variables which will need to be configured.

| Name        | Default value | Description |
| ----------- | ------------- | ----------- |
| Port        | 3000          | Port that server runs on |
| NODE_ENV    | undefined     | Environment of server (`development` for local development, `production` for deployed builds, etc.) |
