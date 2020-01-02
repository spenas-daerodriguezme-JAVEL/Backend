# FROM node:10-alpine

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# WORKDIR /home/node/app

# COPY package*.json ./




# RUN  npm install

# USER root

# COPY --chown=node:node . .

# EXPOSE 8080

# CMD [ "npm", "start" ]


#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:12.13.0 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY . .
RUN npm ci --quiet && npm run build

#
# Production stage.
# This state compile get back the JavaScript code from builder stage
# It will also install the production package only
#
FROM node:12.13.0-slim

WORKDIR /app
ENV NODE_ENV=production
ENV javel_jwtPrivateKey=casa
COPY package*.json ./
# RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm ci --quiet --only=production

## We just need the build to execute the command
COPY --from=builder /usr/src/app/build ./build