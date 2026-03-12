FROM golang:alpine AS builder

# Installing git for fetching dependencies
RUN apk add --no-cache git

WORKDIR /app

COPY backend/server/go.mod backend/server/go.sum ./
RUN go mod download

# Copy source code and build the binary
COPY backend/server .
RUN go build -o server cmd/server/main.go

FROM alpine:latest

# required for HTTPS/DB connections
RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/server .
COPY frontend /frontend

EXPOSE 8080

CMD ["./server"]