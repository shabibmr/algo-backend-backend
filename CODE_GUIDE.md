# algoERP Backend — Code Guide & Engineering Standards

> How code in this backend **must** be written. These are not suggestions — they are the
> conventions every module follows so the codebase stays uniform, reviewable, and safe.
> The patterns below are extracted from the existing foundation code (`src/core/**`,
> `src/modules/organization/**`, `src/modules/accounts/**`). New modules must match them.
>
> Read alongside: `BACKEND_CONTEXT.md` (domain rules), `IMPLEMENTATION_PLAN.md`
> (architecture), `ENUMS.md` (closed value sets), `TASKS.md` (work list).

---

## 1. Architectural Principles

1. **Layered, one-direction dependency.**
   `routes → controller → service → repository → Prisma`.
   - **Controllers** do HTTP only (parse `req`, call a service, shape the `ApiResponse`, `next(err)`).
   - **Services** hold all business logic, transactions, invariants, cross-entity orchestration. They never touch `req`/`res`.
   - **Repositories** do data access only. They extend `BaseRepository` and never contain business rules.
   - **Never** call Prisma from a controller, and **never** import `express` types into a service.

2. **The module is the unit.** Each domain module is a folder under `src/modules/<module>/`
   with these files:
   ```
   <module>.enums.ts        # (in enums.ts) closed value sets for this module
   <module>.schema.ts       # Zod request schemas
   <module>.repository.ts   # one Repository class per table
   <module>.service.ts      # one Service object, sectioned per entity
   <module>.controller.ts   # one Controller object, sectioned per entity
   <module>.routes.ts       # the Router
   ```
   Multiple sibling entities share these files, each in its own
   `// ── EntityName ──` banner section (see `organization.service.ts`).

3. **Fail loud, fail typed.** Every expected failure throws a typed `AppError`
   (`NotFoundError`, `ConflictError`, `ValidationError`, `ForbiddenError`,
   `UnauthorizedError`, `BadRequestError`). Never `throw new Error('...')` for an
   operational condition; never return `null`/`{error}` ad-hoc from a service.

4. **The DB schema is a contract.** Tables/columns are owned by the existing system.
   Match exact names via Prisma `@@map`/`@map`. **No migrations** are run from this app.

5. **Money & quantities are exact.** Use `Prisma.Decimal` and the helpers in
   `core/utils/decimal.ts`. Never do arithmetic on monetary values with JS `number`.

---

## 2. The Shared Kernel (use it — don't reinvent)

| Concern | Where | How you use it |
|---|---|---|
| Data access | `core/repository/BaseRepository.ts` | Extend it per table. Gives soft-delete, audit injection, pagination, `tx` passthrough. |
| Errors | `core/errors/AppError.ts` | Throw the typed subclasses from services. |
| Error→HTTP | `core/middleware/errorHandler.ts` | Already wired globally. Converts `AppError`/`ZodError`, logs, writes `error_reporting` for 5xx. **You never format error responses yourself.** |
| Validation | `core/middleware/validate.ts` + Zod | Attach `validate(schema)` in routes. Invalid input becomes a `ValidationError` automatically. |
| AuthN | `core/middleware/authenticate.ts` | `router.use(authenticate)` at the top of every module router. |
| AuthZ (RBAC) | `core/middleware/authorize.ts` | `authorize('ModuleName', 'create'|'read'|'update'|'delete'|'share')` per route. |
| Tenant context | `core/middleware/tenantContext.ts` | `req.user.companyId` / `branchId`. Scope queries only where the column exists. |
| Logging | `core/utils/logger.ts` (pino) | `logger.info/warn/error({...})`. Structured objects, not string concatenation. |
| Audit trail | `core/audit/auditService.ts` | `auditService.log(action, status, data, userId, tx?)` after meaningful mutations. |
| Response shape | `core/types/index.ts` (`ApiResponse<T>`, `Paginated<T>`) | Wrap every controller response. |
| Config flags | `core/services/ConfigSettingService.ts` | Read `VAT_RATE`, `FINANCIAL_YEAR`, etc. — never hard-code. |

---

## 3. Worked Example — the `Brand` master (inventory)

A minimal master that exercises every universal pattern: validation, RBAC, soft delete,
audit injection, unique-constraint conflict handling, pagination, structured errors, and
logging. Table: `brands` (columns: `brand_name` unique, `brand_code` unique, `narration`,
`is_active`, audit columns).

> In this codebase `Brand` actually lives inside the shared `modules/inventory/` files
> alongside UOM/Category/TaxCategories, each under its own `// ── Brand ──` section. The
> files below show it in isolation for teaching; replicate the **sections**, not
> necessarily separate files.

