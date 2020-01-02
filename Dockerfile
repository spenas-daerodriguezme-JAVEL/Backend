FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./



RUN apk --no-cache add --virtual builds-deps build-base python

RUN  npm install

USER node

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "npm", "start" ]
