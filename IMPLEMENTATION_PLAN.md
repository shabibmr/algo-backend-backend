# algoERP — TypeScript/Node Backend Implementation Plan

## Context

The repo at `E:\work\algo-backend\models` is a **Django ORM models-only library** (~60+ entities across 5 modules) backed by a fixed MySQL/MariaDB schema. There is no runnable backend — models are imported into a parent Django project. The goal is to build a **production-grade TypeScript/Node backend** that exposes these entities as APIs and encodes the business rules (double-entry posting, atomic voucher numbering, RBAC, audit).

**Locked decisions:**
- **Framework:** Express + structured layers (controller → service → repository), no NestJS.
- **DB access:** Prisma, mapped to the **existing** MySQL schema (`db_table`/column names are a contract).
- **Coexistence:** Runs **alongside** the Django/parent app on the **same database**. The TS backend must NOT own or run destructive migrations; the schema is treated as an external contract.
- **Phasing:** Build the **shared framework + Org + Accounts + a Transactions vertical slice (SalesInvoice)** first. Remaining modules (full Inventory, Employee, other voucher types) follow the proven template.

Outcome of this phase: a deployable service with auth/RBAC, audit, multi-tenant context, soft-delete-aware repositories, the atomic numbering engine, the double-entry posting engine, and one full voucher flow end-to-end — establishing every reusable pattern the rest of the system copies.

---

## Architecture Overview

A **modular monolith**: one Express app, code organized by domain module. Each entity follows a uniform 5-file slice:

```
<entity>.routes.ts        # Express router: paths, middleware wiring
<entity>.controller.ts    # HTTP I/O only: parse req, call service, shape response
<entity>.service.ts       # Business rules, transactions, cross-entity orchestration
<entity>.repository.ts    # Prisma data access; extends BaseRepository
<entity>.schema.ts        # Zod request/response validation + inferred types
```

Strict dependency direction: `routes → controller → service → repository → Prisma`. Controllers never touch Prisma; services never touch `req`/`res`.

### Proposed directory layout
```
backend/
  prisma/
    schema.prisma            # introspected + hand-refined; relationMode = "prisma"
  src/
    config/                  # env loading (zod-validated), constants, FY config
    core/                    # shared kernel (framework, not domain)
      db/prisma.ts           # singleton PrismaClient
      middleware/            # auth, rbac, tenantContext, audit, validate, errorHandler, requestId
      errors/                # AppError hierarchy (NotFound, Forbidden, Validation, Conflict...)
      repository/BaseRepository.ts
      audit/auditService.ts
      auth/{jwt,password}.ts
      types/                 # AuthUser, TenantContext, Paginated<T>, ApiResponse<T>
      utils/                 # decimal helpers, pagination, soft-delete filter
    modules/
      organization/          # CompanyProfile, FinancialYear, Branch, Currency/Rate,
                             #   VoucherSeries, UserRole, UserCredentials, UserAccessPermission,
                             #   ConfigSetting, AddressBook, AuditLog (read), ExtraValues
      accounts/              # AccountGroup, LedgerMaster (+1:1 Bank/Credit/Tax), Billwise, Cheque
      transactions/          # VoucherHeader, TransactionHelper, SalesInvoice slice,
                             #   JournalLedger, posting + numbering services
    app.ts                   # express app assembly, global middleware, route mounting
    server.ts                # bootstrap, graceful shutdown
  tests/                     # integration tests against a test DB
```

---

## Prisma Strategy (critical, given coexistence)

