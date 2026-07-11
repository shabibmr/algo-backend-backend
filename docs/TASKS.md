# algoERP TS/Node Backend — Master Task List

Express + Prisma + MySQL backend for a multi-tenant Accounting & Inventory ERP (SAAS).
Phases 1–4 are **complete** (~193 endpoints live). Everything below is the remaining work
to support **all** backend communications the domain requires, reordered by priority.

## Legend
`[ ]` pending · `[~]` in progress · `[x]` done
Priorities: **P0** blocker (system is incorrect/unusable without it) · **P1** core gap ·
**P2** operational reporting/ops · **P3** hardening & platform.

Each job maps to one file change or one route group and follows the established layering:
`repository → service → controller → route`, with `authorize('Module','action')`, Zod
validation, `auditService.log(...)`, and soft-delete (`is_active`). Never write
`JournalLedger`/`StockLedger` outside `voucherPosting.service.ts`; never generate voucher
numbers outside `TransactionHelper`.

---

## ✅ Completed — Phases 1–4 (do not redo)

**Phase 1 — Foundation:** scaffold/tooling, Prisma schema, error/response framework,
BaseRepository, auth (password + JWT login/refresh), RBAC/tenant/validation middleware,
audit + ConfigSetting services, shared enums/decimal utils, organization core, accounts
core, `TransactionHelperService` (atomic numbering), `VoucherPostingService` + SalesInvoice
slice, app assembly/bootstrap, core integration tests.

**Phase 2 — Inventory:** UOM/Brand/Category/TaxCategory masters, InventoryGroup hierarchy,
InventoryItem, SKU/Batch/Property/Image, Ingredient (BOM), Godown, UOMConversion,
PriceList/Entry, Route masters & mappings, LedgerItemMapping. (~60 endpoints.)

**Phase 3 — Employee/HR:** Department/Designation, EmployeeDetails + 1:1 extensions,
EmployeeDocument (+ expiry list), SalaryRevisionHistory read, LeavePolicy/Allocation,
LeaveRequest approval, AttendanceDetails, ShiftMaster/Assignment, PayslipMain. (~33 endpoints.)

**Phase 4 — Transactions (posting):** all 8 core voucher POSTs (SalesInvoice,
PurchaseInvoice, Payment, Receipt, Contra, Journal, Credit/Debit Note), order/stock POSTs
(Quotation, Sales/Purchase Order, GodownTransfer, Delivery/Receipt Note, MaterialIn,
Requirement, StockRequest + fulfill), GL reports (ledger statement, trial balance, P&L,
balance sheet, day book), pending-quantities, shipment / physical-spec / line-allocation
reads, T&C + TransportationDetails full CRUD.

> ⚠️ All Phase-4 vouchers are **POST-only**. There is currently **no way to read, edit,
> cancel, or approve a voucher** — addressed in P0 below.

---

# P0 — Blockers

Without these the system cannot display, correct, or control what it posts.

## Phase 5 — Voucher Read / List

Every POST-only voucher needs GET list (paginated, filterable by date/party/prefix/FY) and
GET detail (header + lines joined).

### 5A — Core posting vouchers
- [x] **1. SalesInvoice read** — `GET /transactions/sales-invoices` (filters: date range,
  customer_ledger_id, prefix, financial_year); `GET /transactions/sales-invoices/:id`
  (header + `salesvoucherdetails`).
- [x] **2. PurchaseInvoice read** — list (date range, supplier_ledger_id, prefix) + `:id`
  (header + `purchasevoucherdetails`).
- [x] **3. Payment Voucher read** — list (date range, ledger_id) + `:id` (header + lines).
- [x] **4. Receipt Voucher read** — list + `:id`.
- [x] **5. Contra Voucher read** — list + `:id`.
- [x] **6. Journal Voucher read** — list (date range, FY) + `:id`.
- [x] **7. CreditNote read** — list + `:id`.
- [x] **8. DebitNote read** — list + `:id`.

