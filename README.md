# Russia Server
Server repository for Team Russia.

## Local development
### Preparation
- Install `Node.JS` and `npm`
- Install `postgresql`
  - Initialise database and start database server
  - Create a user with the same name as your username
  - Create a database named `russia`

### Development
- Clone repository
- Copy `.env.sample` to `.env` and fill in required environment variables
- Install dependencies
    ````
    npm install
    ````
- Run server.
    ````
    npm run dev
    ````
  This command will watch files and restart the server when changes are made.
#### Useful commands
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
    npm test
    ````

## Deployment
### The quick way
Run `npm run build`, which will build the project to the `dist/` folder.
The server can then be started using `npm start` from within the `dist/` folder, given that required environment variables (such as the database information) have been provided.

### Docker Compose (Recommended)
- Install `docker` and `docker-compose`
- Copy `.env.sample` to `.env` and fill with required keys and secrets
- Modify `Dockerfile` and `docker-compose.yml` if applicable
- Run `docker compose build` and `docker compose up`

We recommend configuring a NGINX reverse proxy for https.

## Configuration
Here are a list of configurable environment variables.

| Name        | Default value | Description |
| ----------- | ------------- | ----------- |
| PORT                  | 3000                              | Server port |
| DB_HOST               | 127.0.0.1 (dev)/postgresql (prod) | Database host |
| POSTGRES_USER         | russia                            | DB user |
| POSTGRES_PASSWORD     | russia                            | DB password |
| POSTGRES_DB           | russia                            | DB name |
| JWT_SECRET            | 'default'                         | Secret that is used to sign JWT tokens |
| FIREBASE_PRIVATE_KEY  | -                                 | Private key of Firebase Admin SDK |
| FIREBASE_PROJECT_ID   | -                                 | Firebase project ID |
| FIREBASE_CLIENT_EMAIL | -                                 | Firebase client email |
| FIREBASE_DATABASE_URL | -                                 | Firebase database URL |
| DIRECTIONS_API_KEY    | -                                 | Directions API key for Google Maps |
