FROM node:20-slim

WORKDIR /app

COPY server/package*.json ./

RUN npm install

COPY server/ ./

RUN npx tsc

CMD ["node", "dist/index.js"]
