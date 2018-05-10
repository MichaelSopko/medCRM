FROM node:8.9.0

LABEL maintainer="roma.buchuk@gmail.com"

ARG PORT=3000
ENV PORT $PORT

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
ENV TOOL_NODE_FLAGS="--max-old-space-size=7000"

ARG APP_DIR=/usr/src/app
ENV APP_DIR $APP_DIR

RUN mkdir -p ${APP_DIR}
#RUN mkdir -p ${APP_DIR}/build && \
#    mkdir -p ${APP_DIR}/node_modules

WORKDIR $APP_DIR

#COPY package.json package-lock.json ./
COPY  . ${APP_DIR}

RUN npm install --dev
RUN npm rebuild node-sass
RUN npm i nodemon -g

EXPOSE $PORT

CMD [ "npm", "run", "start:prod:docker"]