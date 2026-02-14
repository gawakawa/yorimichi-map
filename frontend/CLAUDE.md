# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (localhost:5173)
pnpm build                # Build for production
pnpm test                 # Run all tests
pnpm test tests/foo.test.ts   # Run single test file
pnpm lint                 # Lint with oxlint (type-aware)
nix fmt                   # Format code (oxfmt)
```

## Architecture

Two-panel chat-based route search application:

```plaintext
App.tsx (state: origin, destination, route)
├── ChatPanel (left) - handles chat UI & API calls
│   ├── RouteInputForm - origin/destination inputs + search button
│   ├── MessageList - chat message history
│   └── ChatInput - message input
└── MapPanel (right) - displays route on Leaflet map
    └── RouteMap - renders polyline from encoded_polyline
```

### Data Flow

1. User enters origin/destination in `RouteInputForm` → state lifted to `App`
2. User clicks search → `ChatPanel` calls `chatNavigationAPI.getReturnRoute()`
3. API returns `Route` with `encoded_polyline` → passed to `MapPanel`
4. `RouteMap` decodes polyline via `@googlemaps/polyline-codec` → renders on Leaflet

Chat flow is similar: user message → `chatNavigationAPI.sendMessage()` with history → response may include route

### API Layer

`src/api/navigation.ts` exports `chatNavigationAPI` with two endpoints:

- `sendMessage(message, history)` → chat-based navigation
- `getReturnRoute({origin, destination, waypoints})` → direct route search

Backend expected at `VITE_API_BASE_URL` (default: `http://localhost:8000`).

### Testing

Vitest with jsdom and @testing-library/react. Tests in `tests/` directory.
Setup file `tests/setup.ts` includes jest-dom matchers and auto-cleanup.
