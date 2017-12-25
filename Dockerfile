FROM node:8.9.0

LABEL maintainer="roma.buchuk@gmail.com"

ARG PORT=3000
ENV PORT $PORT

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG APP_DIR=/usr/src/app
ENV APP_DIR $APP_DIR

RUN mkdir -p ${APP_DIR}/build && \
    mkdir -p ${APP_DIR}/node_modules

WORKDIR $APP_DIR

COPY package.json package-lock.json ./

RUN npm install --dev
RUN npm rebuild node-sass

EXPOSE $PORT

CMD [ "npm", "run", "start:prod:docker"]