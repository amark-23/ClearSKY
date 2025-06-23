FROM node:20

WORKDIR /app

COPY package*.json ./

# Εφόσον ξεκινάς FROM node:18-alpine (ή node:20-alpine)

RUN npm install

RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 3001

RUN apt-get update && apt-get install -y sqlite3

CMD ["node", "index.js"]