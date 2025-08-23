# PHV Budget Tracker - Makefile
# Cross-platform development commands

.PHONY: help setup start stop clean test lint type-check build deploy

# Default target
help: ## Show this help message
	@echo "🚗 PHV Budget Tracker - Development Commands"
	@echo "============================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "💡 Pro tip: Use 'make <command>' to run any of the above commands"

setup: ## Set up development environment
	@echo "🚗 Setting up PHV Budget Tracker development environment..."
	@if command -v bash >/dev/null 2>&1; then \
		chmod +x ./scripts/setup.sh && ./scripts/setup.sh; \
	elif command -v powershell >/dev/null 2>&1; then \
		powershell -ExecutionPolicy Bypass -File ./scripts/setup.ps1; \
	else \
		echo "❌ No compatible shell found. Please run setup manually."; \
		exit 1; \
	fi

start: ## Start development servers
	@echo "🚀 Starting development servers..."
	@if command -v bash >/dev/null 2>&1; then \
		chmod +x ./scripts/start-dev.sh && ./scripts/start-dev.sh; \
	elif command -v powershell >/dev/null 2>&1; then \
		powershell -ExecutionPolicy Bypass -File ./scripts/start-dev.ps1; \
	else \
		npm run dev; \
	fi

stop: ## Stop all services
	@echo "🛑 Stopping all services..."
	@docker-compose down || echo "Docker services stopped or not running"
	@pkill -f "npm run dev" || echo "Development servers stopped"

clean: ## Clean up generated files and dependencies
	@echo "🧹 Cleaning up..."
	@rm -rf node_modules backend/node_modules mobile/node_modules
	@rm -rf backend/dist mobile/dist
	@rm -rf .expo mobile/.expo
	@rm -rf backend/logs/*.log
	@docker-compose down -v || echo "Docker volumes cleaned"
	@echo "✅ Cleanup complete"

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	@npm install
	@cd backend && npm install
	@cd mobile && npm install
	@echo "✅ Dependencies installed"

test: ## Run all tests
	@echo "🧪 Running tests..."
	@npm run test

test-backend: ## Run backend tests only
	@echo "🧪 Running backend tests..."
	@npm run test:backend

test-mobile: ## Run mobile tests only
	@echo "🧪 Running mobile tests..."
	@npm run test:mobile

lint: ## Run linting on all code
	@echo "📝 Running linting..."
	@npm run lint

lint-fix: ## Fix linting issues automatically
	@echo "📝 Fixing linting issues..."
	@npm run lint:backend -- --fix || echo "Backend linting completed"
	@npm run lint:mobile -- --fix || echo "Mobile linting completed"

type-check: ## Run TypeScript type checking
	@echo "🔍 Running type checking..."
	@npm run type-check

format: ## Format code with Prettier
	@echo "🎨 Formatting code..."
	@npx prettier --write .

build: ## Build for production
	@echo "🏗️  Building for production..."
	@npm run build

build-backend: ## Build backend only
	@echo "🏗️  Building backend..."
	@npm run build:backend

build-mobile: ## Build mobile app
	@echo "🏗️  Building mobile app..."
	@npm run build:mobile

dev-backend: ## Start backend development server only
	@echo "🔧 Starting backend development server..."
	@npm run dev:backend

dev-mobile: ## Start mobile development server only
	@echo "📱 Starting mobile development server..."
	@npm run dev:mobile

db-migrate: ## Run database migrations
	@echo "📊 Running database migrations..."
	@npm run db:migrate

db-seed: ## Seed database with sample data
	@echo "🌱 Seeding database..."
	@npm run db:seed

db-reset: ## Reset database (⚠️  This will delete all data!)
	@echo "⚠️  Resetting database - this will delete all data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@cd backend && npx prisma migrate reset --force

docker-up: ## Start all services with Docker
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d

docker-down: ## Stop Docker services
	@echo "🐳 Stopping Docker services..."
	@docker-compose down

docker-logs: ## View Docker logs
	@echo "📋 Viewing Docker logs..."
	@docker-compose logs -f

docker-rebuild: ## Rebuild Docker images
	@echo "🔨 Rebuilding Docker images..."
	@docker-compose build --no-cache

prod-up: ## Start production environment
	@echo "🚀 Starting production environment..."
	@docker-compose --profile production up -d

health-check: ## Check health of all services
	@echo "🩺 Checking service health..."
	@curl -f http://localhost:3000/health || echo "❌ Backend health check failed"
	@docker-compose ps

backup-db: ## Backup database
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@docker exec $$(docker-compose ps -q postgres) pg_dump -U phv_user phv_budget_tracker > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created in backups/"

restore-db: ## Restore database from backup (requires BACKUP_FILE variable)
	@echo "🔄 Restoring database from backup..."
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify BACKUP_FILE: make restore-db BACKUP_FILE=backups/backup_20240101_120000.sql"; \
		exit 1; \
	fi
	@docker exec -i $$(docker-compose ps -q postgres) psql -U phv_user phv_budget_tracker < $(BACKUP_FILE)
	@echo "✅ Database restored from $(BACKUP_FILE)"

logs: ## View application logs
	@echo "📋 Viewing application logs..."
	@tail -f backend/logs/app.log

ssl-setup: ## Set up SSL certificates for production
	@echo "🔒 Setting up SSL certificates..."
	@mkdir -p ssl-certificates
	@echo "Please place your SSL certificates in the ssl-certificates/ directory"
	@echo "Required files: cert.pem, private.key"

env-check: ## Check environment configuration
	@echo "🔧 Checking environment configuration..."
	@echo "Backend .env: $$([ -f backend/.env ] && echo '✅ Found' || echo '❌ Missing')"
	@echo "Mobile .env: $$([ -f mobile/.env ] && echo '✅ Found' || echo '❌ Missing')"
	@echo "Root .env: $$([ -f .env ] && echo '✅ Found' || echo '❌ Missing')"

update-deps: ## Update all dependencies
	@echo "⬆️  Updating dependencies..."
	@npm update
	@cd backend && npm update
	@cd mobile && npm update
	@echo "✅ Dependencies updated"

security-audit: ## Run security audit
	@echo "🔒 Running security audit..."
	@npm audit
	@cd backend && npm audit
	@cd mobile && npm audit