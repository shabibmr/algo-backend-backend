# Database Schema Changes Log

Tracks proposed, approved, and applied schema changes to the algoERP database, one entry per change.

## How to use this file

- Every change gets a **stable ID** (`INV-001`, `ACC-001`, …) so it can be referred to unambiguously across sessions.
- **Status** is one of: `Proposed` → `Approved` / `Rejected` / `Deferred` → `Applied`.
- Nothing is applied until the whole audit is reviewed. Audit first, apply second.

## Ground truth

> [!IMPORTANT]
> The live database is **`gm_shi_fixed`** (see `DATABASE_URL` in `backend/.env`).
>
> `E:\work\algo-backend\algo_db_schema.txt` is a **stale dump of a different database** (`gm_shi`, dumped 2026-06-12) and has substantially diverged. **Do not audit against it.**
>
> Authoritative sources, in order:
> 1. The live `gm_shi_fixed` database itself.
> 2. `backend/docs/db/live_schema.sql` — re-dumped 2026-07-15 via
>    `mysqldump --no-data --skip-comments --skip-add-drop-table -u root gm_shi_fixed`.
> 3. `backend/prisma/schema.prisma` — produced by `npx prisma db pull` against the live DB.

### How `gm_shi_fixed` differs from the stale `gm_shi` dump

Verified 2026-07-15 by diffing the fresh dump against `algo_db_schema.txt`:

| | stale `gm_shi` | live `gm_shi_fixed` |
|---|---|---|
| Tables | 140 | **153** |
| `FOREIGN KEY` constraints | 90 | **0** |
| `CHECK` constraints | 2 | 2 (`chk_debit_credit`, `chk_qty_in_out`) |

1. **All foreign keys have been stripped.** The live DB has *zero* `FOREIGN KEY` constraints. What remain are plain indexes that merely *retain the FK names* (`fk_item_group`, `fk_inv_group_parent`, …) — they enforce nothing. This matches `relationMode = "prisma"` in `prisma/schema.prisma:8`, i.e. referential integrity is enforced in the application layer, not the database. See **GEN-001**.
2. **Duplicate legacy booleans are already gone.** `isPurchaseItem`, `isSalesItem`, `IsStockItem`, `isService`, `isPerishable`, and `isActive` no longer exist on `sales_inventory_items`. Section 4 of `SESSION_CONTEXT_EXPORT_DB.md` describes columns that were already cleaned up. Ditto `Group_Name_Arabic` on `sales_inventory_groups`.
3. **Dead legacy tables are already dropped:** `old_kot_details`, `old_kot_voucher`, `quotation_details_old`, `quotation_main_old`, `test`, `test_base`.
4. **19 new tables exist** that the old dump never had — the org/employee module: `branch`, `department`, `designation`, `financialyear`, `currencymaster`, `currencyrates`, `employeebankdetails`, `employeedocuments`, `employeeshiftassignment`, `itemphysicalspecs`, `leaveallocation`, `leavepolicy`, `leaverequest`, `salaryrevisionhistory`, `shiftmaster`, `shipments`, `transactionhelper`, `voucherlinkage`, `voucherseries`.

## Migration mechanism

There is no migration framework. Per `backend/prisma/README.md`, **never** run `prisma migrate`. Each change is applied as raw DDL against MySQL, after which `npx prisma db pull && npx prisma generate` re-syncs the Prisma client.

---

## Applied — gm_db_new catch-up

> Note: `backend/.env` currently points at **`gm_db_new`**, which is closer to the older
> dump and was missing org tables that exist on `gm_shi_fixed` / in Prisma.

### ORG-FY-001 — Create missing `financialyear` table on `gm_db_new`

**Status:** Applied (2026-07-29)

**Finding:** Prisma model `financialyear` and `GET /auth/me` call
`prisma.financialyear.findFirst()`. On `gm_db_new` the table did not exist → Prisma
`db_error`: *The table `financialyear` does not exist in the current database.*
Code already soft-failed (`activeFY = null` in try/catch), but logs still recorded
level-50 errors and `/auth/me` never returned an active FY.

**DDL applied** (matches `backend/docs/db/live_schema.sql` / Prisma):

