FROM node:16-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force && npm install

COPY . .

EXPOSE 3001

CMD [ "npm", "run", "start"]