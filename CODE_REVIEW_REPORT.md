# Code Review Report — algoERP Backend (`models/backend`)

## Context
The `backend/` folder is a TypeScript + Express + Prisma (MySQL/MariaDB) REST API layer
on top of the algoERP Django-era data model. It exposes auth, organization, accounts,
inventory, transactions (8 voucher types with double-entry GL + stock posting), and
employee modules. This review covers correctness, security, business-logic, and
maintainability across the source under `backend/src` (≈70 files). `node_modules` excluded.

Overall the code is well-structured: clean module boundaries, a shared `BaseRepository`,
decimal-safe money math (`core/utils/decimal.ts`), pessimistic-locked gap-free voucher
numbering, balanced double-entry assertions on every posting, route-level RBAC, helmet +
rate-limit + zod validation. The findings below are the gaps worth acting on.

---

## Severity summary

| # | Severity | Area | Finding |
|---|----------|------|---------|
| S1 | **Critical** | Security | Plaintext password fallback in `verifyPassword` |
| S2 | **Critical** | Security | `.env` with secrets + root/no-password DB URL committed to repo |
| B1 | **High** | Business | Sales posting never calls the stock-availability guard → overselling |
| B2 | **High** | Business | Credit-limit check runs outside the transaction (TOCTOU race) |
| S3 | **High** | Security | Permission cache has no TTL → revoked permissions stay live |
| B3 | **High** | Correctness | FY-lock & voucher numbering ignore `company_id` though schema keys them by it |
| S4 | **Medium** | Security | `tenantContext` trusts `x-company-id`/`x-branch-id` headers |
| S5 | **Medium** | Security | CORS defaults to `*`; error handler persists full request body/stack to DB |
| S6 | **Medium** | Security | No JWT revocation; logout / change-password don't invalidate tokens |
| T1 | **Medium** | Technical | Many read/write routes mounted with no rate limiter |
| B4 | **Low** | Correctness | `receipt_voucher_details` uses `narration` vs schema; narration default 5% / doubled words |

---

## Security

### S1 — Plaintext password fallback (Critical)
`core/auth/password.ts:39` — `verifyPassword` falls through to `return password === hash;`
for any hash that isn't bcrypt/argon2.
- **Impact:** If any `user_credentials.password_hash` is stored as plaintext (the comment
  admits the sample DB used `123456`), login succeeds on a raw string compare. It also
  makes a DB-write that stores a plaintext password silently "valid," and the comparison
  is not constant-time. The argon2 branch (`:33`) throws, so any argon2-hashed user can
  never log in.
- **Fix:** Remove the plaintext branch entirely (or gate it behind an explicit
  `ALLOW_PLAINTEXT_LOGIN` dev-only flag that defaults off in `NODE_ENV==='production'`).
  Implement real argon2 verification or reject argon2 hashes loudly.

