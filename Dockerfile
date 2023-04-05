# Dockerfile only for worker
FROM node:16

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn workers:build

CMD [ "node", "workers-dist" ]
