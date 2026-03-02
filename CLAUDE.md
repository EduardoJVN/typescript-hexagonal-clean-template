# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev              # Development with hot-reload (tsx watch)
yarn build            # Production bundle via esbuild → dist/
yarn test             # Run all tests once (CI mode)
yarn test:watch       # Interactive watch mode
yarn test:coverage    # Coverage report (v8, HTML + JSON + text)
yarn lint             # ESLint with auto-fix
yarn format           # Prettier formatting
```

Run a single test file:
```bash
yarn test:watch <filename-pattern>   # e.g., yarn test:watch analyze-comment
```

## Architecture

Hexagonal + DDD with **Vertical Slicing** per module inside each layer. Dependency flow is strictly inward: `infrastructure → application → domain`. The domain layer has zero external dependencies.

```
src/
├── domain/            # Pure business logic — entities, port interfaces only
│   └── {module}/
│       ├── entities/
│       └── ports/     # TypeScript interfaces (contracts for adapters)
├── application/       # Use cases — orchestrate domain + injected ports
│   └── {module}/
│       └── use-cases/
├── infrastructure/    # Concrete implementations of ports
│   ├── adapters/      # DB, email, Pino logger, etc.
│   ├── entry-points/  # HTTP controllers, CLI commands
│   └── config/        # env vars, bootstrap helpers
├── shared/            # Cross-cutting utilities
└── app.ts             # Dependency composition root (bootstrap)
```

**app.ts is the composition root.** All dependencies are instantiated and injected here — no service locators, no singletons in domain/application.

## Key Conventions

**Path aliases** — always use these, never relative `../../` imports:
- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infra/*` → `src/infrastructure/*`
- `@shared/*` → `src/shared/*`

**File naming:**
- Port interfaces: `*.port.ts`
- Adapters (port implementations): `*.adapter.ts`
- Use cases: `*.use-case.ts`
- Tests: `*.spec.ts`

**Dependency injection:** All dependencies are injected via constructor. Use cases receive ports (interfaces), never concrete adapters directly.

**Commit messages:** Conventional Commits enforced by commitlint. Allowed prefixes: `feat`, `fix`, `chore`, `docs`, `test`, `style`, `refactor`, `perf`.

## Tooling Notes

- **Runtime:** Node.js 24 ESM native — use `import/export`, never `require()`
- **TypeScript:** `strict: true`, `verbatimModuleSyntax: true` + `isolatedModules: true` — cualquier import que sea solo un tipo **debe** usar `import type { Foo } from '...'`, nunca `import { Foo }`
- **ESLint:** Flat config (`eslint.config.js`) — `no-empty-interface` is OFF (domain ports use empty interfaces as markers)
- **esbuild:** Custom `scripts/build.js` handles path alias resolution for production bundle
- **Pre-commit hook:** Runs ESLint fix + Prettier + tests on staged `.ts` files automatically
- **Logger:** Always inject `ILogger` via constructor — never import Pino directly in domain/application layers