### 5B — Order / stock vouchers
- [x] **9. Quotation read** — list (status, customer_ledger_id, date) + `:id`
  (header + lines + status history).
- [x] **10. SalesOrder read** — list (status, customer_ledger_id) + `:id`
  (header + lines + pending qty).
- [x] **11. PurchaseOrder read** — list (status, supplier_ledger_id) + `:id` (+ pending qty).
- [x] **12. DeliveryNote read** — list (source sales order, date) + `:id`.
- [x] **13. ReceiptNote (GRN) read** — list (source purchase order, date) + `:id`.
- [x] **14. GodownTransfer read** — list + `:id`.

### 5C — Internal stock vouchers
- [x] **15. MaterialIn read** — list + `:id`.
- [x] **16. Requirement read** — list + `:id`.
- [x] **17. StockRequest read** — list (status, godown) + `:id`.

### 5D — VoucherHeader lookup
- [x] **18. VoucherHeader generic read** — `GET /transactions/voucher-header/:id` returns the
  posted row + `voucher_type` so a caller can fetch the typed endpoint.
  Service: `prisma.voucherheader.findUnique({ where: { id } })`.

## Phase 6 — Linkage & line-relation reads (document trail)
- [x] **19. VoucherLinkage read** — add `VoucherLinkageRepository`;
  `getByVoucher(voucherHeaderId)` (all linkages where source/target matches, incl.
  `link_type`); `GET /transactions/linkages/:voucherHeaderId`,
  `authorize('Transactions','read')`.
- [x] **20. VoucherLineRelation read** — add `VoucherLineRelationRepository`;
  `getBySourceLine(detailLineId)` computing `pending_qty = original_qty −
  Σ(quantity_converted)`; `GET /transactions/line-relations/:detailLineId`.

## Phase 7 — Voucher lifecycle: edit / cancel / approve (NEW — correctness gap)

Vouchers are append-only today; production ERP needs controlled mutation with full
GL/stock reversal and approval gating. All changes go through the existing transaction
block in `voucherPosting.service.ts`.

- [x] **21. Period-lock enforcement** — guard in `voucherPosting.service.ts`: reject any
  post/edit/cancel whose `voucher_date` falls in a `FinancialYear` with status
  Closed/Locked. Throw `ValidationError('Period locked: <FY>')`. Apply to every posting path.
- [x] **22. Credit-limit enforcement** — before posting SalesInvoice / SalesOrder, sum
  outstanding from `BillwiseRecord` for the party + new total, compare to
  `LedgerCreditSettings.credit_limit`; reject if exceeded (sibling to the stock guard,
  task 49). Make it bypassable via a `ConfigSetting` flag.
- [x] **23. Voucher edit (Draft only)** — generic `PUT /transactions/:type/:id` for editable
  voucher types: allowed only when `voucher_status = Draft`; diff header + lines, re-validate,
  re-post nothing (Draft has no GL/stock). Reject edit of Posted/Cancelled with 409.
- [x] **24. Voucher cancel / void** — `POST /transactions/:type/:id/cancel`: within one
  transaction, write reversing rows to `JournalLedger` and `StockLedger`, set
  `voucher_status = Cancelled`, record `VoucherLinkage(link_type='Amendment')` + audit.
  Respect period lock (task 21). Block if downstream linkages exist (e.g. invoiced order).
- [x] **25. Approval workflow** — `POST /transactions/:type/:id/approve` and `/reject`:
  transition `voucher_status` Draft→Approved→Posted, gated by
  `VoucherSeries.require_approval` and `authorize('Transactions','update')`; reject sets
  reason + audit. Posting endpoints respect the required state.
- [x] **26. Billwise allocation on Payment/Receipt** — when posting Receipt/Payment with
  `Agst Ref`, update referenced `BillwiseRecord.pending_amount` and status atomically;
  expose allocation lines in the post payload + read endpoints (tasks 3–4).

