Install instructions:

set `NODE_ENV` to `production`

setup db connection in `knexfile.js`

set `ADMIN_PASSWORD` to yours

`npm run install && npm run postinstall`

`npm run start`

### Use https

set `USE_SSL` env var to true, and create `keys/key.pem` and `keys/cert.pem`

### Use docker-compose
Run app in docker development mode

`docker-compose up --build`

