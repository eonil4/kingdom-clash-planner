# Docker Development Guide

This guide covers Docker-based development for Kingdom Clash Planner using **Rancher Desktop** and **VS Code** integration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Workflows](#development-workflows)
- [VS Code Integration](#vs-code-integration)
- [Testing](#testing)
- [Production Build](#production-build)
- [Rancher Desktop Configuration](#rancher-desktop-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| [Rancher Desktop](https://rancherdesktop.io/) | 1.12+ | Container runtime (Docker/containerd) |
| [VS Code](https://code.visualstudio.com/) | Latest | IDE with Dev Container support |
| [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) | Latest | VS Code extension for containerized development |

### Rancher Desktop Setup

1. **Download and install** Rancher Desktop from [rancherdesktop.io](https://rancherdesktop.io/)

2. **Configure Container Engine**:
   - Open Rancher Desktop → Preferences → Container Engine
   - Select **dockerd (moby)** for full Docker compatibility
   - Enable **Administrative Access** if prompted

3. **Verify Installation**:
   ```powershell
   docker --version
   docker compose version
   ```

---

## Quick Start

### Start Development Server

```powershell
# Build dev image
docker compose build dev

# Start dev server with hot reload
docker compose up dev

# Or run in background
docker compose up dev -d
```

Access the app at: **http://localhost:3000**

### Stop All Services

```powershell
docker compose down
```

---

## Development Workflows

### Available Services

| Service | Command | Port | Description |
|---------|---------|------|-------------|
| `dev` | `docker compose up dev` | 3000 | Development server with hot reload |
| `prod` | `docker compose up prod` | 8080 | Production nginx server |
| `test-unit` | `docker compose run --rm test-unit` | - | Run unit tests |
| `test-e2e` | `docker compose --profile test up test-e2e` | - | Run E2E tests |
| `lint` | `docker compose --profile ci run --rm lint` | - | Run linter |
| `ci` | `docker compose --profile ci run --rm ci` | - | Full CI pipeline |

### Development Commands

```powershell
# Start development server
docker compose up dev

# Watch logs
docker compose logs -f dev

# Execute commands inside dev container
docker compose exec dev pnpm run lint:fix

# Rebuild after dependency changes
docker compose build --no-cache dev
docker compose up dev
```

### Building Production Image

```powershell
# Build production image
docker compose build --no-cache prod

# Run production container
docker compose up prod

# Access at http://localhost:8080
```

---

## VS Code Integration

### Method 1: Dev Containers (Recommended)

The project includes full Dev Container support for a consistent development environment.

#### Opening in Dev Container

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Select**: `Dev Containers: Reopen in Container`
3. **Wait** for container build and VS Code extensions to install

#### Features Included

- Pre-configured VS Code extensions (ESLint, Prettier, Playwright, etc.)
- Automatic port forwarding (3000 for Vite, 51204 for Vitest UI)
- Git and GitHub CLI pre-installed
- Playwright with Chromium for E2E testing
- pnpm package manager ready

#### Running Commands in Dev Container

Once inside the Dev Container, use the integrated terminal:

```bash
# Start dev server
pnpm run dev

# Run tests
pnpm run test:unit
pnpm run test:e2e

# Lint and fix
pnpm run lint:fix
```

### Method 2: Docker Compose Attach

If you prefer to keep VS Code on your host machine:

1. **Start containers**: `docker compose up dev -d`
2. **Open Command Palette**: `Ctrl+Shift+P`
3. **Select**: `Dev Containers: Attach to Running Container`
4. **Choose**: `kcp-dev`

### Method 3: Tasks Integration

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Docker: Start Dev",
      "type": "shell",
      "command": "docker compose up dev",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Docker: Run Unit Tests",
      "type": "shell",
      "command": "docker compose run --rm test-unit",
      "group": "test"
    },
    {
      "label": "Docker: Build Production",
      "type": "shell",
      "command": "docker compose build prod",
      "group": "build"
    }
  ]
}
```

---

## Testing

### Unit Tests

```powershell
# Run unit tests once
docker compose run --rm test-unit

# Run with watch mode (interactive)
docker compose --profile test up test-unit-watch

# Access Vitest UI at http://localhost:51204
```

### E2E Tests with Playwright

```powershell
# Start dev server first
docker compose up dev -d

# Run E2E tests
docker compose --profile test run --rm test-e2e

# View test reports
# Reports are saved to: ./tests/e2e/reports/
```

### Full CI Pipeline

```powershell
# Run complete CI (lint + build + unit tests)
docker compose --profile ci run --rm ci
```

---

## Production Build

### Build and Test Production Image

```powershell
# Build production image
docker compose build prod

# Run production container
docker compose up prod -d

# Test at http://localhost:8080

# Stop production container
docker compose stop prod
```

### Manual Docker Build

```powershell
# Build with custom tag
docker build -t kingdom-clash-planner:latest .

# Run standalone
docker run -d -p 8080:80 --name kcp kingdom-clash-planner:latest

# Stop and remove
docker stop kcp && docker rm kcp
```

---

## Rancher Desktop Configuration

### Recommended Settings

Open Rancher Desktop → Preferences:

#### Container Engine
- **Engine**: dockerd (moby)
- **Enable Traefik**: Optional (not needed for this project)

#### Virtual Machine (Windows/macOS)
- **Memory**: 4 GB minimum, 8 GB recommended
- **CPUs**: 2 minimum, 4 recommended

#### WSL Integration (Windows)
- **Enable**: WSL Integration
- **Distros**: Select your preferred distro (e.g., Ubuntu)

### Using nerdctl (Alternative)

Rancher Desktop also supports `nerdctl` as a Docker CLI alternative:

```powershell
# Check nerdctl
nerdctl --version

# Use nerdctl compose
nerdctl compose up dev
```

### Kubernetes (Optional)

If you want to deploy to local Kubernetes:

```powershell
# Enable Kubernetes in Rancher Desktop
# Preferences → Kubernetes → Enable

# Deploy using kubectl
kubectl apply -f k8s/deployment.yaml
```

---

## Troubleshooting

### Common Issues

#### Port 3000 Already in Use

```powershell
# Find process using port
netstat -ano | findstr :3000

# Or use different port
docker compose up dev -e VITE_PORT=3001
```

#### Container Build Fails

```powershell
# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up dev
```

#### File Changes Not Detected (Hot Reload)

The `CHOKIDAR_USEPOLLING=true` environment variable is set in docker-compose.yml.
If issues persist:

```powershell
# Restart dev container
docker compose restart dev
```

#### Permission Issues (Linux/WSL)

```bash
# Fix ownership
sudo chown -R $(whoami):$(whoami) .

# Or run with user flag
docker compose run --user $(id -u):$(id -g) dev
```

#### Slow Performance on Windows

1. Ensure project is in WSL filesystem (e.g., `\\wsl$\Ubuntu\home\...`)
2. Use Rancher Desktop's WSL integration
3. Avoid mounting from Windows filesystem (`C:\`)

### Cleanup Commands

```powershell
# Remove all project containers
docker compose down -v

# Remove dangling images
docker image prune

# Full cleanup (removes all unused data)
docker system prune -a
```

### Logs and Debugging

```powershell
# View container logs
docker compose logs dev

# Follow logs in real-time
docker compose logs -f dev

# Shell into running container
docker compose exec dev sh

# Check container status
docker compose ps
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Host Machine                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Rancher Desktop                         ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │              Docker Compose Network                 │││
│  │  │                                                     │││
│  │  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │││
│  │  │  │   dev    │  │   prod   │  │    test-unit    │  │││
│  │  │  │  :3000   │  │  :8080   │  │   (on-demand)   │  │││
│  │  │  │  Vite    │  │  nginx   │  │    Vitest       │  │││
│  │  │  └──────────┘  └──────────┘  └─────────────────┘  │││
│  │  │                                                     │││
│  │  │  ┌──────────────────┐  ┌───────────────────────┐  │││
│  │  │  │     test-e2e     │  │         ci            │  │││
│  │  │  │   Playwright     │  │   lint+build+test     │  │││
│  │  │  └──────────────────┘  └───────────────────────┘  │││
│  │  │                                                     │││
│  │  │  ┌────────────────────────────────────────────────┐│││
│  │  │  │              Shared Volumes                    ││││
│  │  │  │  • node_modules (cached)                       ││││
│  │  │  │  • pnpm_store (cached)                         ││││
│  │  │  │  • Source code (bind mount)                    ││││
│  │  │  └────────────────────────────────────────────────┘│││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   VS Code                                ││
│  │  • Dev Containers Extension                              ││
│  │  • Attach to running container                           ││
│  │  • Forward ports automatically                           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
kingdom-clash-planner/
├── .devcontainer/
│   ├── devcontainer.json           # VS Code Dev Container config
│   └── docker-compose.devcontainer.yml  # Dev Container overrides
├── docker-compose.yml              # Main compose file
├── Dockerfile                      # Production multi-stage build
├── Dockerfile.dev                  # Development container
├── nginx.conf                      # Production nginx config
└── doc/
    └── DOCKER_DEVELOPMENT.md       # This file
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start dev server | `docker compose up dev` |
| Stop all | `docker compose down` |
| Run unit tests | `docker compose run --rm test-unit` |
| Run E2E tests | `docker compose --profile test up test-e2e` |
| Build production | `docker compose build prod` |
| Run production | `docker compose up prod` |
| View logs | `docker compose logs -f dev` |
| Shell access | `docker compose exec dev sh` |
| Clean rebuild | `docker compose down -v && docker compose build --no-cache` |
| Open in VS Code Dev Container | `Ctrl+Shift+P` → "Reopen in Container" |