### 3.1 `brand.schema.ts` — input contract (Zod)

```ts
import { z } from 'zod';

// Every schema wraps body / query / params keys — `validate` parses all three.
export const createBrandSchema = z.object({
  body: z.object({
    brand_name: z.string().min(1, 'Brand name is required').max(200),
    brand_code: z.string().max(50).optional(),
    narration: z.string().max(500).optional(),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    brand_name: z.string().min(1).max(200).optional(),
    brand_code: z.string().max(50).optional(),
    narration: z.string().max(500).optional(),
    is_active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'id must be numeric'),
  }),
});

export const listBrandSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    includeInactive: z.coerce.boolean().optional(),
  }),
});
```

**Rules:** validation lives only here. Services assume input is already shape-valid and
focus on *business* rules (existence, uniqueness, invariants). Use `z.coerce` for query
strings. Bound every string with `.max()` to match the column width.

### 3.2 `brand.repository.ts` — data access

```ts
import { BaseRepository } from '../../core/repository/BaseRepository';
import { brands } from '@prisma/client';

export class BrandRepository extends BaseRepository<brands> {
  constructor() {
    super({
      modelName: 'brands',          // exact Prisma delegate key
      primaryKeyField: 'id',
      softDeleteField: 'is_active', // null disables soft-delete for this table
      auditFieldMap: {
        addedBy: 'added_by',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',  // ← set to the table's REAL column (check schema.prisma)
      },
    });
  }
}
```

**Rules:** repositories are thin. No business logic, no logging, no throwing typed errors.
Add a bespoke query method here only if it's pure data access (e.g. a complex join);
otherwise use the inherited `findById/findFirst/findMany/create/update/delete/count`.
Always configure `auditFieldMap` to the table's actual audit columns — they differ per
table (`updated_at`, `last_modified`, `TimeStamp`, or none).

### 3.3 `brand.service.ts` — business logic

```ts
import { BrandRepository } from './brand.repository';
import { ConflictError, NotFoundError } from '../../core/errors/AppError';
import { auditService } from '../../core/audit/auditService';
import { logger } from '../../core/utils/logger';

const brandRepo = new BrandRepository();

export const BrandService = {
  // ── List ─────────────────────────────────────────────────────
  async list(opts: { page: number; limit: number; search?: string; includeInactive?: boolean }) {
    const where: any = {};
    if (opts.search) {
      where.OR = [
        { brand_name: { contains: opts.search } },
        { brand_code: { contains: opts.search } },
      ];
    }
    return brandRepo.findMany({
      where,
      orderBy: { brand_name: 'asc' },
      page: opts.page,
      limit: opts.limit,
      includeInactive: opts.includeInactive,
    });
  },

  // ── Get one ──────────────────────────────────────────────────
  async getById(id: number) {
    const brand = await brandRepo.findById(id);
    if (!brand) throw new NotFoundError(`Brand ${id} not found`);
    return brand;
  },

  // ── Create ───────────────────────────────────────────────────
  async create(data: any, user?: string) {
    // Business rule: brand_name must be unique (DB enforces too; we pre-check for a clean 409).
    const existing = await brandRepo.findFirst({
      where: { brand_name: data.brand_name },
      includeInactive: true,            // a soft-deleted duplicate still collides on the unique key
    });
    if (existing) {
      throw new ConflictError(`Brand "${data.brand_name}" already exists`);
    }

    const created = await brandRepo.create(data, { user });

    // Audit AFTER the write succeeds. Never block the flow on audit failure (the service handles that).
    await auditService.log('CREATE', 'SUCCESS', { table: 'brands', id: created.id }, user);
    logger.info({ message: 'Brand created', brandId: created.id, user });
    return created;
  },

  // ── Update ───────────────────────────────────────────────────
  async update(id: number, data: any, user?: string) {
    const brand = await this.getById(id);   // reuse → throws NotFound if missing

    if (data.brand_name && data.brand_name !== brand.brand_name) {
      const clash = await brandRepo.findFirst({
        where: { brand_name: data.brand_name },
        includeInactive: true,
      });
      if (clash && clash.id !== id) {
        throw new ConflictError(`Brand "${data.brand_name}" already exists`);
      }
    }

    const updated = await brandRepo.update(id, data, { user });
    await auditService.log('UPDATE', 'SUCCESS', { table: 'brands', id }, user);
    return updated;
  },

  // ── Delete (soft) ────────────────────────────────────────────
  async remove(id: number, user?: string) {
    await this.getById(id);                  // existence check first
    const result = await brandRepo.delete(id, { user });   // soft delete → is_active = false
    await auditService.log('DELETE', 'SUCCESS', { table: 'brands', id }, user);
    return result;
  },
};

export default BrandService;
```

