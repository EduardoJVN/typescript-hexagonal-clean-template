# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Enforcement

These rules are non-negotiable. Follow them exactly as written.

- **If a requirement doesn't fit the patterns in this file, STOP and ask before creating anything.**
- **Do not invent file structures, layers, or patterns not described here.** No "helpers", no "utils", no "services" outside the documented structure.
- **Do not create a file without its corresponding test.** Implementation and spec are delivered together.
- **Do not skip steps in the Module Creation Playbook.** Every step is required.
- Every task is complete only when: the code compiles, `yarn test` passes, and `yarn test:coverage` shows no uncovered branches in the modified files.

---

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

**One use case = one file = one class = one `execute()` method.** No exceptions.

```
src/application/user/use-cases/
  create-user.use-case.ts      ← CreateUserUseCase
  get-user.use-case.ts         ← GetUserUseCase
  delete-user.use-case.ts      ← DeleteUserUseCase
```

```typescript
// ✅ Correct structure for every use case
export class CreateUserUseCase {
  constructor(
    private readonly repo: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> { ... }
}
```

Never group multiple operations in one class. Never add methods other than `execute`.

**Dependency injection:** All dependencies are injected via constructor. Use cases receive ports (interfaces), never concrete adapters directly.

**Commit messages:** Conventional Commits enforced by commitlint. Allowed prefixes: `feat`, `fix`, `chore`, `docs`, `test`, `style`, `refactor`, `perf`.

## Module Creation Playbook

When adding a new feature, create files in this order — domain first, infrastructure last.

```
1. src/domain/{module}/ports/{name}.port.ts              ← interface (driven port)
2. src/domain/{module}/entities/{name}.entity.ts         ← entity (if needed)
3. src/domain/{module}/errors/{name}.error.ts            ← domain errors
4. src/application/{module}/dto/{action}-{module}.dto.ts ← Command + Result interfaces
5. src/application/{module}/use-cases/{action}.use-case.ts
6. src/infrastructure/adapters/{name}.adapter.ts         ← implements the port
7. src/infrastructure/entry-points/{name}.controller.ts  ← extends BaseController
8. Wire in app.ts                                        ← instantiate + inject
```

**Tests are mandatory and created at the same time as the implementation — never after.**

Each file has exactly one spec file, co-located in a `__test__/` folder **inside the same directory**. This applies to every module and every layer without exception:

```
src/application/{module}/use-cases/
  {action}.use-case.ts
  __test__/
    {action}.use-case.spec.ts

src/domain/{module}/entities/
  {name}.entity.ts
  __test__/
    {name}.entity.spec.ts

src/infrastructure/adapters/
  {name}.adapter.ts
  __test__/
    {name}.adapter.spec.ts
```

Every spec MUST cover:
1. **Happy path** — successful execution with valid input
2. **Every domain error** the use case can throw
3. **Every port failure** (repository throws, external service fails)
4. **Every input edge case** that triggers different branching

The goal is **100% branch coverage** on the use case file. Running `yarn test:coverage` must show no uncovered branches in `application/`. If there are uncovered branches, the implementation is not done.

## Entity Pattern

Entities use a **private constructor** and two static factories. **ID is always received as a parameter** — who generates it (use case, adapter, or database) is an infrastructure decision.

```typescript
// src/domain/{module}/entities/{name}.entity.ts
export class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public price: number,
  ) {}

  // For NEW entities — enforce business invariants, emit domain events if needed
  static create(id: string, name: string, price: number): Product {
    if (price <= 0) throw new InvalidPriceError(price);
    return new Product(id, name, price);
  }

  // For LOADING from persistence — no validation, no events, just reconstruct state
  static reconstitute(id: string, name: string, price: number): Product {
    return new Product(id, name, price);
  }

  // Mutations modify state in place and validate invariants
  updatePrice(price: number): void {
    if (price <= 0) throw new InvalidPriceError(price);
    this.price = price;
  }
}
```

