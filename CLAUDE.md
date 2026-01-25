# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

寄り道マップ (Yorimichi Map) - A route search application that includes detour/scenic spots.

## Repository Structure

Monorepo with three main components, each with its own Nix flake:

- `frontend/` - React 19 + Vite frontend (Node.js 24, pnpm)
- `backend/` - Django 6 REST API (Python 3.13, uv)
- `terraform/` - Infrastructure as Code (OpenTofu)

## Development Setup

Requires Nix with flakes enabled.

```bash
# Root directory (for pre-commit hooks)
direnv allow

# Each subdirectory
cd frontend && direnv allow
cd backend && direnv allow
cd terraform && direnv allow
```

This auto-loads the development environment and generates `.mcp.json` for MCP integration.

## Commands

### Frontend (`frontend/`)

```bash
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (localhost:5173)
pnpm build                # Build for production
pnpm test                 # Run all tests (Vitest)
pnpm test path/to/file    # Run a single test file
pnpm lint                 # Run linter (oxlint with type-aware checks)
nix fmt                   # Format code
nix fmt -- --ci           # Check formatting (CI mode)
```

### Backend (`backend/`)

```bash
uv sync --all-groups      # Install all dependencies
uv run python manage.py runserver  # Start dev server (localhost:8000)
uv run pytest -v          # Run all tests
uv run pytest path/to/file.py -v  # Run a single test file
uv run ruff check         # Run linter
uv run ty check           # Run type checker
nix fmt                   # Format code
nix fmt -- --ci           # Check formatting (CI mode)
```

API docs available at `/api/docs/` (Swagger UI) when dev server is running.

### Terraform (`terraform/`)

```bash
tofu init           # Initialize
tofu plan           # Plan changes
tofu apply          # Apply changes
```

## Architecture

### Frontend

- React 19 with React Compiler (via babel-plugin-react-compiler)
- Vite bundler (using rolldown-vite)
- TanStack Query for data fetching
- Formatter: oxfmt (tabs, single quotes)

### Backend

- Django REST Framework with drf-spectacular for OpenAPI
- Python dependencies managed via uv with uv2nix for Nix integration
- CORS configured for frontend dev server (localhost:5173)
- SQLite database (development), gunicorn for production

## Containerization

Containers are built with nix2container:

```bash
# Frontend container (nginx on port 8080)
cd frontend && nix build .#container
# Copy to Docker: nix run .#container.copyToDockerDaemon

# Backend container (gunicorn on port 8000)
cd backend && nix build .#container
# Copy to Docker: nix run .#container.copyToDockerDaemon
```

## API Endpoints

- `GET /api/health/` - Health check
- `GET /api/schema/` - OpenAPI schema
- `GET /api/docs/` - Swagger UI documentation

## Code Style

### TypeScript (Frontend)

- Formatter: oxfmt (tabs, single quotes)
- Linter: oxlint with type-aware checks
- TypeScript strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`

### Python (Backend)

- Formatter: ruff-format
- Linter: ruff
- Type checker: ty (excludes Django-generated files)

### Nix

- Formatter: nixfmt

## Pre-commit Hooks

Automatically enforced via git-hooks-nix:

- treefmt (formatting for all file types)
- statix, deadnix (Nix linting)
- actionlint (GitHub Actions validation)
- ruff, ty (Python, backend only)
- oxlint (TypeScript, frontend only)

## Commit and PR Convention

Use the `/commit` skill which:

- Requires gitmoji prefix (e.g., `:sparkles:`, `:bug:`, `:wrench:`)
- Commit messages in Japanese
- Never uses `git add -A` or `git add .` - always explicit file selection

Use the `/pr` skill to create pull requests with Japanese descriptions.

## CI/CD

GitHub Actions workflows run Nix-based checks:

- `nix-ci.yml` - root flake check
- `frontend-ci.yml` - format, lint, test
- `backend-ci.yml` - format, lint, test
- `terraform-ci.yml` - flake check
