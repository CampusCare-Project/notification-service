FROM oven/bun:1.1.34-alpine

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY prisma ./prisma
RUN bunx prisma generate

COPY src ./src
COPY tsconfig.json ./tsconfig.json

EXPOSE 3003
CMD ["bun", "src/index.ts"]
