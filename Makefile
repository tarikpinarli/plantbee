.PHONY: dev prod down clean logs

## ─── Docker Compose ──────────────────────────────────────────

dev: ## Start the full development stack (Adminer, hot-reload, DB port exposed)
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

prod: ## Start the production stack in detached mode
	docker compose -f docker-compose.yml up -d --build

down: ## Stop and remove all containers
	docker compose down

clean: ## Stop containers AND delete database volume (full reset)
	docker compose down -v

logs: ## Tail logs from all running containers
	docker compose logs -f

## ─── Backend Tooling ─────────────────────────────────────────

lint: ## Run Go linters
	cd backend/server && ../../.bin/golangci-lint run

fmt: ## Format Go code
	cd backend/server && ../../.bin/golangci-lint fmt

test: ## Run Go tests
	cd backend/server && go test ./...

build: ## Build Go packages
	cd backend/server && go build ./...

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
