---
paths:
  - "frontend/**/*"
---

# Frontend Rules

## Commands

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

## Architecture

- React 19 with React Compiler (via babel-plugin-react-compiler)
- Vite bundler (using rolldown-vite)
- TanStack Query for data fetching
- Formatter: oxfmt (spaces, single quotes)

## Code Style

- Formatter: oxfmt (spaces, single quotes)
- Linter: oxlint with type-aware checks
- TypeScript strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- Do not use `useMemo` or `useCallback` — React Compiler handles memoization automatically

## Containerization

```bash
# Frontend container (nginx on port 8080)
nix build .#container
# Copy to Docker: nix run .#container.copyToDockerDaemon
```