---

# P1 — Core module gaps

## Phase 8 — Organization

### VoucherSeries CRUD (service exists, zero routes)
- [x] **27. VoucherSeries routes** — `GET/POST/PUT/:id/DELETE /organization/voucher-series`
  with `authorize('VoucherSeries', …)`; add `voucherSeriesSchema`, 4 handlers, and
  `updateVoucherSeries`/`deleteVoucherSeries` (list+create already exist).

### AddressBook full CRUD (only search + create today)
- [x] **28. AddressBook get/list/update/delete** —
  `GET /organization/contacts` (paginated), `GET/PUT/DELETE /organization/contacts/:id`
  with `authorize('AddressBook', …)`; add `listContacts/getContact/updateContact/deleteContact`.

### Currency & Branch missing ops
- [x] **29. Currency update + delete** — `PUT/DELETE /organization/currencies/:id`
  (`updateCurrency` exists; add `deleteCurrency`).
- [x] **30. Branch delete** — `DELETE /organization/branches/:id` (+ `deleteBranch`).

### ConfigSetting CRUD
- [x] **31. ConfigSetting routes** — `GET /organization/config`,
  `GET /organization/config/:key`, `PUT /organization/config/:key` (admin only); add
  `ConfigSettingRepository` (backed by `config_settings`) + service/handlers. Use
  `typed_value()` semantics on read.

### UserRole & UserCredentials management
- [x] **32. UserRole get/update/delete** — `GET/PUT/DELETE /organization/roles/:roleId`
  with `authorize('UserRole', …)`.
- [x] **33. UserCredentials list/get/delete** — `GET /organization/users`,
  `GET /organization/users/:id`, `DELETE /organization/users/:id` (soft deactivate)
  with `authorize('UserCredentials', …)`.

### ExtraValues security fix
- [x] **34. ExtraValues authorize** — add `authorize('ExtraValues','read')` to
  `GET /extras/:type/:objectId` and `authorize('ExtraValues','update')` to the `PUT`;
  seed a matching `UserAccessPermission` for the admin role.

### Company listing
- [x] **35. CompanyProfile list** — `GET /organization/companies` (super-admin scope) +
  `listCompanyProfiles`.

### NEW — ProjectMaster (cost centres, untracked entity)
- [x] **36. ProjectMaster CRUD** — `GET/GET:id/POST/PUT/DELETE /organization/projects`
  with `authorize('ProjectMaster', …)`. Self-referential hierarchy: replicate the
  `AccountGroup`/`InventoryGroup` ancestor-walk circular-reference guard. Status enum
  (Pending/Active/OnHold/Completed/Cancelled).

### NEW — ErrorReporting (client/server diagnostics)
- [x] **37. ErrorReporting capture + list** — `POST /organization/error-reports`
  (client logs an error; no auth beyond `authenticate`), `GET /organization/error-reports`
  (admin, filter by resolved), `PUT /organization/error-reports/:id` (mark resolved).

## Phase 9 — Accounts

### Ledger 1:1 extensions
- [x] **38. LedgerBankDetails** — `LedgerBankDetailsRepository`; `getBankDetails`/
  `upsertBankDetails`; `ledgerBankDetailsSchema`; `GET/PUT /accounts/ledgers/:id/bank`.
- [x] **39. LedgerCreditSettings** — same pattern; `GET/PUT /accounts/ledgers/:id/credit`.
- [x] **40. LedgerTaxSettings** — same pattern; `GET/PUT /accounts/ledgers/:id/tax`.

### AccountGroup delete
- [x] **41. AccountGroup soft-delete** — `DELETE /accounts/groups/:id`; reject if any
  `ledgermaster.account_group_id` references it; `deleteAccountGroup`.

### Billwise & cheque management
- [x] **42. BillwiseRecord list + update** — `GET /accounts/billwise?ledger_id=&status=`
  (pending vs settled), `PUT /accounts/billwise/:id` (partial settlement).