Adapters use `reconstitute()` when mapping DB rows to entities. Use cases use `create()` for new entities.

## DTOs

Each use case has a corresponding DTO file in a `dto/` folder **inside the same module**, named `{action}-{module}.dto.ts`. DTOs are plain TypeScript interfaces — no Zod, no classes.

```
src/application/{module}/
  use-cases/
    create-{module}.use-case.ts
    __test__/
      create-{module}.use-case.spec.ts
  dto/
    create-{module}.dto.ts
    get-{module}.dto.ts
    update-{module}.dto.ts
```

```typescript
// src/application/product/dto/create-product.dto.ts
export interface CreateProductCommand {
  id: string;
  name: string;
  price: number;
}

export interface CreateProductResult {
  id: string;
  name: string;
  price: number;
}
```

Use cases return **plain objects** matching the Result interface — never entity instances.

## Repository Port Contract

Every repository port exposes these five methods as the CRUD baseline. `save()` is for create, `update()` is for update — never merged into a single upsert.

```typescript
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  save(entity: Product): Promise<void>;
  update(entity: Product): Promise<void>;
  delete(id: string): Promise<void>;
}
```

Never add query-specific methods to the port. If a query doesn't fit `findAll`, create a dedicated read model or a separate query port.

## Central Error Handler

Controllers do **not** handle errors individually. All controllers extend `BaseController`, which provides a single `handleRequest()` wrapper that catches and maps all throws.

```typescript
// src/infrastructure/entry-points/base.controller.ts
export abstract class BaseController {
  protected async handleRequest<T>(
    action: () => Promise<T>,
    onSuccess: (result: T) => void,
    onError: (error: unknown) => void,
  ): Promise<void> {
    try {
      const result = await action();
      onSuccess(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        onError({ status: 404, message: error.message });
      } else if (error instanceof DomainError) {
        onError({ status: 400, message: error.message });
      } else {
        onError({ status: 500, message: 'Internal server error' });
      }
    }
  }
}
```

```typescript
// Express adapter
export class CreateProductController extends BaseController {
  async handle(req: Request, res: Response): Promise<void> {
    await this.handleRequest(
      () => this.useCase.execute(ProductSchema.parse(req.body)),
      (result) => res.status(201).json(result),
      (err: any) => res.status(err.status).json({ error: err.message }),
    );
  }
}
```

`BaseController` lives in `src/infrastructure/entry-points/`. Swapping to Lambda means overriding only the `onSuccess`/`onError` callbacks — error classification logic stays in one place.

## Validation

**Zod belongs ONLY in infrastructure/entry-points.** Never in domain or application.

```typescript
// ✅ infrastructure/entry-points/create-user.controller.ts
const schema = z.object({ email: z.string().email(), name: z.string().min(1) });
const input = schema.parse(rawBody);
await createUserUseCase.execute(input);

// ❌ Never validate with Zod in a use case or entity
```

The use case receives already-validated plain objects. Entities enforce business invariants by throwing domain errors, not by parsing schemas.

## Shared

`src/shared/` contains cross-cutting base classes used by all modules. **Do not add anything here that is specific to a single module.**

```
src/shared/
  errors/
    domain.error.ts       ← abstract base for all domain errors
    not-found.error.ts    ← base for all "entity not found" errors
```

These are the only two files that belong in `shared/errors/` at this stage. Every module-specific error extends one of them.

## Domain Errors

Two base classes in `shared/`, module-specific errors extend them. Never `throw new Error()`.

```typescript
// src/shared/errors/domain.error.ts  ← base for all domain errors (maps to HTTP 400)
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// src/shared/errors/not-found.error.ts  ← base for not-found errors (maps to HTTP 404)
export abstract class NotFoundError extends DomainError {}

// src/domain/{module}/errors/{entity}-not-found.error.ts
export class UserNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`User not found: ${id}`);
  }
}

// src/domain/{module}/errors/{rule-violation}.error.ts
export class InvalidPriceError extends DomainError {
  constructor(price: number) {
    super(`Price must be greater than 0, got ${price}`);
  }
}
```

