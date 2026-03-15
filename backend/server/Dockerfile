FROM golang:alpine AS base

# Installing git for fetching dependencies
RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

FROM base AS dev

RUN go install github.com/air-verse/air@latest

COPY . .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]

FROM base AS builder

# Copy source code and build the binary
COPY . .
RUN go build -o server cmd/server/main.go

FROM alpine:latest

# required for HTTPS/DB connections
RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
