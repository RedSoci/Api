FROM node as base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM base as production

ENV NODE_PATH=./lib

RUN npm run build