1. **Introspect, don't author migrations.** Generate the initial `schema.prisma` with `prisma db pull` against a copy of the live DB, then hand-refine. The TS app uses `prisma generate` only — **never `prisma migrate deploy`** against the shared DB. Document this hard rule in `prisma/README`.
2. **Exact mapping.** Every model uses `@@map("db_table")` and `@map("column")` to match the Django `db_table`/`db_column` names exactly (many differ from field names, e.g. `salesvouchermain`, `voucherledgerid`, `TimeStamp`).
3. **`relationMode = "prisma"`.** Lets us declare relations for the **cross-module "soft FK" `IntegerField`s** (e.g. `LedgerMaster.contact_id → address_book`, `InventoryItem.sales_gl_ledger_id → ledgermaster`) without DB-level FK constraints that Django doesn't have. Referential integrity stays app-enforced.
4. **Decimals.** Map money to `Decimal @db.Decimal(18,2)`, qty/rate to `@db.Decimal(_,4)`, rates to `@db.Decimal(18,6)` — matching the Django precisions. **All monetary math uses `Prisma.Decimal` (decimal.js); never JS `number`.** A `core/utils/decimal.ts` wraps add/sub/mul/round helpers.
5. **Legacy quirks to handle explicitly:** tables with `_id` PKs (`billwise_records`, `cheque_details`, `pricelist_entries`), varchar legacy FKs (`ledger_id` as string in Billwise/Cheque), and no-PK/odd tables. Map these faithfully; flag varchar-FK joins as manual (`@ignore` relation, join in service layer).
6. **XOR CHECK constraints** (`journalledger` debit/credit, `stockledger` qty_in/qty_out) already exist in the DB. Prisma can't model CHECKs — the **posting services validate the XOR in code before insert**, so we never hit a raw DB error.

---

## Core / Shared Kernel

These are the reusable building blocks every module depends on. Build these first.

### 1. `BaseRepository<TDelegate>`
Generic wrapper over a Prisma model delegate providing:
- **Soft-delete awareness:** default `where: { is_active: true }` on list/get; `delete()` performs `update({ is_active: false })` (never hard delete). An `includeInactive` flag bypasses it.
- **Audit field injection:** on create sets `added_by`, `created_at`; on update sets `last_modified_by`, `last_modified` — pulled from the request's `AuthUser`. (Column names vary per table — repository takes a small field-map config since some tables use `updated_at`/`TimeStamp`/`last_updated`.)
- **Pagination/filter/sort helpers** returning `Paginated<T>`.
- **`tx` passthrough** so a service can run repository calls inside a shared `prisma.$transaction`.

### 2. Auth (`core/auth`)
- **Password:** bcrypt/argon2 verify against `usercredentials.password_hash`. ⚠️ The hash is a custom scheme (NOT Django pbkdf2) — **confirm the exact algorithm (bcrypt vs argon2) from a sample row before finalizing** so shared logins keep working. `password.ts` abstracts hash/verify behind one interface.
- **JWT:** access + refresh tokens. Payload carries `userId`, `username`, `roleId`, `branchId`, `companyId`. `last_login_at` updated on login.
- **Login flow:** `POST /auth/login` → verify → issue tokens; `POST /auth/refresh`.

### 3. Middleware chain (order matters)
`requestId → tenantContext → authenticate → authorize(module, action) → validate(zodSchema) → controller → errorHandler`
- **`authenticate`:** verifies JWT, loads `AuthUser`, attaches to `req`.
- **`tenantContext`:** derives `{ companyId, branchId }` and exposes a scoping helper. Note: org-level tables carry `company`/`branch` FKs; many masters (ledger, items) are not company-scoped in the schema — scoping is applied **only where the column exists**, documented per module.
- **`authorize(moduleName, action)`:** loads `UserAccessPermission` for `role + module_name`, checks the `allow_create/read/update/delete/share` flag. Per-request memoized; optional in-process cache keyed by `roleId`. Falls back to deny. (Legacy `UserGroupPermissions` is explicitly NOT used.)
- **`validate`:** runs the route's Zod schema over `body`/`params`/`query`.
- **`errorHandler`:** maps `AppError` subclasses → HTTP codes, hides internals, writes an `ErrorReporting` row for 5xx.

### 4. Audit (`core/audit/auditService.ts`)
`auditService.log({ action, status, tableName, recordId, data, user, ip })` writes an `AuditLog` (`log` table) row. Services call it after significant mutations (CREATE/UPDATE/DELETE/LOGIN/APPROVE/CANCEL). Mutating data captured as a JSON snapshot. `ConfigSetting` writes with `is_logged=true` also log.

