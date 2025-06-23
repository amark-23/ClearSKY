FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=3011

EXPOSE 3011

CMD ["node", "index.js"]
