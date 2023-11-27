FROM node

COPY . /app

WORKDIR /app

RUN npm ci

CMD "node bot.js"