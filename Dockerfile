FROM node:10.15.1-alpine

ENV NPM_CONFIG_LOGLEVEL warn
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ENV CI 1
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm ci --only=production
COPY . /usr/src/app

EXPOSE 3000
CMD ["/usr/local/bin/npm", "start"]
