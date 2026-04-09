FROM node:24-alpine AS builder

WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


FROM node:24-alpine AS deps

WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile


ARG PG_VERSION=18
FROM node:24-alpine AS runner

ARG PG_VERSION

RUN apk add --no-cache postgresql${PG_VERSION}-client || apk add --no-cache postgresql-client

WORKDIR /app

COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist


EXPOSE 3000

CMD ["node", "dist/index.js"]