### 5. Config (`config/`)
- Env loaded + validated with Zod (`DATABASE_URL`, JWT secrets, port, etc.).
- `ConfigSettingService.get(key, default)` reads the `configsettings` table and casts via `data_type` (mirrors Django `typed_value()`), with a short TTL cache. Used for `VAT_RATE`, `FINANCIAL_YEAR`, `ENABLE_BATCH_TRACKING`, `MAX_DISCOUNT_PERCENT`, etc.

---

## Module: Organization (foundation)

Entities: `CompanyProfile`, `FinancialYear`, `Branch`, `Currency`, `CurrencyRate`, `VoucherSeries`, `UserRole`, `UserCredentials`, `UserAccessPermission`, `ConfigSetting`, `AddressBook`, `ExtraValuesTable`, `AuditLog` (read-only endpoints).

Highlights:
- **CRUD slices** for each, reusing `BaseRepository`. Enforce unique constraints surfaced as `ConflictError` (e.g. `fy_code+company`, `username`, `iso_code`, `voucherseries (type,prefix,company)`).
- **FinancialYear:** `is_default` toggle (only one default), status `Open/Closed/Locked` — Locked blocks posting (checked by transactions module).
- **AddressBook** is the central contact master; expose generic search (used by ledgers, employees, vouchers).
- **ExtraValuesTable:** generic `GET/PUT /extras/:type/:objectId` endpoint for polymorphic attributes + hashtags — reusable across all modules.
- **RBAC admin:** endpoints to manage `UserRole` + `UserAccessPermission` (these power the `authorize` middleware).

## Module: Accounts (foundation)

Entities: `AccountGroup`, `LedgerMaster` (+ 1:1 `LedgerBankDetails`, `LedgerCreditSettings`, `LedgerTaxSettings`), `BillwiseRecord`, `ChequeDetails`.

Highlights:
- **AccountGroup self-referential hierarchy** — replicate Django's `clean()` circular-ancestry guard in the service (`assertNoCycle(parentId, selfId)` walks ancestors). Expose `full_path` / `depth` as computed response fields.
- **LedgerMaster + 1:1 extensions:** a single `createLedger` service writes master + optional bank/credit/tax rows in **one `prisma.$transaction`**. The 1:1 children share the ledger PK. `is_system_defined` ledgers can't be deleted.
- **Soft-FK join:** `contact_id → address_book` resolved in the service (Prisma relation under `relationMode="prisma"`).
- A **`LedgerBalanceService`** (read) computes `effective_balance` from `opening_balance` + `JournalLedger` movements — shared with reporting later.

## Module: Transactions — vertical slice (foundation proof)

This slice exercises every hard pattern once, end-to-end. **SalesInvoice** is chosen because it touches numbering, header/detail, GL posting, stock posting, and billwise.

Entities/services: `VoucherHeader`, `TransactionHelper`, `SalesInvoiceMain` (`salesvouchermain`) + `SalesInvoiceDetail` (`salesvoucherdetails`), `JournalLedger`, plus the two engines below.

### Numbering engine — `TransactionHelperService`
Mirrors Django's `select_for_update` flow. Must run **inside** the caller's transaction:
```
within prisma.$transaction (interactive):
  rows = $queryRaw`SELECT * FROM transactionhelper
                   WHERE voucher_type=? AND voucher_prefix=? AND financial_year=?
                   FOR UPDATE`           // pessimistic row lock (InnoDB)
  next = row.last_number + 1
  formatted = prefix + prefix_separator + zeroPad(next, number_length)
  $executeRaw`UPDATE transactionhelper SET last_number=? WHERE id=?`
  return formatted
```
Honors `reset_yearly` at FY rollover. The voucher INSERT happens in the **same** transaction so the number is never consumed on rollback — gap-free and collision-free under concurrency.

