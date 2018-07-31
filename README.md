## Setup environments
set `NODE_ENV` to `production`

setup db connection in `knexfile.js`

set `ADMIN_PASSWORD` to yours


## *** Manual installation ***
### requirements

Mysql 8.0                                                                        
nodejs >= 7.0

### Run
English version: Make sure that `MySQL` server installed and ran. Then do `npm run install` after that
`npm run start:dev`

Hebrew version: Run app in production make sure that `MySQL` server installed and ran.
Then do `npm run install` after that
`npm run start:prod`


## *** Using docker ***

### requirements

Docker ~17.09

### Use docker-compose
Run app in docker development mode

docker-compose up --build

### Run 
Run app in development mode with HMR

Make sure that `Docker` ran on your machine
`npm run start:dev:docker-db`

