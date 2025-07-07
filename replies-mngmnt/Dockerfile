FROM node:20

LABEL authors="konstantinos"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && apt-get install -y sqlite3

EXPOSE 3007

CMD ["node", "index.js"]
