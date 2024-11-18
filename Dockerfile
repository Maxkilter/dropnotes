FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY client/package*.json client/
RUN yarn client:install --omit=dev

COPY server/package*.json server/
RUN yarn server:install --omit-dev

COPY client/ client/
RUN yarn --cwd client build

COPY server/ server/

RUN chmod -R 777 /app/server/records

USER node

CMD ["yarn", "--cwd", "server", "start"]

EXPOSE 8000
