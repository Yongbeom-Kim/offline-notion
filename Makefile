PROJECT_NAME=offline_notion

setup:
	cp -r .githooks/* .git/hooks/
	sudo chmod a+x .git/hooks -R

gen_env:
	if [ ! -f .env ]; then \
		echo "PG_PASS=$(openssl rand -base64 36 | tr -d '\n')" >> .env; \
		echo "AUTHENTIK_SECRET_KEY=$(openssl rand -base64 60 | tr -d '\n')" >> .env; \
	fi

gen_test_env:
	if [ ! -f .env ]; then \
		echo "PG_PASS=12345" >> .env; \
		echo "AUTHENTIK_SECRET_KEY=12345" >> .env; \
	fi

start:
	docker compose -p "$(PROJECT_NAME)_prod" -f docker-compose.yml -f docker-compose.prod.yml up --build --remove-orphans

start_detached:
	docker compose -p "$(PROJECT_NAME)_prod" -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

dev:
	docker compose -p "$(PROJECT_NAME)_dev" -f docker-compose.yml -f docker-compose.dev.yml up --build --remove-orphans

stop:
	docker compose -p "$(PROJECT_NAME)_prod" down
	docker compose -p "$(PROJECT_NAME)_dev" down

docker-prune:
	docker system prune -a

tofu-init:
	set -a && . ./.env && set +a && cd infra && tofu init

tofu-plan:
	set -a && . ./.env && set +a && cd infra && tofu plan

tofu-apply:
	set -a && . ./.env && set +a && cd infra && tofu apply -auto-approve

tofu-destroy:
	set -a && . ./.env && set +a && cd infra && tofu destroy -auto-approve

ssh_root:
	set -a && . ./.env && set +a && ssh "root@$${PUBLIC_IPV4}"

ssh_app:
	set -a && . ./.env && set +a && ssh "app@$${PUBLIC_IPV4}"