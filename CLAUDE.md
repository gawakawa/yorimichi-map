# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

寄り道マップ (Yorimichi Map) - A route search application that includes detour/scenic spots.

## Repository Structure

Monorepo with three main components, each with its own Nix flake:
- `frontend/` - TypeScript/React frontend (Node.js 24, pnpm)
- `backend/` - Python backend (Python 3.12, uv)
- `terraform/` - Infrastructure as Code (OpenTofu)

## Development Setup

Requires Nix with flakes enabled. In each subdirectory:
```bash
direnv allow
```
This auto-loads the development environment and generates `.mcp.json` for MCP integration.

## Commands

### Frontend (`frontend/`)
```bash
pnpm install        # Install dependencies
pnpm test           # Run tests (Vitest)
pnpm lint           # Run linter (oxlint with type-aware checks)
```

### Backend (`backend/`)
```bash
uv sync             # Install dependencies
uv run pytest -v    # Run tests
uv run ruff check   # Run linter
```

### Terraform (`terraform/`)
```bash
tofu init           # Initialize
tofu plan           # Plan changes
tofu apply          # Apply changes
```

## Code Style

### TypeScript (Frontend)
- Formatter: Biome (tabs, single quotes)
- Linter: oxlint with type-aware checks
- TypeScript strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`

### Python (Backend)
- Formatter: ruff-format
- Linter: ruff

### Nix
- Formatter: nixfmt

## Pre-commit Hooks

Automatically enforced via git-hooks-nix:
- treefmt (formatting for all file types)
- statix, deadnix (Nix linting)
- actionlint (GitHub Actions validation)
- ruff (Python, backend only)

## Commit Convention

Use the `/commit` skill which:
- Requires gitmoji prefix (e.g., `:sparkles:`, `:bug:`, `:wrench:`)
- Commit messages in Japanese
- Never uses `git add -A` or `git add .` - always explicit file selection

## CI/CD

GitHub Actions workflows run Nix-based checks:
- `frontend-ci.yml` - format, lint, test
- `backend-ci.yml` - format, lint, test
- `terraform-ci.yml` - flake check
