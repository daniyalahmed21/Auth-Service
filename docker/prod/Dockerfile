FROM node:18-bookworm AS builder

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
ENV PATH="/usr/local/bin:${PATH}"

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-bookworm AS runner

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY --from=builder /app/dist ./

EXPOSE 5501

CMD ["node", "src/server.js"]