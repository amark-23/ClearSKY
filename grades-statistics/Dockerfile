FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --production


COPY . .

ENV PORT=3011

RUN apt-get update && apt-get install -y sqlite3

EXPOSE 3011

CMD ["node", "index.js"]
