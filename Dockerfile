FROM node:8.9.0

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN rm -R node_modules/
RUN npm install --dev
RUN npm rebuild node-sass

EXPOSE 3000
CMD [ "npm", "run", "docker-start"]