FROM node as base

WORKDIR /usr/src/app

COPY package*.json ./

ARG NODE_ENV=development
RUN npm install

COPY . .

FROM base as production

ARG NODE_ENV=production
ENV NODE_PATH=./lib

RUN npm run build


FROM base as test

ARG NODE_ENV=development
RUN npm ci
RUN npm run build