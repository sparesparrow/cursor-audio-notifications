# Build stage
FROM node:18-bookworm-slim AS builder

RUN apt-get update && apt-get install -y \
    git python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run compile

# Runtime stage
FROM node:18-bookworm-slim

RUN apt-get update && apt-get install -y \
    alsa-utils libasound2 libgbm1 libxcomposite1 \
    libxcursor1 libxi6 libxtst6 libxss1 libnss3 \
    libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libgtk-3-0 libpulse0 pulseaudio-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app .
COPY --from=builder /app/node_modules ./node_modules

USER node
ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"] 