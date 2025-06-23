FROM node:20

WORKDIR /app
COPY . .

RUN npm install

EXPOSE 3009

RUN apt-get update && apt-get install -y sqlite3

CMD ["node", "index.js"]
