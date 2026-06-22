FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY prisma ./prisma
RUN bunx prisma generate

COPY src ./src
COPY tsconfig.json ./tsconfig.json

EXPOSE 3003
CMD ["bun", "src/index.ts"]
