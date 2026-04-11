FROM node:24.14.1-alpine AS base

FROM base AS builder
WORKDIR /app

COPY package*json ./
RUN npm ci

COPY scripts scripts
COPY src src
COPY tsconfig.json ./
RUN NODE_ENV=production npm run build && \
  npm prune --omit=dev --omit=optional

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist /app/dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json /app/package.json

USER nodejs

CMD ["node", "/app/dist/main.js"]