```sql
CREATE TABLE IF NOT EXISTS `financialyear` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fy_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Open','Closed','Locked') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Open',
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `company_id` int(11) NOT NULL,
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fy` (`fy_code`,`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Seed:** default open FY for `company_id = 1` (SHI BY ZAINS):

| id | fy_code | display_name | start_date | end_date   | status | is_default |
|----|---------|--------------|------------|------------|--------|------------|
| 1  | 2026-27 | FY 2026-27   | 2026-04-01 | 2027-03-31 | Open   | 1          |

**Prisma:** no schema change — model already matched this table shape.

---

### ORG-ALIGN-001 — Catch-up remaining Prisma tables on `gm_db_new`

**Status:** Applied (2026-07-29)

**Finding:** `gm_db_new` had 142 tables vs 153 Prisma models (`gm_shi_fixed`).
After ORG-FY-001, **22 tables** and **2 employee columns** were still missing.

**Script:** `backend/docs/db/gm_db_new_prisma_catchup.sql`  
(DDL sourced from `backend/docs/db/live_schema.sql`; no FK constraints.)

**Tables created (22):**

| Group | Tables |
|-------|--------|
| Org | `branch`, `currencymaster`, `currencyrates`, `voucherseries` |
| Numbering | `transactionhelper` *(not* the legacy `transaction_helper`*)* |
| Employee | `department`, `designation`, `employeebankdetails`, `employeedocuments`, `employeeshiftassignment`, `leaveallocation`, `leavepolicy`, `leaverequest`, `salaryrevisionhistory`, `shiftmaster` |
| Inventory / TX | `financial_journal_entries`, `inventory_movements`, `inventory_movement_lines`, `inventory_valuations`, `itemphysicalspecs`, `shipments`, `voucherlinkage` |

**Column alter:**

```sql
ALTER TABLE employee_details
  ADD COLUMN department_id INT NULL,
  ADD COLUMN designation_id INT NULL;
```

**Seeds applied:**

| Object | Result |
|--------|--------|
| `branch` | id=1, BR001, Main Branch, company_id=1 |
| `user_credentials.branch_id` | set to 1 where null/0 |
| `transactionhelper` | 17 voucher type/prefix rows for FY 2026-27 |
| `voucherseries` | 9 default series for company 1 |
| `currencymaster` | AED base currency |

**Verify (post-apply):**

| | Count |
|---|---|
| Prisma models | 153 |
| `gm_db_new` tables | 164 |
| Missing vs Prisma | **0** |
| Extra legacy-only tables | 11 (`transaction_helper`, `old_kot_*`, `test*`, …) |

**Prisma:** no schema change — models already matched `gm_shi_fixed`.

**Not done (optional later):** drop dead legacy tables/columns; INV-* cleanup on items/groups.

---

## 0. Cross-cutting

### GEN-001 — The database has no foreign keys at all

**Status:** Proposed — **needs a decision before any other change is applied**

**Finding:** `gm_shi_fixed` contains **zero** `FOREIGN KEY` constraints across all 153 tables. Every `fk_*` name in the schema is an ordinary index, not a constraint. Referential integrity is currently enforced *only* by application code, consistent with `relationMode = "prisma"` (`prisma/schema.prisma:8`).

**Why this matters for the whole cleanup:** the entire premise of the earlier audit was that dropping columns would collide with FK constraints. It cannot — there is nothing to collide with. Conversely, it means nothing in the database prevents an orphaned `inventory_group_id`, so "the integer FK is safe, the string FK is redundant" is an assumption we are trusting the app to have upheld.

**Decision required:** either
- **(a)** accept app-level integrity, and treat the leftover `fk_*`-named indexes as intentional (they still serve as lookup indexes) — no DDL, just documentation; or
- **(b)** restore real FK constraints as part of this cleanup, which requires first proving no orphan rows exist, and flipping `relationMode` off in Prisma.

Everything downstream of this is unaffected either way, so the audit can continue while this is decided — but it should not be forgotten.

---

## 1. Inventory Module

### INV-001 — Drop legacy `Group_ID` from `sales_inventory_groups` and `Group_Id` from `sales_inventory_items`

**Status:** Proposed

**Rationale:** `sales_inventory_groups` carries three identifiers: `id` (int PK, used by all modern relational joins and the self-referencing hierarchy), `Group_ID` (legacy varchar unique key), and `group_code` (the user-facing business code). `Group_ID` is redundant — relational mapping has migrated to `id`, and user-facing lookups to `group_code`.

`sales_inventory_items.Group_Id varchar(100) NOT NULL` is the legacy pointer *to* `sales_inventory_groups.Group_ID`, duplicating the real integer FK `inventory_group_id` (`fk_item_group`). Dropping `Group_ID` orphans it, so both must go in the same change.

**DDL:**

```sql
ALTER TABLE `sales_inventory_items`
  DROP INDEX `Group_Id`,
  DROP COLUMN `Group_Id`;

ALTER TABLE `sales_inventory_groups`
  DROP INDEX `Group_ID`,
  DROP INDEX `Group_ID_2`,
  DROP INDEX `Group_ID_3`,
  DROP COLUMN `Group_ID`;

-- Replaces the composite index Group_ID_3 (Group_ID, Group_Name, Parent_ID)
CREATE INDEX `idx_inv_group_name_parent`
  ON `sales_inventory_groups` (`Group_Name`, `parent_group_id`);
```

> [!NOTE]
> `sales_inventory_items` index `Group_Id` is the composite `(Group_Id, Brand_Id)` — it must be dropped before the column. `Brand_Id` is itself a legacy string FK slated for removal; see INV-002.

**Code impact:**
- `backend/prisma/schema.prisma` — re-pull, do not hand-edit
- `backend/src/modules/inventory/inventory.schema.ts:50` — remove required `Group_ID` from `inventoryGroupSchema`
- `backend/src/modules/inventory/inventory.schema.ts:69` — remove required `Group_Id` from `inventoryItemSchema`
- `backend/src/modules/inventory/inventory.repository.ts:87-88` — check `searchFields` / `filterFields`
- `backend/tests/integration.test.ts:212` — seeds `Group_Id: 'GRP1'`; remove
- `backend/openapi.yaml`, `backend/openapi.json`, `backend/src/core/docs/openapi.json` — regenerate via `npx tsx scripts/generate-openapi.ts`
- Frontend: `front/lib/features/inventory_group/data/inventory_group_dto.dart`, `.../domain/inventory_group.dart`, `.../inventory_group_manifest.dart` — migrate to `id` / `group_code`

**Open question:** `Parent_ID varchar(50)` (the legacy string parent pointer, superseded by `parent_group_id`) should almost certainly be dropped in the same change. Confirm nothing still reads it, then fold it in.

---

### INV-002 — Drop legacy string FK columns from `sales_inventory_items`

**Status:** Proposed
**Depends on:** INV-001 (which drops the composite index `Group_Id (Group_Id, Brand_Id)` — `Brand_Id` cannot be dropped while that index exists)

**Rationale:** The table carries string-based legacy pointers alongside the integer columns the backend actually queries and filters on (`inventory.repository.ts:103-112`). Each string column below is dead weight duplicating a live integer column.

| Legacy string column | Modern replacement |
|---|---|
| `Brand_Id` varchar(150) | `inventory_brand_id` |
| `Default_UOM_ID` varchar(100) | `uom_id` |
| `Category` varchar(100) | `category_id` |
| `Default_Sales_Ledger_id` varchar(100) | `sales_gl_ledger_id` |
| `Default_Sales_Return_Ledger` varchar(500) | `default_sales_return_ledger_id` |
| `Default_Purchase_Return_Ledger` varchar(500) | `default_purchase_return_ledger_id` |

`Default_PurchaseLedger_id` — present in the old dump — is **already gone** from the live DB; no action needed.

**DDL:**

```sql
ALTER TABLE `sales_inventory_items`
  DROP COLUMN `Brand_Id`,
  DROP COLUMN `Default_UOM_ID`,
  DROP COLUMN `Category`,
  DROP COLUMN `Default_Sales_Ledger_id`,
  DROP COLUMN `Default_Sales_Return_Ledger`,
  DROP COLUMN `Default_Purchase_Return_Ledger`;
```

> [!WARNING]
> **Three more columns are drop *candidates* but have no modern replacement — confirm before including:**
> - `Default_Input_Tax_Ledger` varchar(500) and `Default_Output_Tax_Ledger` varchar(500) — there is no `default_input_tax_ledger_id` / `..._output_...` integer column. `default_tax_category_id` points at a tax *category*, not at input/output tax *ledgers*. Dropping these removes capability rather than duplication.
> - `DefaultLedgerID` varchar(100) — unclear what it means; no equivalent. Nothing in `src/` reads it beyond passthrough.
>
> All three are accepted by the API (`inventory.schema.ts:97-100, 122`) but never read by any service. They are almost certainly dead, but "no code reads it" is weaker evidence than "a modern column replaces it".

**Code impact:**
- `backend/prisma/schema.prisma` — re-pull
- `backend/src/modules/inventory/inventory.schema.ts:92, 97-100, 102, 105, 121, 122` — remove the dropped fields from `inventoryItemSchema`
- `backend/openapi.yaml`, `backend/openapi.json`, `backend/src/core/docs/openapi.json` — regenerate
- Frontend item DTOs — remove the corresponding fields

---

### INV-003 — Consolidate audit timestamps onto `created_at` / `updated_at`

**Status:** Proposed

**Rationale:** `sales_inventory_items` has **five** timestamp columns: `created_at`, `updated_at`, `Last_Modified`, `Date_Created`, and `Timestamp` — the last three all `NOT NULL DEFAULT current_timestamp()`. `sales_inventory_groups` similarly has `Last_Modified` next to `updated_at`.

> [!IMPORTANT]
> **This is not a plain drop.** `Date_Created` and `Last_Modified` are the columns the application actually writes — `BaseRepository` is configured to use them as its audit fields:
> - `inventory.repository.ts:113-117` — items: `createdAt: 'Date_Created'`, `lastModified: 'Last_Modified'`, `lastModifiedBy: 'Last_Modified_By'`
> - `inventory.repository.ts:32, 46, 90, 194, 221, 265` — brands, categories, groups, SKUs, price lists: `lastModified: 'Last_Modified'`
> - `accounts.repository.ts:34-35` — same pattern on the accounts side
>
> Meanwhile `created_at` / `updated_at` are populated *only* by MySQL defaults. So the app writes one pair and the DB maintains another. **The code remap must land before the DDL**, or every write loses its audit trail.

**Order of operations:**
1. Repoint `auditFieldMap` to the modern columns: `createdAt: 'created_at'`, `lastModified: 'updated_at'`. Keep `lastModifiedBy: 'Last_Modified_By'` — it has no modern equivalent and is not being dropped.
2. Confirm `updated_at` carries `ON UPDATE current_timestamp()` (it does, on both tables) so it stays correct even for writes that bypass the repository.
3. Then apply the DDL.

**DDL:**

```sql
ALTER TABLE `sales_inventory_items`
  DROP COLUMN `Last_Modified`,
  DROP COLUMN `Date_Created`,
  DROP COLUMN `Timestamp`;

ALTER TABLE `sales_inventory_groups`
  DROP COLUMN `Last_Modified`;
```

`Timestamp` is read by nothing anywhere in `src/` — a pure drop.

**Scope note:** `Date_Created` / `Last_Modified` are used the same way across the **transactions** module (`phase4.service.ts`, `voucherPosting.service.ts` write `Date_Created` on eight voucher types) and **employee** (`employee.service.ts:955`). Those tables are *not* touched here — INV-003 is inventory-only. The same consolidation should be logged as `TXN-00x` / `EMP-00x` when those modules are audited, so the pattern is fixed everywhere rather than half-migrated.

---

### INV-004 — Convert `float` money/quantity columns to `decimal`

**Status:** Proposed — **behavioural change, needs the most scrutiny of the four**

**Rationale:** The table mixes correct `decimal` money columns with legacy `float` ones. `float` cannot represent decimal fractions exactly, so totals computed from `Price` will drift — the classic `0.1 + 0.2 != 0.3` rounding error, in a financial system. Per `models/CLAUDE.md`, the convention is `decimal(18,2)` for money and 4 decimal places for quantities/rates.

| Column | Current | Proposed |
|---|---|---|
| `Price` | `float NOT NULL DEFAULT 0` | `decimal(15,2) NOT NULL DEFAULT 0.00` |
| `Price_2` | `float` | `decimal(15,2)` |
| `Std_Cost` | `float DEFAULT 0` | `decimal(15,4) DEFAULT 0.0000` |
| `Opening_Value` | `float NOT NULL DEFAULT 0` | `decimal(15,2) NOT NULL DEFAULT 0.00` |
| `Opening_Balance` | `float NOT NULL DEFAULT 0` | `decimal(15,2) NOT NULL DEFAULT 0.00` |
| `Opening_Rate` | `double` | `decimal(15,4)` |
| `Vat_Rate` | `float NOT NULL DEFAULT 0` | `decimal(5,2) NOT NULL DEFAULT 0.00` |
| `Opening_Stock` | `float` | `decimal(15,4)` |
| `Closing_Stock` | `float DEFAULT 0` | `decimal(15,4) DEFAULT 0.0000` |
| `Reorder_Level` | `float NOT NULL DEFAULT 0` | `decimal(15,4) NOT NULL DEFAULT 0.0000` |

**DDL:**

```sql
ALTER TABLE `sales_inventory_items`
  MODIFY COLUMN `Price`           decimal(15,2) NOT NULL DEFAULT 0.00,
  MODIFY COLUMN `Price_2`         decimal(15,2) DEFAULT NULL,
  MODIFY COLUMN `Std_Cost`        decimal(15,4) DEFAULT 0.0000,
  MODIFY COLUMN `Opening_Value`   decimal(15,2) NOT NULL DEFAULT 0.00,
  MODIFY COLUMN `Opening_Balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  MODIFY COLUMN `Opening_Rate`    decimal(15,4) DEFAULT NULL,
  MODIFY COLUMN `Vat_Rate`        decimal(5,2)  NOT NULL DEFAULT 0.00,
  MODIFY COLUMN `Opening_Stock`   decimal(15,4) DEFAULT NULL,
  MODIFY COLUMN `Closing_Stock`   decimal(15,4) DEFAULT 0.0000,
  MODIFY COLUMN `Reorder_Level`   decimal(15,4) NOT NULL DEFAULT 0.0000;
```

> [!WARNING]
> **This changes the API response shape.** Prisma maps MySQL `decimal` to its `Decimal` type, not to a JS `number` — the existing `decimal` columns (`base_price`, `standard_cost`, `moving_average_cost`, `opening_stock_value`) already come back as `Decimal` and serialize to a **string** in JSON, whereas `Price` currently serializes as a number. Converting `Price` flips `{"Price": 100}` to `{"Price": "100.00"}` for every consumer.
>
> Before applying, decide how to handle it:
> - **(a)** serialize `Decimal` → `number` centrally in the response layer, so the API contract is unchanged and *already-inconsistent* columns get fixed too; or
> - **(b)** accept the string shape and update the frontend DTOs and OpenAPI to match.
>
> Option (a) is preferable — the API is currently inconsistent (some money fields are numbers, some are strings) and (a) fixes that as a side effect. The Zod input schemas (`z.number()`) keep working either way, since Prisma accepts a JS number when writing a `Decimal` column.

**Open question — `Price` vs `base_price`:** the table has *both* `Price` (float, legacy, what the API writes) and `base_price` (`decimal(15,2)`, modern, apparently unused). These look like the same concept. Rather than converting `Price`, the cleaner endgame may be to migrate the data into `base_price` and drop `Price` entirely. Worth resolving before doing the type conversion, so we don't convert a column we intend to delete.

**Code impact:**
- `backend/prisma/schema.prisma` — re-pull; `Float` fields become `Decimal`
- `backend/src/core/` — response serialization, if option (a)
- `backend/openapi.*` — regenerate; number → string types if option (b)
- Frontend item DTOs — `double` → `String`/`Decimal` parsing, if option (b)

---

### INV-005 — Legacy boolean duplicates and POS/restaurant leftovers

**Status:** Proposed — *not yet worked up; captured so it isn't lost*

Two clusters remain on `sales_inventory_items` after INV-001…004:

- **Boolean duplicates:** `isSerailNumbered` (note the typo) duplicates `is_serialized`; `isBatchProcessed` duplicates `is_batch_tracked`. Both are still accepted by the API (`inventory.schema.ts:123-124`) with defaults, so a drop needs the schema updated too. `isCustomItem` and `Favourite` have no snake_case counterpart — confirm whether they are live features before dropping.
- **POS/restaurant leftovers:** `KOT_Printer`, `From_Time`, `To_Time`, `Section`, `Flags` (longtext). These belong to the restaurant/KOT product, not to an ERP item master. Their sibling tables (`old_kot_*`) have already been dropped from the live DB, which suggests the KOT feature is retired — worth confirming, then dropping the columns.

---

## 2. Accounts Module

*Pending audit.*

---

## 3. Transactions Module

*Pending audit.*

---

## 4. Organization Module

*Pending audit.*

---

## 5. Employee Module

*Pending audit.*

---

## Rejected proposals

### ~~INV-R01 — Default `parent_group_id` to `0`~~

**Status:** Rejected (2026-07-15)

**Original proposal:** `ALTER TABLE sales_inventory_groups MODIFY COLUMN parent_group_id INT(11) NOT NULL DEFAULT 0;` — so root-level groups point at `0` instead of `NULL`.

**Why rejected:** `NULL` is the correct SQL representation of "no parent". A `0` default means a sentinel `id = 0` "Root" row must be created and maintained forever — which additionally needs `NO_AUTO_VALUE_ON_ZERO` in `sql_mode` to insert at all — and every `IS NULL` root check in the codebase would have to change. The backend's hierarchy cycle-guard in `inventory.service.ts` already treats `NULL` as the root terminator, correctly.

The original doc's stated blocker (that the self-FK `fk_inv_group_parent` would reject `0`) turns out to be **factually wrong** — that FK does not exist in the live DB; see **GEN-001**. The proposal is rejected on design grounds regardless. Kept here so the idea is not re-proposed.