- [x] **43. ChequeDetails list + update** — `GET /accounts/cheque?status=&ledger_id=`,
  `PUT /accounts/cheque/:id` (mark cleared/bounced/represented).

## Phase 10 — Auth
- [x] **44. GET /auth/me** — `{ userId, username, roleId, branchId, companyId, role_name }`
  from `req.user` + one role lookup.
- [x] **45. POST /auth/change-password** — `{ current_password, new_password }`; verify then
  rehash; requires `authenticate`.
- [x] **46. POST /auth/logout** — stateless 200 + document client must discard token; flag
  token-blacklist (table/Redis) as a follow-up.

## Phase 11 — SAAS tenant provisioning (NEW)
- [x] **47. Company provisioning** — `POST /organization/companies` (super-admin): in one
  transaction create `CompanyProfile` + default `AccountGroup` tree and system
  `LedgerMaster` rows, baseline `ConfigSetting` keys, default `VoucherSeries` per voucher
  type, and a bootstrap admin `UserRole` + `UserCredentials`. Seed `UserAccessPermission`
  for the admin role across all modules. This is the multi-tenant onboarding entry point.

---

# P2 — Operational reporting, stock & insights

## Phase 12 — Stock ledger & balance
- [x] **48. StockLedger read** — `StockLedgerRepository` (table `stockledger`);
  `getMovements(itemId, {godown_id, date range, voucher_type})`,
  `getByGodown(godownId, options)`.
- [x] **49. Stock balance + stock guard** — `getBalance(itemId, godownId?)` =
  `Σ(qty_in) − Σ(qty_out)`; routes `GET /inventory/stock-balance`,
  `/inventory/stock-balance/:itemId/by-godown`, `/inventory/stock-ledger/:itemId`,
  `/inventory/stock-ledger/godown/:godownId`. **Guard**: before posting SalesInvoice/
  DeliveryNote, throw `ValidationError('Insufficient stock: …')` when
  `balance < requested_qty` and `is_stock_item = true`.

## Phase 13 — Outstanding & aging
- [x] **50. Outstanding bills** — `getOutstanding(ledgerId)`: `BillwiseRecord` rows with
  `pending_amount > 0`, grouped/summed, incl. invoice/due date + voucher ref.
- [x] **51. Aging analysis** — `getAging({type:'AR'|'AP', as_of_date})` in buckets
  (0–30/31–60/61–90/91–180/180+).
- [x] **52. Routes** — `GET /accounts/outstanding/:ledgerId`,
  `GET /accounts/aging?type=AR&as_of_date=`.

## Phase 14 — Registers & stock valuation
- [x] **53. Sales Register** — `GET /transactions/reports/sales-register`
  (start/end date, FY, prefix, customer_ledger_id) → invoice headers with totals.
- [x] **54. Purchase Register** — `GET /transactions/reports/purchase-register`.
- [x] **55. Stock Summary** — `GET /inventory/reports/stock-summary`
  (as_of_date, godown_id?, category_id?): opening + in − out = closing per item.
- [x] **56. Stock Valuation** — `GET /inventory/reports/stock-valuation`
  (as_of_date, godown_id?): `closing_qty × cost` per item.

## Phase 15 — Employee gaps
- [x] **57. Salary revision POST** — `POST /employees/:id/salary-revision`
  `{ new_basic, new_gross, reason }`: append `SalaryRevisionHistory` + update
  `employeesalarydetails.basic` atomically; `salaryRevisionSchema`.
- [x] **58. Attendance monthly summary** — `GET /employees/:id/attendance-summary?month=`
  → `{ present, absent, half_day, leave_paid, leave_unpaid, overtime_hours_total }`.
- [x] **59. Overtime report** — `GET /employee/reports/overtime?month=&department_id=`.

