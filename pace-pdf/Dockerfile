FROM node:10.15.1-alpine

ENV NPM_CONFIG_LOGLEVEL warn
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm ci
COPY . /usr/src/app

EXPOSE 3001
CMD ["/usr/src/app/node_modules/gulp/bin/gulp.js"]

