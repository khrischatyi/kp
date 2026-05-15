# =============================================================================
# Kitchen Portfolio — Makefile
# Single entry point for development and production lifecycle.
# =============================================================================

SHELL := /bin/bash
DC_DEV  := docker compose --env-file .env -f docker-compose.dev.yml
DC_PROD := docker compose --env-file .env -f docker-compose.prod.yml

.DEFAULT_GOAL := help

# ---------------------------------------------------------------------------- #
# Help
# ---------------------------------------------------------------------------- #
.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "  Kitchen Portfolio — make targets"
	@echo "  ────────────────────────────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ---------------------------------------------------------------------------- #
# Lifecycle
# ---------------------------------------------------------------------------- #
.PHONY: dev
dev: ## Start the development stack (hot reload)
	$(DC_DEV) up --build

.PHONY: dev-detached
dev-detached: ## Start the development stack in background
	$(DC_DEV) up --build -d

.PHONY: prod
prod: ## Start the production stack
	$(DC_PROD) up --build -d

.PHONY: build
build: ## Build all production images
	$(DC_PROD) build

.PHONY: down
down: ## Stop and remove dev + prod containers
	-$(DC_DEV) down
	-$(DC_PROD) down

.PHONY: restart
restart: down dev-detached ## Restart the development stack

.PHONY: logs
logs: ## Tail logs from all services (dev)
	$(DC_DEV) logs -f --tail=200

.PHONY: logs-prod
logs-prod: ## Tail logs from all services (prod)
	$(DC_PROD) logs -f --tail=200

# ---------------------------------------------------------------------------- #
# Service shortcuts
# ---------------------------------------------------------------------------- #
.PHONY: backend
backend: ## Open a shell inside the backend container
	$(DC_DEV) exec backend bash

.PHONY: frontend
frontend: ## Open a shell inside the frontend container
	$(DC_DEV) exec frontend sh

.PHONY: db
db: ## Open a psql shell on the database
	$(DC_DEV) exec db psql -U $${POSTGRES_USER} $${POSTGRES_DB}

# ---------------------------------------------------------------------------- #
# Database migrations (Alembic)
# ---------------------------------------------------------------------------- #
.PHONY: migrate
migrate: ## Apply latest Alembic migrations
	$(DC_DEV) exec backend alembic upgrade head

.PHONY: makemigrations
makemigrations: ## Generate a new Alembic migration (use msg="...")
	$(DC_DEV) exec backend alembic revision --autogenerate -m "$(msg)"

.PHONY: migrate-down
migrate-down: ## Roll back the latest migration
	$(DC_DEV) exec backend alembic downgrade -1

# ---------------------------------------------------------------------------- #
# Utility
# ---------------------------------------------------------------------------- #
.PHONY: install-frontend
install-frontend: ## Install frontend dependencies inside the container
	$(DC_DEV) exec frontend npm install

.PHONY: ps
ps: ## List running containers
	$(DC_DEV) ps

.PHONY: clean
clean: ## Stop containers and remove all project images/volumes
	-$(DC_DEV) down -v --rmi local --remove-orphans
	-$(DC_PROD) down -v --rmi local --remove-orphans
	@echo "✓ Cleaned containers, volumes, and images"

.PHONY: clean-build
clean-build: clean build ## Clean everything and rebuild from scratch

.PHONY: lint-backend
lint-backend: ## Run ruff on the backend
	$(DC_DEV) exec backend ruff check app/
