# ── Stage 1: Builder stage → compiles the frontend application.───────────────
# Node.js is a software platform for scalable server-side and networking applications. 
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build          # outputs to /app/dist

# ── Stage 2: Runtime stage → serves the compiled static files using Nginx ─────
FROM nginx:alpine

# Copy compiled app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

