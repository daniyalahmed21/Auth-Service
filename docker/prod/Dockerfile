FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm ci

COPY . .

RUN npm run build

FROM node:18 AS runner

WORKDIR /app

COPY package*.json ./


RUN npm ci --ignore-scripts

COPY --from=builder /app/dist ./

EXPOSE 5501

CMD ["node", "src/server.js"]