### S2 — Secrets committed in `.env` (Critical)
`backend/.env` is present in the tree containing `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, and `DATABASE_URL="mysql://root:@localhost:3306/..."` (root user,
empty password).
- **Impact:** Secrets in version control are compromised by definition; the DB URL also
  documents a root/no-password connection pattern. Anyone with the JWT secret can forge
  valid access tokens for any user/role.
- **Fix:** Remove `.env` from the repo, rotate the secrets, add `.env` to `.gitignore`,
  keep only `.env.example`. Enforce strong secrets (raise the `min(16)` in
  `config/index.ts` and require non-default values in production).

### S3 — Permission cache never expires (High)
`core/middleware/authorize.ts:9` — `permissionCache` is a module-level map populated on
first lookup with **no TTL**; it is only cleared by an explicit `clearPermissionCache()`
call, which nothing in the codebase invokes.
- **Impact:** When an admin revokes a role's permission, the old `allowed=true` stays
  cached for the life of the process — a revoked user keeps access until restart. Also a
  per-process cache is inconsistent across multiple instances.
- **Fix:** Add a TTL (mirror `ConfigSettingService`'s `expiresAt` pattern) and/or call
  `clearPermissionCache(roleId)` from the permission-update path.

### S4 — Header-based tenant spoofing (Medium)
`core/middleware/tenantContext.ts:7-15` — when `req.tenant` isn't already set by
`authenticate`, it reads `x-company-id` / `x-branch-id` straight from request headers.
- **Impact:** Any tenant-scoped route not placed behind `authenticate` lets a caller pick
  an arbitrary company/branch. Today the auth'd routes set `req.tenant` first, but this is
  a latent privilege-escalation footgun for any future unauthenticated endpoint.
- **Fix:** Derive tenant only from the verified JWT; drop the header fallback (or restrict
  it to an internal, network-trusted ingress).

### S5 — Permissive CORS + sensitive error persistence (Medium)
- `app.ts:30-31` — `CORS_ORIGINS` defaults to `['*']` when the env var is unset.
- `core/middleware/errorHandler.ts:56-63` — on any 500 it writes the full
  `JSON.stringify(req.body)` and stack trace to `error_reporting`. Request bodies can
  contain PII, `ImageBase64` blobs, or credentials; stack traces leak internals.
- **Fix:** Require an explicit allowlist in production; redact/skip sensitive fields
  (password, tokens, base64) before persisting, and cap stored size.

### S6 — No token revocation (Medium)
`auth.controller.ts:229` logout and `:204` change-password don't invalidate existing
JWTs; refresh tokens are re-issued but never blacklisted/rotated server-side
(`core/auth/jwt.ts`). A leaked access token is valid for its full 1h regardless of logout
or password change.
- **Fix:** Track a token version / `passwordChangedAt` in `user_credentials` and reject
  tokens issued before it; or maintain a refresh-token store with revocation.

Minor: `/health` returns raw DB error text (`app.ts:65`) to unauthenticated callers
(info disclosure).

---

## Business logic & correctness

### B1 — Stock-availability guard is never wired into posting (High)
`StockLedgerService.assertStockAvailable` exists (`inventory.service.ts:1101`) but a grep
shows it is **only referenced by read endpoints in the inventory controller** — never by
`voucherPosting.service.ts`. `postSalesInvoice` (`:347`) and `postDebitNote` write
`quantity_out` rows with no balance check.
- **Impact:** Sales invoices / purchase-return notes can drive stock negative; overselling
  is silently allowed. The guard was built for exactly this and left unconnected.
- **Fix:** Call `assertStockAvailable(item_id, godown_id, quantity)` per line inside the
  posting transaction (use the `tx` client) before writing the stock ledger.

### B2 — Credit-limit check is outside the transaction (High)
`voucherPosting.service.ts:175` calls `assertCreditLimitOk(...)` **before**
`prisma.$transaction` (`:188`) and never re-checks inside it.
- **Impact:** Two concurrent invoices for the same customer both read the same
  "outstanding" total and both pass — a classic TOCTOU that lets the combined exposure
  exceed the credit limit. Additionally the `newAmount` passed (`:174`) is
  `Σ quantity*price` (pre-discount, pre-tax), while the limit is compared against gross
  outstanding, so the check uses an inconsistent figure.
- **Fix:** Move the check inside the transaction (pass `tx`) so it reads under the same
  isolation, and pass the gross/posted amount for consistency.

### B3 — Multi-company keys ignored in FY-lock and numbering (High / data-integrity)
The schema keys financial years by company (`financialyear` `@@unique([fy_code,
company_id])`) and voucher-number series by company (`@@unique([voucher_type, prefix,
company_id])`). But:
- `assertFyNotLocked` (`voucherPosting.service.ts:104`) does
  `findFirst({ where:{ fy_code } })` with no `company_id`.
- `TransactionHelperService.generateNextNumber` (`transactionHelper.service.ts:23`) filters
  `transactionhelper` only by `(voucher_type, voucher_prefix, financial_year)`.
- Voucher headers/mains are created with no `company_id`/`branch_id`.
- **Impact:** In any database holding more than one company, the period-lock guard and the
  sequential numbering resolve to an arbitrary company's row → wrong lock decision or
  cross-company number collisions, and posted vouchers can't be attributed/scoped to a
  tenant. (Note `ledger_master` and most masters have **no** `company_id`, so the intended
  model appears to be DB-per-company — but the partially company-scoped tables make this
  inconsistent and fragile.)
- **Fix:** Decide the tenancy model explicitly. If multi-company-per-DB, thread
  `companyId` (from `req.user`) into FY lookups, the numbering helper, and voucher inserts.
  If DB-per-company, drop the now-misleading `company_id` keys.

### B4 — Lower-severity correctness/cosmetic
- `voucherPosting.service.ts:826` — `receipt_voucher_details` line uses lowercase
  `narration`, while the Payment path (`:679`) uses `Narration`. Verify against the Prisma
  model; if the column is `Narration`, receipt narration is dropped or errors.
- Narration strings double the word ("Sales Sales Invoice" `:308`, "Purchase Purchase
  Invoice" `:533`) and hardcode a `|| 5`% tax label (`:322`).

---

## Technical / maintainability

- **T1 — Inconsistent rate limiting:** `app.ts:89-100` applies `writeLimiter` to
  `/accounts`, `/transactions` (base), `/inventory`, `/employee`, `/organization`, but the
  `phase4`, `ancillary`, `voucherRead`, `voucherLifecycle`, `/transactions/reports`, and
  `/reports` mounts (`:93-98`) get no limiter. Several of these are write/expensive paths.
- **Pagination caps:** `BaseRepository.findMany` defaults `limit=20` but never caps it;
  callers pass `limit: 1000`/`500` and client-supplied `limit` flows through unbounded in
  some list endpoints → potential resource-exhaustion. Add a hard max.
- **Type safety:** repositories and service signatures use `data: any` / `where: any`
  pervasively, discarding Prisma's generated types and zod-inferred types — easy source of
  silent field-name drift (cf. B4). Prefer typed inputs where practical.
- **Argon2 path:** `password.ts:33` throwing means any argon2 user is permanently locked
  out; either implement it or migrate those hashes.
- **Positives worth keeping:** decimal helpers prevent float money errors; every posting
  asserts Σdebit==Σcredit; voucher numbering uses `SELECT … FOR UPDATE`; raw SQL uses
  tagged-template parameter binding (no SQL injection found); graceful shutdown + health
  probes are implemented.

---

## How to verify the key findings
1. **B1 (overselling):** seed an item with `is_stock_item=true` and small stock, POST a
   `/transactions/sales-invoice` exceeding it → today it succeeds and stock goes negative
   (confirm via `StockLedgerService.getBalance`).
2. **B2 (credit race):** fire two concurrent sales invoices near a customer's credit limit
   → both post.
3. **S1 (plaintext):** set a user's `password_hash` to a plaintext string, log in with that
   string → succeeds.
4. **S3 (cache):** grant then revoke a permission while the server runs → revoked user keeps
   access until restart.

---
*No source changes are proposed by this review itself — remediation would be a follow-up.*
