FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/
RUN npm install -g pnpm@latest-11
RUN pnpm install --frozen-lockfile --config.node-linker=hoisted
COPY . .
RUN npx prisma generate
RUN pnpm run build
RUN pnpm prune --prod

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER node
EXPOSE 3000
CMD [ "node", "dist/main" ]