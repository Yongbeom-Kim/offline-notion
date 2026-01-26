# Offline Notion

Offline-First Notion Alternative
## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI library |
| [TanStack Start](https://tanstack.com/start) | Full-stack React framework |
| [TanStack Router](https://tanstack.com/router) | Type-safe file-based routing |
| [TanStack Query](https://tanstack.com/query) | Server state management |
| [BlockNote](https://www.blocknotejs.org/) | Block-based rich text editor |
| [Yjs](https://yjs.dev/) | CRDT for real-time collaboration |
| [Dexie](https://dexie.org/) | IndexedDB wrapper for offline storage |
| [MUI Joy](https://mui.com/joy-ui/) | Component library |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Vite](https://vite.dev/) | Build tool |

### Backend
| Technology | Purpose |
|------------|---------|
| [Go](https://go.dev/) | Backend server |
| [VoidAuth](https://github.com/voidauth/voidauth) | Authentication |
| [Caddy](https://caddyserver.com/) | Reverse proxy with automatic HTTPS |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| [Docker](https://www.docker.com/) | Containerization |
| [OpenTofu](https://opentofu.org/) / Terraform | Infrastructure as Code |
| [AWS Route53](https://aws.amazon.com/route53/) | DNS management |

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Make

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/Yongbeom-Kim/offline-notion.git
cd offline-notion

# 2. Install pre-commit hooks
make setup

# 3. Generate environment secrets
make gen_env

# 4. Start development containers with hot reload
make dev
```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **VoidAuth**: [http://localhost:3002](http://localhost:3002)

Development mode mounts your local directories for live code changes with hot reload.

### Production Setup

1. Set up an ubuntu server somewhere (I'm a Hetzner fan)
2. Get your ipv4 and ipv6, update .env
3. Run the setup script on your server
4. Set up DNS (`make tofu_*`)
5. `make start` (or `make start_detached`)

## 🔧 Makefile Commands

| Command | Description |
|---------|-------------|
| `make setup` | Configure pre-commit hooks |
| `make gen_env` | Generate environment secrets |
| `make gen_test_env` | Generate test environment with simple secrets |
| `make dev` | Start development containers with hot reload |
| `make start` | Start production containers (foreground) |
| `make start_detached` | Start production containers (background) |
| `make stop` | Stop all containers |
| `make docker-prune` | Clean up Docker system |

### Infrastructure Commands

| Command | Description |
|---------|-------------|
| `make tofu-init` | Initialize OpenTofu |
| `make tofu-plan` | Plan infrastructure changes |
| `make tofu-apply` | Apply infrastructure changes |
| `make tofu-destroy` | Destroy infrastructure |
| `make ssh_root` | SSH to server as root |
| `make ssh_app` | SSH to server as app user |