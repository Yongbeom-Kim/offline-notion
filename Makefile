PROJECT_NAME=offline_notion

setup:
	cp -r .githooks/* .git/hooks/
	sudo chmod a+x .git/hooks -R

gen_env:
	echo "PG_PASS=$(openssl rand -base64 36 | tr -d '\n')" >> .env
	echo "AUTHENTIK_SECRET_KEY=$(openssl rand -base64 60 | tr -d '\n')" >> .env

start:
	docker compose -p "$(PROJECT_NAME)_prod" -f docker-compose.yml up --build

start_detached:
	docker compose -p "$(PROJECT_NAME)_prod" -f docker-compose.yml up -d --build

dev:
	docker compose -p "$(PROJECT_NAME)_dev" -f docker-compose.yml -f docker-compose.dev.yml up --build

stop:
	docker compose -p "$(PROJECT_NAME)_prod" down

stop-dev:
	docker compose -p "$(PROJECT_NAME)_dev" down
