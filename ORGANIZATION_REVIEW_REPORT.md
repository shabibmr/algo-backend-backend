# Code Review Report — Organization Module

**Status:** Draft | **Date:** 2026-06-14  
**Target Module:** `src/modules/organization`  
**Reference Standards:** [CODE_GUIDE.md](file:///E:/work/algo-backend/models/backend/CODE_GUIDE.md) & [IMPLEMENTATION_PLAN.md](file:///E:/work/algo-backend/models/backend/IMPLEMENTATION_PLAN.md)

---

## 1. Architectural & Dependency Principles

### Missing Controller to Service Delegation & Business Rules Leakage
*   **Company Profile Default Fallback:** In `listBranches` ([organization.controller.ts:L95](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.controller.ts#L95)), there is a fallback to a default company profile ID: `const company_id = req.user?.companyId || 1;`. This fallback logic is business rule orchestration and should live in the service layer or be retrieved from a config/tenant context, not hardcoded in the controller.
*   **Query Parsing Responsibility:** In `listFinancialYears` ([organization.controller.ts:L43](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.controller.ts#L43)), the controller determines whether to use the query parameter or the authenticated user's company context: `const company_id = companyId ? Number(companyId) : req.user?.companyId;`. This context orchestration should be deferred to the service layer.

### Missing Validation Middleware on Routes
*   The `updateFinancialYear` route ([organization.routes.ts:L46-49](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.routes.ts#L46-49)) is missing the `validate(financialYearSchema)` middleware.
*   The `updateExtras` route ([organization.routes.ts:L99](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.routes.ts#L99)) is missing validation. It accepts a `possibleValues` body but has no accompanying Zod schema in `organization.schema.ts` to enforce constraints.
*   The `updateRolePermissions` route ([organization.routes.ts:L112-117](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.routes.ts#L112-117)) validates the shape using `validate(permissionsSchema)`. However, the path parameter `roleId` is never validated as numeric via schema params, violating the guideline that Zod schemas should validate `body`, `query`, and `params` together.

---

## 2. Validation & Input Contracts (`organization.schema.ts`)

The Zod schemas in [organization.schema.ts](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.schema.ts) do not strictly bound string values to their actual column widths in MySQL, violating the requirement: **"Bound every string with `.max()` to match the column width."**

### Discrepancies with Database Schema Columns:
1.  **`financialYearSchema`**:
    *   `start_date` and `end_date` are parsed as strings using `.regex()`. Since MySQL stores these as `Date`, they should be transformed or validated using `z.string().datetime()` or parsed and validated cleanly as Dates, then validated in the service that `start_date < end_date`.
2.  **`branchSchema`**:
    *   `branch_code` is bounded to `.max(50)`, matching `varchar(50)`.
    *   `branch_name` is bounded to `.max(150)`, matching `varchar(150)`.
    *   `address` lacks a `.max(500)` bound (`address` is `varchar(500)` in `branch` table).
3.  **`currencySchema`**:
    *   `symbol` uses `.max(10)`, matching `varchar(10)`.
    *   `currency_name` is `.max(100)`, matching `varchar(100)`.
4.  **`currencyRateSchema`**:
    *   `buy_rate`, `sell_rate`, and `mid_rate` are validated as simple JS numbers: `z.number().positive()`. The database stores these as `Decimal(18, 6)`. These must be parsed using `z.string()` or `z.any()` and cast to `Prisma.Decimal` to prevent float precision issues.
5.  **`addressBookSchema`**:
    *   `Address_Id` is `varchar(500)` in MySQL. The schema has `.min(1)` but lacks a `.max(500)` bound.
    *   `Name` is `varchar(1000)`. The schema uses `.max(1000)`.
    *   `Designation` is `varchar(500)`. Schema has no bound.
    *   `Company_Name` is `varchar(500)`. Schema has no bound.
    *   `Email` is `varchar(500)`. Schema uses `z.string().email()`, but has no `.max(500)` bound.
    *   `Phone_Number`, `Mobile_Number`, `Building`, `Street`, `City`, and `Country` are all missing `.max()` boundaries matching their database fields.

---

## 3. Data Integrity, Auditing & Decimals

### Numeric and Floating-Point Precision Issues
*   **Currency Rates:** In `createExchangeRate` ([organization.service.ts:L185-198](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.service.ts#L185-198)) and `currencyRateSchema`, exchange rates are accepted as standard JavaScript numbers. The database schema designates these as `Decimal(18, 6)`. Using native numbers results in floating-point inaccuracies. These rates must be handled using `Prisma.Decimal`.

### Repository Audit Mappings
In [organization.repository.ts](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.repository.ts), multiple repositories set audit fields to `null`:
*   `FinancialYearRepository`: `softDeleteField` is `null` (correct), but `auditFieldMap` only has `lastModified: 'updated_at'`. It is missing `addedBy: 'added_by'`.
*   `CurrencyRateRepository`: `added_by` exists in the database `currencyrates` table but `auditFieldMap` maps `lastModified` to `null`.
*   `UserCredentialsRepository`: Has `updated_at` but is missing mappings for `added_by` or `created_at` parameters if handled dynamically.

### Missing Audit Logs
Services must call `auditService.log` for meaningful mutations. Currently:
*   `updateCompanyProfile`, `createBranch`, `updateBranch`, `createCurrency`, `updateCurrency`, `createExchangeRate`, `createVoucherSeries`, `createContact`, `updateContact`, `updateExtras`, `createRole`, `createUser`, and `updateUser` **do not write any audit logs** via `auditService.log`. This violates the standard to record significant mutations.

---

## 4. Security, Auth & Tenancy

### Tenant Context Isolation
*   **User Credentials Creation:** `createUser` ([organization.service.ts:L332-355](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.service.ts#L332-355)) creates credentials without validating whether the creating user has permission to assign users to the targeted `branch_id`.
*   **Voucher Series Listing:** `listVoucherSeries` ([organization.service.ts:L200-206](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.service.ts#L200-206)) filters on `company_id` but does not prevent cross-tenant queries if `companyId` is supplied arbitrarily by an unprivileged client query parameter.

### Extra Values Authorization Route Safeguard
*   The `extras` endpoints (`GET` and `PUT` `/extras/:type/:objectId` in [organization.routes.ts:L98-99](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.routes.ts#L98-99)) completely bypass the `authorize` middleware, exposing polymorphic data stores to arbitrary authenticated users without module-specific scope verification.

---

## 5. Action Items Summary

1.  **Refactor Schemas:** Update [organization.schema.ts](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.schema.ts) to define maximum length bounds (`.max()`) matching MySQL columns, and use `Prisma.Decimal` for currency exchange rates.
2.  **Add Route Validations:** Mount `validate` middleware to `updateFinancialYear`, `updateExtras`, and write missing validation wrappers.
3.  **Inject Auditing:** Integrate `auditService.log` inside all mutation methods in [organization.service.ts](file:///E:/work/algo-backend/models/backend/src/modules/organization/organization.service.ts) (create, update, delete operations).
4.  **Secure Extras Route:** Add authorization middleware `authorize(...)` to the `/extras` routes.
5.  **Audit Repository Mappings:** Map `added_by` columns to repository configurations where supported by the underlying table schemas.
