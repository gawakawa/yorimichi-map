# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

寄り道マップ (Yorimichi Map) - A route search application that includes detour/scenic spots.

## Repository Structure

Monorepo with three main components, each with its own Nix flake:

- `frontend/` - React 19 + Vite frontend (Node.js 24, pnpm)
- `backend/` - Django 6 REST API (Python 3.13, uv)
- `terraform/` - Infrastructure as Code (OpenTofu)

Directory-specific rules (commands, architecture, code style) are in:

- `.claude/rules/frontend/` - Frontend rules
- `.claude/rules/backend/` - Backend rules
- `.claude/rules/terraform/` - Terraform rules

Do not duplicate them here.

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

Use `direnv exec` instead of `nix develop` to run commands.

## Code Style

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

GitHub Actions 統合 CI ワークフロー (`ci.yml`):

- `detect-changes` - 変更されたコンポーネントを検知
- `root-check` - root flake check
- `frontend-check` - format, lint, test, container build, deploy (main only)
- `backend-check` - format, lint, test, container build, deploy (main only)
- `terraform-check` - flake check
- `ci-success` - branch protection 用の集約ゲート
