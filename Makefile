PROJECT_NAME=offline_notion

##@ Utility
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Setup

setup: ## Copy git hooks and set executable permissions
	cp -r .githooks/* .git/hooks/
	sudo chmod a+x .git/hooks -R

gen_env: ## Generate a default .env file with random secrets if missing
	if [ ! -f .env ]; then \
		echo "PG_PASS=$(openssl rand -base64 36 | tr -d '\n')" >> .env; \
		echo "AUTHENTIK_SECRET_KEY=$(openssl rand -base64 60 | tr -d '\n')" >> .env; \
	fi

gen_test_env: ## Generate a test-only .env with static passwords if missing
	if [ ! -f .env ]; then \
		echo "PG_PASS=12345" >> .env; \
		echo "AUTHENTIK_SECRET_KEY=12345" >> .env; \
	fi

##@ Docker Compose

start: ## Start production docker compose environment (foreground)
	docker compose -p "$(PROJECT_NAME)_prod" -f docker-compose.yml -f docker-compose.prod.yml up --build --remove-orphans

start_detached: ## Start production docker compose environment (detached/background)
	docker compose -p "$(PROJECT_NAME)_prod" -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

dev: ## Start development docker compose environment
	docker compose -p "$(PROJECT_NAME)_dev" -f docker-compose.yml -f docker-compose.dev.yml up --build --remove-orphans

stop: ## Stop all (prod and dev) docker compose environments
	docker compose -p "$(PROJECT_NAME)_prod" down
	docker compose -p "$(PROJECT_NAME)_dev" down

docker-prune: ## Remove all unused docker data
	docker system prune -a

##@ Infrastructure

tofu-init: ## Initialize tofu (terraform) in infra directory
	set -a && . ./.env && set +a && cd infra && tofu init

tofu-plan: ## Execute tofu plan in infra directory
	set -a && . ./.env && set +a && cd infra && tofu plan

tofu-apply: ## Apply tofu plan in infra directory (auto-approve)
	set -a && . ./.env && set +a && cd infra && tofu apply -auto-approve

tofu-destroy: ## Destroy all infra via tofu (auto-approve)
	set -a && . ./.env && set +a && cd infra && tofu destroy -auto-approve

##@ SSH

ssh_root: ## SSH into server as root user
	set -a && . ./.env && set +a && ssh "root@$${PUBLIC_IPV4}"

ssh_app: ## SSH into server as app user
	set -a && . ./.env && set +a && ssh "app@$${PUBLIC_IPV4}"