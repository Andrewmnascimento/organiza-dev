FROM node:24-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@latest@11
COPY package.json pnpm-lock.yml ./
RUN pnpm install --frozen-lockfile --config.node-linker=hoisted
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]