### Posting engine — `VoucherPostingService`
One transactional `postSalesInvoice(payload, user)`:
1. Guard: FY not `Locked`; RBAC `SalesInvoice.create`; `MAX_DISCOUNT_PERCENT` check.
2. Acquire voucher number (engine above) + insert `VoucherHeader`.
3. Insert `salesvouchermain` (header, status `Draft`→`Posted`) + `salesvoucherdetails` lines.
4. Compute totals with `Prisma.Decimal` (subtotal, tax via `TaxCategories`/`VAT_RATE`, discount, round-off).
5. **GL posting:** write balanced `JournalLedger` rows — Dr Debtor / Cr Sales (+ Cr Tax). Assert `Σdebit == Σcredit` and per-row XOR before insert.
6. **Stock posting:** write `StockLedger` rows (qty_out from godown) with XOR assertion. (Inventory item/godown reads via soft-FK.)
7. **Billwise:** create `BillwiseRecord` (`New Ref`) for the receivable.
8. Audit log `CREATE`/`APPROVE`. Commit. Any failure rolls the whole thing back.

This service is the **template** for the remaining 7+ voucher types (each differs only in which ledgers/stock direction it posts).

---

## Cross-cutting conventions (apply everywhere)

- **Validation:** every endpoint has a Zod schema; types inferred from it (single source of truth).
- **Responses:** uniform `ApiResponse<T>` envelope + `Paginated<T>` for lists.
- **Errors:** typed `AppError` hierarchy; never leak Prisma errors.
- **Enums:** TS string-union/const-enum types mirroring every Django `TextChoices`/`IntegerChoices` (status, nature, ledger_type, contact_type, action, etc.) in `<module>/enums.ts`.
- **Soft delete + audit fields:** handled by `BaseRepository`, not per-endpoint.
- **Transactions:** any multi-table write goes through `prisma.$transaction`; services accept an optional `tx`.
- **Logging:** structured (pino) with `requestId`.

---

## Reusable / flexibility hooks
- `BaseRepository` + the 5-file slice template make new entities near-mechanical.
- `VoucherPostingService` is generic over voucher type via a small per-type posting config (which ledgers, stock direction, billwise yes/no).
- `ExtraValuesTable` service allows attaching custom attributes to any entity without schema change.
- `ConfigSettingService` drives behavior (VAT, limits, feature flags) at runtime.

---

## Tech stack
Express 5, TypeScript (strict), Prisma + MySQL, Zod, jsonwebtoken, bcrypt/argon2, pino, Vitest/Jest + Supertest, ESLint/Prettier. `decimal.js` via `Prisma.Decimal`.

---

## Open items to confirm before/within build
1. **Password hash algorithm** — verify bcrypt vs argon2 (and cost params) from a real `usercredentials` row, so shared logins with the Django app work. (Schema says "bcrypt/argon2", not Django pbkdf2.)
2. **Multi-tenant scope** — confirm whether masters (ledgers/items) should be filtered by company/branch (schema doesn't carry company on most masters) or are global per install.
3. **Financial year source** — taken from `ConfigSetting.FINANCIAL_YEAR` vs the default `FinancialYear` row; confirm authority.

---

## Verification

1. **Setup:** point Prisma at a **dev copy** of the MySQL DB; `prisma db pull` → refine → `prisma generate`. Confirm no migration is applied to the shared DB.
2. **Schema mapping test:** read one row from each foundation table via Prisma and assert column/decimal mapping (a quick script).
3. **Auth:** integration test — login with a known seeded user, get JWT, hit a protected route; verify a wrong-permission user gets 403 from `authorize`.
4. **Numbering concurrency:** fire N parallel `SalesInvoice` creates; assert voucher numbers are sequential, gap-free, and unique (proves `FOR UPDATE` works).
5. **Posting integrity:** post a SalesInvoice; assert `Σdebit == Σcredit` in `journalledger`, a `stockledger` qty_out row exists, a `billwise_records` row exists, and rollback on a forced mid-transaction error leaves **zero** partial rows + an unconsumed voucher number.
6. **Soft delete:** delete a ledger → row remains with `is_active=0` and is excluded from default lists.
7. **Audit:** confirm an `AuditLog` (`log`) row is written for create/post actions.
8. Run lint + typecheck + the integration suite (`tests/`) in CI against the dev DB.
