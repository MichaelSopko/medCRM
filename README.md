Install instructions:

set `NODE_ENV` to `production`

setup db connection in `knexfile.js`

set `ADMIN_PASSWORD` to yours

`npm run install && npm run postinstall`

`npm run start`

### Use docker-compose
Run app in docker development mode

`docker-compose up --build`

### Run 
Run app in development mode with HMR

Make sure that `Docker` ran on your machine
`npm run start:dev:docker-db`

Or without `Docker`, but make sure that `MySQL` server installed and ran
`npm run start:dev`

### Use https

set `USE_SSL` env var to true, and create `keys/key.pem` and `keys/cert.pem`
set `HTTP_PORT=80`
set `PORT=443`
