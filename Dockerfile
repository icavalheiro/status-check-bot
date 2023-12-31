FROM node

WORKDIR /app

COPY . .

RUN npm ci

CMD ["node", "./bot.js"]