**Rules:**
- Service is a plain object of `async` methods (matches `OrganizationService`/`AccountsService`).
- Existence check → throw `NotFoundError`. Uniqueness check → throw `ConflictError`.
  Cross-entity reference invalid → throw `ValidationError`.
- **Reuse within the service** (`this.getById`) instead of duplicating lookups.
- Pass `user` through to the repository so audit columns get populated.
- Audit + structured `logger` calls go here, never in the controller or repository.
- For any operation that writes **more than one row** (1:1 extensions, posting, "only one
  default" toggles), wrap in `prisma.$transaction(async (tx) => { ... repo.x(.., {tx}) })`
  — see §4.

### 3.4 `brand.controller.ts` — HTTP boundary

```ts
import { Request, Response, NextFunction } from 'express';
import { BrandService } from './brand.service';
import { ApiResponse } from '../../core/types';

export const BrandController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, includeInactive } = req.query as any;
      const result = await BrandService.list({ page, limit, search, includeInactive });
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);          // ALWAYS delegate to the global errorHandler
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await BrandService.getById(Number(req.params.id));
      const response: ApiResponse<typeof brand> = {
        success: true,
        data: brand,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await BrandService.create(req.body, req.user?.username);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Brand created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);    // 201 for create
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await BrandService.update(Number(req.params.id), req.body, req.user?.username);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Brand updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BrandService.remove(Number(req.params.id), req.user?.username);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Brand deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },
};
```

**Rules:** every handler is `try { ... } catch (err) { return next(err); }`. No business
logic, no DB calls, no manual error JSON. Always include `requestId`. Use the right
status: `200` read/update/delete, `201` create. `req.user?.username` is the audit actor.

### 3.5 `brand.routes.ts` — wiring

```ts
import { Router } from 'express';
import { BrandController } from './brand.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { validate } from '../../core/middleware/validate';
import { createBrandSchema, updateBrandSchema, listBrandSchema } from './brand.schema';

const router = Router();

router.use(authenticate);   // every route below requires a valid token

router.get('/',     authorize('Brand', 'read'),   validate(listBrandSchema),   BrandController.list);
router.get('/:id',  authorize('Brand', 'read'),   BrandController.getById);
router.post('/',    authorize('Brand', 'create'), validate(createBrandSchema), BrandController.create);
router.put('/:id',  authorize('Brand', 'update'), validate(updateBrandSchema), BrandController.update);
router.delete('/:id', authorize('Brand', 'delete'), BrandController.remove);

export const brandRoutes = router;
export default router;
```

**Middleware order is fixed:** `authenticate` (router-level) → `authorize(module, action)`
→ `validate(schema)` → controller. Mount the router in `app.ts` under its module prefix.

---

## 4. Transactions & Invariants (non-negotiable for writes spanning rows)

Any operation that touches more than one row must be atomic. Pattern (from
`organization.service.ts` / `voucherPosting.service.ts`):

```ts
return prisma.$transaction(async (tx) => {
  // "only one default" toggle
  if (data.is_default) {
    await tx.financialyear.updateMany({ where: { company_id: data.company_id }, data: { is_default: false } });
  }
  const row = await repo.create(data, { user, tx });   // pass tx into the repository
  await auditService.log('CREATE', 'SUCCESS', { id: row.id }, user, tx);
  return row;
});
```

Hard invariants to enforce **in the service before insert** (the DB has matching
constraints, but we throw clean typed errors first):
- **Double-entry GL:** per `journalledger` row, exactly one of debit/credit > 0 (XOR);
  and `Σdebit === Σcredit` for the voucher. Compute with `Prisma.Decimal`.
- **Stock:** per `stockledger` row, exactly one of `quantity_in`/`quantity_out` > 0.
- **Voucher numbering:** only via `TransactionHelperService` inside the same `tx`
  (`SELECT … FOR UPDATE`); a rollback must not consume a number.
- **No posting into a Closed/Locked financial year.**
- **Hierarchy:** `assertNoCycle` before setting any self-referential `parent_*`.

---

## 5. Cross-Cutting Rules (the enterprise checklist)

**Error handling**
- Throw typed `AppError`s from services; let `errorHandler` translate them. Controllers only `next(err)`.
- Map external/library errors at the boundary (e.g. Prisma `P2002` unique violation →
  `ConflictError`) rather than leaking them.
- Never expose stack traces or DB internals to clients — `errorHandler` already returns a
  generic 500 message and logs the detail server-side.

**Logging**
- Use the pino `logger` with **structured fields** (`logger.info({ message, brandId, user })`),
  never `console.log` and never string-concatenated messages.
- Log state-changing successes at `info`, recoverable/expected failures at `warn`
  (the handler already warns on `AppError`), unexpected failures at `error`.
- Don't log secrets, passwords, full request bodies with PII, or tokens.

**Validation**
- All external input passes a Zod schema via `validate`. Trust nothing from the client.
- Re-validate business preconditions in the service (existence, uniqueness, FK validity,
  state machine transitions) — schema validation is shape-only.

**Security / RBAC / tenancy**
- Every route: `authenticate` + `authorize(module, action)`. Deny by default.
- Soft-FK references (e.g. `contact_id`, ledger ids) must be **validated to exist** before
  write — there is no DB FK to catch a bad id.
- Scope by `companyId`/`branchId` **only where the column exists**; never assume a global filter.
- Passwords only via `core/auth/password.ts`. Never log or return `password_hash`.

**Data integrity**
- `Prisma.Decimal` for all money/quantity; `core/utils/decimal.ts` for arithmetic.
- Soft delete by default (`is_active=false`); hard delete only with explicit `hardDelete`.
- Audit columns populated through the repository's `{ user }` option, not hand-set in services.
- Significant mutations recorded via `auditService.log(...)`.

**Consistency**
- Match the existing naming: `XService` (object), `XController` (object), `XRepository`
  (class), `xSchema` (Zod). Section multi-entity files with `// ── Entity ──` banners.
- Snake_case field names in data objects mirror DB columns; camelCase for TS-only vars.
- Return `ApiResponse<T>`; lists return the repository's `Paginated<T>` inside `data`.

---

## 6. Testing standard (Vitest + Supertest)

Each module ships an integration test exercising the full slice against a dev DB.

```ts
import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/app';

describe('Brand module', () => {
  let token: string;
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: '...' });
    token = res.body.data.accessToken;
  });

  it('rejects unauthenticated access', async () => {
    await request(app).get('/api/inventory/brands').expect(401);
  });

  it('creates a brand and rejects a duplicate with 409', async () => {
    const payload = { brand_name: 'Acme-Test' };
    await request(app).post('/api/inventory/brands').set('Authorization', `Bearer ${token}`).send(payload).expect(201);
    await request(app).post('/api/inventory/brands').set('Authorization', `Bearer ${token}`).send(payload).expect(409);
  });

  it('400s on invalid input', async () => {
    await request(app).post('/api/inventory/brands').set('Authorization', `Bearer ${token}`).send({}).expect(400);
  });

  it('soft-deletes (row stays, excluded from default list)', async () => { /* ... */ });
});
```

Minimum coverage per module: auth required (401), RBAC denied (403), validation (400),
happy-path create/read/update (201/200), conflict (409), not-found (404), soft-delete
exclusion. For voucher modules add: numbering concurrency, `Σdr==Σcr`, stock XOR, and
full rollback leaving zero partial rows.

---

## 7. Definition of Done (per entity/module)

- [ ] Zod schema for every write endpoint; all strings bounded to column width.
- [ ] Repository class with correct `modelName`, `primaryKeyField`, `softDeleteField`, `auditFieldMap`.
- [ ] Service with existence/uniqueness/FK/state checks throwing typed `AppError`s; multi-row writes in `$transaction`.
- [ ] Controller handlers all `try/catch → next(err)`, returning `ApiResponse<T>` with `requestId` and correct status codes.
- [ ] Routes guarded by `authenticate` + `authorize(module, action)` + `validate`.
- [ ] Soft-FK ids validated; money/qty use `Prisma.Decimal`; audit logged for mutations.
- [ ] Router mounted in `app.ts`; module added to `ENUMS.md`/`module_name` list if new.
- [ ] Integration tests cover auth/RBAC/validation/CRUD/conflict/soft-delete.
- [ ] `npm run lint && npm run typecheck && npm test` pass.

---

## 8. Anti-patterns (rejected in review)

- Business logic in a controller or route handler.
- Prisma calls outside a repository (except inside a service's `$transaction` for cross-table writes).
- `throw new Error('...')` for an operational case; returning `{ error: ... }` objects.
- Catching an error and swallowing it (no log, no rethrow).
- `console.log`; string-built log messages; logging secrets/PII.
- JS `number` math on money; storing money as float.
- Hard-deleting masters; hand-setting audit columns in services.
- Skipping `authorize`, or trusting client-supplied `companyId`/`role`.
- Multi-row writes without a transaction; generating voucher numbers outside `TransactionHelperService`.
- Duplicating a lookup instead of reusing a sibling service method.