`BaseController` maps the hierarchy automatically: `NotFoundError → 404`, any other `DomainError → 400`, anything else `→ 500`.

## Anti-Patterns

| Never do this | Why |
|---|---|
| Import `express`, `aws-lambda`, or any HTTP lib outside `infrastructure/entry-points/` | Couples business logic to a protocol |
| Import a repository adapter directly in a use case | Breaks DI — use the port interface |
| Use `vi.fn()` to mock a port | Doesn't enforce the interface contract |
| Call `console.log` in domain or application | Inject `ILogger` instead |
| Put Zod schemas in domain or application | Validation is an infrastructure concern |
| Throw `new Error()` from domain | Use a typed `DomainError` subclass |
| Add business logic to a controller | Controllers only translate, never decide |
| Access `process.env` outside `infrastructure/config/` | Centralizes env coupling |
| Use `create()` in adapters when loading from DB | Use `reconstitute()` — `create()` is for new entities only |
| Generate IDs inside the entity | ID source is an infrastructure decision, pass it as parameter |
| Merge `save()` and `update()` into a single upsert | `save()` = insert, `update()` = update — keep intent explicit |
| Handle errors in individual controllers | Extend `BaseController` and use `handleRequest()` |

## Testing Patterns

**Pyramid:** many unit tests (domain + application) → some integration tests (adapters) → few E2E.

### Domain layer — no mocks needed
The domain has zero external dependencies. Instantiate directly and assert behavior.

```typescript
import { describe, it, expect } from 'vitest';

describe('Order', () => {
  it('throws when adding item to a cancelled order', () => {
    const order = Order.create(CustomerId.from('cust-1'));
    order.cancel('test');

    expect(() => order.addItem(...)).toThrow(InvalidOrderStateError);
  });
});
```

### Application layer — mock ports as classes
Never use `vi.fn()` for ports. Implement the port interface as a class — this catches type mismatches and keeps mocks readable.

```typescript
// In the same spec file or a shared helpers/ file
class MockOrderRepository implements IOrderRepository {
  savedOrders: Order[] = [];

  async findById(id: OrderId): Promise<Order | null> {
    return this.savedOrders.find(o => o.id.equals(id)) ?? null;
  }

  async save(order: Order): Promise<void> {
    this.savedOrders.push(order);
  }
}

describe('PlaceOrderUseCase', () => {
  let useCase: PlaceOrderUseCase;
  let repo: MockOrderRepository;

  beforeEach(() => {
    repo = new MockOrderRepository();
    useCase = new PlaceOrderUseCase(repo, new MockLogger());
  });

  it('saves the order', async () => {
    await useCase.execute({ customerId: 'cust-1', ... });
    expect(repo.savedOrders).toHaveLength(1);
  });
});
```

### Key rules
- **Mock only at port boundaries** — never mock domain classes or value objects
- **Integration tests** test concrete adapters (Pino, DB, HTTP) with real infrastructure
- **Builders** for complex test fixtures: `new OrderBuilder().withItem('p1', 2).confirmed().build()`
- Test files live co-located in `__test__/` next to the module they test, or at `src/__test__/` for cross-cutting smoke tests

---

## Tooling Notes

- **Runtime:** Node.js 24 ESM native — use `import/export`, never `require()`
- **TypeScript:** `strict: true`, `verbatimModuleSyntax: true` + `isolatedModules: true` — cualquier import que sea solo un tipo **debe** usar `import type { Foo } from '...'`, nunca `import { Foo }`
- **ESLint:** Flat config (`eslint.config.js`) — `no-empty-interface` is OFF (domain ports use empty interfaces as markers)
- **esbuild:** Custom `scripts/build.js` handles path alias resolution for production bundle
- **Pre-commit hook:** Runs ESLint fix + Prettier + tests on staged `.ts` files automatically
- **Logger:** Always inject `ILogger` via constructor — never import Pino directly in domain/application layers