## Phase 16 — Dashboards, alerts & search (NEW)
- [x] **60. Dashboard summary** — `GET /reports/dashboard` (scoped to company/branch):
  period sales & purchase totals, cash/bank position (from `JournalLedger`), outstanding
  AR/AP, low-stock count, top customers. Aggregate queries; cache-friendly.
- [x] **61. Alerts/notifications service** — `GET /alerts` aggregating: `EmployeeDocument`
  expiries (indexed `expiry_date`), reorder-level breaches
  (`InventoryItem.reorder_level` vs stock balance), overdue bills (from aging). Read-only
  derived feed; design as a service so a scheduler/push channel can reuse it later.
- [x] **62. Global search** — `GET /search?q=` across ledgers, items, contacts, and posted
  vouchers (by voucher_no/party); RBAC-filtered, capped results.
- [x] **63. VAT/Tax return report** — `GET /transactions/reports/vat-return?period=`:
  output tax summary (output vs input VAT) from tax fields / `VoucherLineAllocation` for
  compliance filing.

---

# P3 — Hardening, platform & tests

## Phase 17 — Bug fixes & hardening
- [x] **64. Decimal precision for exchange rates** — wrap `exchange_rate` in
  `new Prisma.Decimal(...)` in `organization.service.ts → createExchangeRate` (and
  `updateCurrency` if rate stored there).
- [x] **65. Missing audit logs in Organization service** — add `auditService.log(...)`
  after each mutation in `createBranch`, `updateBranch`, `createCurrency`,
  `createVoucherSeries`, `createRole`, `updateRolePermissions`, `createUser`, `updateUser`.
- [x] **66. RBAC permission seed for new modules** — insert `user_access_permissions` rows
  for `TermsAndConditions`, `TransportationDetails`, `ProjectMaster`, `VoucherSeries`,
  `ExtraValues`, `ConfigSetting` per role; one-time `scripts/seed-permissions.ts`.
- [x] **67. Cleanup scratch files** — remove `src/scratch_db.ts`, clear `.claude/scratch/`,
  ensure `.gitignore` excludes scratch.

## Phase 18 — Platform & SAAS infra (NEW)
- [x] **68. Rate limiting + security headers** — add `express-rate-limit` (per IP/tenant on
  auth + write routes) and `helmet`; configurable CORS allowlist; request body size limit.
- [x] **69. Health/readiness probes** — keep `GET /health` (DB ping) and add
  `GET /ready` (DB + migrations check) for orchestration.
- [x] **70. OpenAPI / Swagger** — generate an OpenAPI 3 spec from Zod schemas + routes;
  serve at `GET /docs`. Single source of API contract for clients.
- [x] **71. Webhooks (design stub)** — outbound event registry table + dispatcher for SAAS
  integrations (e.g. invoice.posted, stock.low). Scope as a documented stub; implement
  delivery in a follow-up.

## Phase 19 — Integration tests
- [x] **72. T&C + Transportation CRUD lifecycle** — POST→GET→PUT→DELETE for both; assert
  403 for a role missing the permission (deny-by-default).
- [x] **73. VoucherLinkage assertions** — SalesOrder→SalesInvoice yields
  `link_type='Conversion'`; CreditNote vs SalesInvoice yields `link_type='Return'`.
- [x] **74. Stock guard rejection** — DeliveryNote over available stock → 422/400
  `'Insufficient stock'`; succeeds after a ReceiptNote stocks in.
- [x] **75. Voucher read/list** — POST a SalesInvoice, assert it appears in
  `GET /transactions/sales-invoices` and detail returns header + lines.
- [x] **76. Concurrent numbering stress** — 20 parallel SalesInvoice POSTs under one prefix
  remain gap-free.
- [x] **77. Lifecycle tests (NEW)** — Draft edit allowed / Posted edit rejected; cancel
  writes reversing GL+stock rows and flips status; post into a Locked FY rejected; sales
  post over credit limit rejected.

---

## Quick Reference — endpoints added in P0–P3

