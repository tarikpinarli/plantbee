FROM golang:alpine AS builder

# Installing git for fetching dependencies
RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

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