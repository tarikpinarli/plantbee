# --- Stage 1: Build the React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
RUN npm install -g pnpm
COPY client/package.json client/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY client ./
RUN pnpm build

# --- Stage 2: Build the Go Backend ---
FROM golang:alpine AS base

# Installing git for fetching dependencies
RUN apk add --no-cache git

WORKDIR /app

COPY backend/server/go.mod backend/server/go.sum ./
RUN go mod download

FROM base AS dev

RUN go install github.com/air-verse/air@latest

COPY . .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]

FROM base AS builder

# Copy source code and build the binary
COPY backend/server .
RUN go build -o server cmd/server/main.go

# --- Stage 3: Final Production Image ---
FROM alpine:latest

# required for HTTPS/DB connections
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy Go binary
COPY --from=builder /app/server .
# Copy built React frontend
COPY --from=frontend-builder /app/dist /client/dist

EXPOSE 8080

CMD ["./server"]
