---
paths:
  - "backend/**/*"
---

# Backend Rules

## Commands

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

## Architecture

- Django REST Framework with drf-spectacular for OpenAPI
- Python dependencies managed via uv with uv2nix for Nix integration
- CORS configured for frontend dev server (localhost:5173)
- SQLite database (development), gunicorn for production

## Code Style

- Formatter: ruff-format
- Linter: ruff
- Type checker: ty (excludes Django-generated files)

## API Endpoints

- `GET /api/health/` - Health check
- `GET /api/schema/` - OpenAPI schema
- `GET /api/docs/` - Swagger UI documentation

## Containerization

```bash
# Backend container (gunicorn on port 8000)
nix build .#container
# Copy to Docker: nix run .#container.copyToDockerDaemon
```
