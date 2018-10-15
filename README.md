# Russia Server
## Installation
- Install `Node.JS` and `npm`
- Install `postgresql`
  - Initialise database and start database server
  - Create a user with the same name as your username
  - Create a database named `russia`

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

## Deployment
### The quick way
Run `npm run build`, which will build the project to the `dist/` folder.
The server can then be started using `npm start` from within the `dist/` folder, given that the required environment variables have been provided.

### Docker Compose (Recommended)
- Install `docker` and `docker-compose`
- Copy `.env.sample` to `.env` and fill with required keys and secrets
- Run `docker compose build` and `docker compose up`

## Configuration
Here are a list of environment variables which will need to be configured.

| Name        | Default value | Description |
| ----------- | ------------- | ----------- |
| PORT        | 3000          | Port that server runs on |
| NODE_ENV    | undefined     | Environment of server (`development` for local development, `production` for deployed builds, etc.) |
| JWT_SECRET  | 'default'     | Secret that is used to sign JWT tokens |
| FIREBASE_PRIVATE_KEY  | -   | Private key of Firebase Admin SDK |
| FIREBASE_PROJECT_ID   | -   | Firebase project ID |
| FIREBASE_CLIENT_EMAIL | -   | Firebase client email |
| FIREBASE_DATABASE_URL | -   | Firebase database URL |
| DIRECTIONS_API_KEY    | -   | Directions API key for Google Maps |
