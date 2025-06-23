FROM node:20

WORKDIR /app

COPY package*.json ./

# Εφόσον ξεκινάς FROM node:18-alpine (ή node:20-alpine)

RUN npm install

COPY . .

EXPOSE 3003

RUN npm rebuild bcrypt --build-from-source

RUN apt-get update && apt-get install -y sqlite3

CMD ["node", "index.js"]