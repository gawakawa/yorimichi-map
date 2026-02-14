# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
uv sync --all-groups      # Install all dependencies
uv run python manage.py runserver  # Start dev server (localhost:8000)
uv run pytest -v          # Run all tests
uv run pytest tests/test_views.py -v  # Run a single test file
uv run pytest tests/test_views.py::TestChatEndpoint::test_chat_success -v  # Run a single test
uv run pytest -m integration  # Run integration tests (requires API keys)
uv run ruff check         # Run linter
uv run ty check           # Run type checker
nix fmt                   # Format code
nix fmt -- --ci           # Check formatting (CI mode)
```

API docs available at `/api/docs/` (Swagger UI) when dev server is running.

## Architecture

### Overview

- Django 6 + Django REST Framework with drf-spectacular for OpenAPI
- Vertex AI Gemini 2.5 Pro for AI-powered drive concierge
- Google Maps APIs (Places API, Routes API) for location/route services
- Python dependencies managed via uv with uv2nix for Nix integration
- SQLite database (development), gunicorn for production

### Request Flow

```
Frontend → views.py → gemini.py (Automatic Function Calling)
                          ↓
              google_maps.py (search_places / calculate_route)
                          ↓
              deep_link.py (Google Maps URL generation)
```

### Service Layer (`navigation/services/`)

- `gemini.py` - Vertex AI Gemini integration with Automatic Function Calling
  - Gemini automatically invokes `search_places` / `calculate_route` based on user intent
  - Conversation history is maintained per request (frontend sends full history)
- `google_maps.py` - Google Maps Places API (New) and Routes API v2 clients
- `deep_link.py` - Generates Google Maps app deep links for navigation

### Key Concepts

**Automatic Function Calling**: Gemini decides when to call `search_places` or `calculate_route` based on user messages. The SDK automatically executes the Python functions and returns results to Gemini for summarization.

**Authentication**:
- Google Maps APIs: API key via `MAPS_API_KEY` environment variable
- Vertex AI: Application Default Credentials (`gcloud auth application-default login`)

## Environment Variables

```bash
# Required for API calls
MAPS_API_KEY=...              # Google Maps API key
# Vertex AI uses ADC (no env var needed, run gcloud auth)

# Optional configuration
DJANGO_SECRET_KEY=...         # Required in production
DJANGO_DEBUG=True             # Set to False in production
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
PLACES_MIN_RATING=4.0         # Minimum rating for place results
PLACES_MAX_RESULTS=3          # Max places returned
GEMINI_MAX_HISTORY_LENGTH=10  # Max conversation history turns
GEMINI_MAX_FUNCTION_CALLS=5   # Max function calls per request
```

## API Endpoints

- `GET /api/health/` - Health check
- `POST /api/navigation/chat/` - AI chat with automatic route/place search
- `POST /api/navigation/return-route/` - Generate return route (swap origin/destination)
- `GET /api/schema/` - OpenAPI schema
- `GET /api/docs/` - Swagger UI documentation

## Testing

Tests use pytest with Django test client. External APIs are mocked:

```python
@patch("navigation.views.send_message")  # Mock Gemini
@patch("navigation.views.calculate_route")  # Mock Routes API
```

Integration tests (marked with `@pytest.mark.integration`) require real API keys and are skipped in CI.

## Containerization

```bash
# Backend container (gunicorn on port 8000)
nix build .#container
# Copy to Docker: nix run .#container.copyToDockerDaemon
```
