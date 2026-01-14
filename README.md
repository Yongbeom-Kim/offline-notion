# Offline Notion

Offline notion project, inspired by Hans

## Quick Start

### Development (Docker)

```bash
# Install precommit hooks
make setup
# Generate secrets
make gen_env
# Start development mode with hot reload
make dev
```

The frontend will be available on [`localhost:3000`](http://localhost:3000).
Authentik (auth) will be available on [`localhost:9000`](http://localhost:9000).

Development mode mounts your local `client/` directory for live code changes.

## Prerequisites

- Docker and Docker Compose

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make setup` | Configure pre-commit hooks |
| `make start` | Start production containers (foreground) |
| `make start_detached` | Start production containers (background) |
| `make dev` | Start development containers with hot reload |
| `make stop` | Stop production containers |
| `make stop-dev` | Stop development containers |

## Project Structure

```
.
├── client/              # React / TanStack Start frontend application
├── docker-compose.yml          # Production services
├── docker-compose.dev.yml      # Development overrides
├── Makefile                     # Convenient commands
└── .env                         # Environment configuration
```

## Client Documentation

For detailed information about the frontend application, see [client/README.md](client/README.md).
