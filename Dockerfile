FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN apt-get install -y build-essential python && npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "npm", "start" ]