### Auth
```
GET  /auth/me
POST /auth/change-password
POST /auth/logout
```

### Organization
```
GET    /organization/companies
POST   /organization/companies            (tenant provisioning)
GET    /organization/voucher-series
POST   /organization/voucher-series
PUT    /organization/voucher-series/:id
DELETE /organization/voucher-series/:id
GET    /organization/contacts
GET    /organization/contacts/:id
PUT    /organization/contacts/:id
DELETE /organization/contacts/:id
PUT    /organization/currencies/:id
DELETE /organization/currencies/:id
DELETE /organization/branches/:id
GET    /organization/config
GET    /organization/config/:key
PUT    /organization/config/:key
GET    /organization/roles/:id
PUT    /organization/roles/:id
DELETE /organization/roles/:id
GET    /organization/users
GET    /organization/users/:id
DELETE /organization/users/:id
GET    /organization/projects
GET    /organization/projects/:id
POST   /organization/projects
PUT    /organization/projects/:id
DELETE /organization/projects/:id
POST   /organization/error-reports
GET    /organization/error-reports
PUT    /organization/error-reports/:id
```

### Accounts
```
DELETE /accounts/groups/:id
GET    /accounts/ledgers/:id/bank
PUT    /accounts/ledgers/:id/bank
GET    /accounts/ledgers/:id/credit
PUT    /accounts/ledgers/:id/credit
GET    /accounts/ledgers/:id/tax
PUT    /accounts/ledgers/:id/tax
GET    /accounts/billwise
PUT    /accounts/billwise/:id
GET    /accounts/cheque
PUT    /accounts/cheque/:id
GET    /accounts/outstanding/:ledgerId
GET    /accounts/aging
```

### Inventory
```
GET /inventory/stock-balance
GET /inventory/stock-balance/:itemId/by-godown
GET /inventory/stock-ledger/:itemId
GET /inventory/stock-ledger/godown/:godownId
GET /inventory/reports/stock-summary
GET /inventory/reports/stock-valuation
```

### Transactions — reads
```
GET /transactions/sales-invoices[/:id]
GET /transactions/purchase-invoices[/:id]
GET /transactions/payments[/:id]
GET /transactions/receipts[/:id]
GET /transactions/contra[/:id]
GET /transactions/journals[/:id]
GET /transactions/credit-notes[/:id]
GET /transactions/debit-notes[/:id]
GET /transactions/quotations[/:id]
GET /transactions/sales-orders[/:id]
GET /transactions/purchase-orders[/:id]
GET /transactions/delivery-notes[/:id]
GET /transactions/receipt-notes[/:id]
GET /transactions/godown-transfers[/:id]
GET /transactions/material-in[/:id]
GET /transactions/requirements[/:id]
GET /transactions/stock-requests[/:id]
GET /transactions/voucher-header/:id
GET /transactions/linkages/:voucherHeaderId
GET /transactions/line-relations/:detailLineId
```

### Transactions — lifecycle
```
PUT  /transactions/:type/:id            (edit, Draft only)
POST /transactions/:type/:id/cancel     (void + GL/stock reversal)
POST /transactions/:type/:id/approve
POST /transactions/:type/:id/reject
```

### Reports / insights
```
GET /transactions/reports/sales-register
GET /transactions/reports/purchase-register
GET /transactions/reports/vat-return
GET /reports/dashboard
GET /alerts
GET /search
```

### Employee
```
POST /employees/:id/salary-revision
GET  /employees/:id/attendance-summary
GET  /employee/reports/overtime
```

### Platform
```
GET /ready
GET /docs            (OpenAPI / Swagger)
```

---

## Total pending: 77 tasks across Phases 5–19 (P0: 26 · P1: 21 · P2: 16 · P3: 14)

**Deferred (explicitly out of scope for now):** file/document upload to S3, PDF print
generation, CSV/Excel export. Track separately when prioritized.
