# algoERP Backend — Domain & System Context (Language/Framework Independent)

> A technology-neutral specification of the algoERP backend domain. It describes
> **what** the system must model and enforce — entities, relationships, invariants,
> workflows, and API surface — without prescribing a language, framework, ORM, or
> transport. Any stack (Node, Go, Java, .NET, Python, …) can be implemented against
> this document.

---

## 1. Purpose & Scope

algoERP is an enterprise resource planning system. The backend exposes an existing
**MySQL/MariaDB** database (defined today by a Django ORM models library) as a set of
services. The database schema is a **fixed contract**: table and column names,
data types, keys, and CHECK constraints already exist and may be shared with another
application. The backend must read and write this schema faithfully and enforce the
business rules the schema implies.

**Five functional domains (modules):**

| Domain | Responsibility |
|---|---|
| Organization & System | Company, branches, financial years, currencies, users, roles, RBAC, audit, config, contacts, projects |
| Accounts | Chart of accounts, ledgers, bank/credit/tax extensions, bill-wise tracking, cheques |
| Inventory | Products, SKU variants, batches, BOM, warehouses, stock movements, pricing, routes |
| Transactions | Vouchers (header/detail), atomic numbering, double-entry GL & stock posting, document lineage |
| Employee (HR) | Employee master, payroll structure, leave, attendance, shifts |

---

## 2. Foundational Concepts (Type System)

All attribute types below are **abstract**; map them to your platform's nearest equivalent.

| Abstract type | Meaning / mapping notes |
|---|---|
| `String(n)` | Variable-length text, max length `n`. |
| `Text` | Unbounded / large text. |
| `Integer` | 32/64-bit signed integer. |
| `Decimal(p,s)` | Fixed-precision number, `p` total digits, `s` fractional. **Never** represent money/quantity as binary floating point. |
| `Boolean` | True/false (stored as small int in the DB). |
| `Date` | Calendar date, no time. |
| `DateTime` | Timestamp (treat as UTC at rest; convert at the edge). |
| `JSON` | Structured document (object/array). |
| `Binary` | Raw bytes (e.g. images/logos stored as BLOB). |
| `Enum{...}` | Closed set of string or integer codes. Validate on write. |

**Decimal precision standards (must match the schema):**
- Monetary amounts: `Decimal(18,2)`.
- Large gross totals: `Decimal(12,2)`.
- Quantities / rates: `Decimal(_,4)`.
- Exchange rates: `Decimal(18,6)`.
- Percentages / tax rates: `Decimal(5,2)`.
- Fractional days / hours: `Decimal(6,1)` or `Decimal(5,2)`.

---

## 3. Cross-Cutting Patterns (apply to all modules)

These patterns recur across nearly every entity. Implement them **once** as shared
mechanisms rather than per-entity.

### 3.1 Audit fields
Almost every table carries:
- `added_by : String` — creator identifier.
- `created_at : DateTime` — set on insert.
- `last_modified_by : String` — last editor.
- `last_modified : DateTime` — set on every update.

⚠️ The **physical column names vary** per table (e.g. `created_at`, `updated_at`,
`TimeStamp`, `last_updated`, `Date_Created`, `Last_Modified`). The persistence layer
must map a logical audit concept to the correct physical columns per table.

### 3.2 Soft delete
Masters and transactions are **never hard-deleted**. A `is_active : Boolean`
(default true) flag marks records inactive. Default reads exclude inactive rows;
an explicit "include inactive" option bypasses this.

### 3.3 System-defined / protected records
`is_system_defined` (or `is_system`) flags bootstrap data (certain ledgers, account
groups, roles) that **must not be deleted or renamed**. Deletion attempts are rejected.

### 3.4 Multi-tenancy / scoping
`CompanyProfile` is the tenant root. `FinancialYear`, `Branch`, and `VoucherSeries`
are scoped to a company. Many **master** tables (ledgers, items) are **not**
company-scoped in the schema. Therefore: apply company/branch scoping **only where the
column exists**, and document per entity. Never assume a global tenant filter.

### 3.5 Self-referential hierarchies
`AccountGroup`, `InventoryGroup`, `Department`, `LedgerMaster` (sub-ledgers), and
`ProjectMaster` (sub-projects) reference themselves via a nullable `parent_*` link.
**Invariant:** a node may not be its own ancestor. On every parent assignment, walk
the ancestor chain and reject cycles. Root nodes have a null parent.

### 3.6 One-to-one extension tables
Lean master tables with optional attribute groups split into 1:1 child tables that
**share the parent's primary key**:
- `LedgerMaster` → `LedgerBankDetails`, `LedgerCreditSettings`, `LedgerTaxSettings`.
- `EmployeeDetails` → `EmployeeBankDetails`, `EmployeeSalaryDetails`.
Child rows are created/updated/deleted atomically with the parent in one transaction.

### 3.7 Cross-module "soft" foreign keys
To avoid circular dependencies between modules, many cross-module links are stored as a
**bare integer** (or legacy string) holding the target row's id, **without** a
database-level foreign-key constraint. Examples: `LedgerMaster.contact_id → address_book`,
`InventoryItem.sales_gl_ledger_id → ledgermaster`, `*.salesperson_id → employeedetails`.
**Referential integrity for these links is the application's responsibility** — validate
existence on write; join manually on read. (See the Soft-FK Map in §11.)

### 3.8 Polymorphic extension store
`ExtraValuesTable` attaches arbitrary key-value `data` (JSON) and `hashtags` (JSON array)
to **any** entity, keyed by `(type, object_id)` — e.g. `("SalesInvoice", "123")`.
Use it for custom attributes without schema changes.

### 3.9 Runtime configuration
`ConfigSetting` is a key-value store (`gm_key` → `gm_value`) with a `data_type` used to
cast values to their real type. Drives feature flags and defaults (VAT rate, financial
year, max discount, batch-tracking toggle, …). Reads should be cached with a short TTL.

### 3.10 Audit trail & error log
- `AuditLog` (`log` table): one row per significant action — `action`
  ∈ {CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, PRINT, APPROVE, CANCEL, OTHER},
  `status` (SUCCESS/FAILURE), `table_name`, `record_id`, `data` (JSON snapshot),
  acting user, ip. Write after each mutation; config changes flagged `is_logged` also log.
- `ErrorReporting`: server/client errors for support triage.

---

## 4. Domain: Organization & System

| Entity | Table | Key attributes | Notes |
|---|---|---|---|
| CompanyProfile | `companyprofile` | company_name, branch, trn, currency (default 'AED'), currency_decimal, logo `Binary`, use_bom | Tenant root. |
| FinancialYear | `financialyear` | fy_code (unique w/ company), display_name, start_date, end_date, status `Enum{Open,Closed,Locked}`, is_default | Locked/Closed FY blocks posting. One default per company. |
| Branch | `branch` | branch_code (unique), branch_name, is_head_office | Scoped to company. |
| Currency | `currencymaster` | iso_code (unique), currency_name, symbol, decimal_places, is_base_currency | One base currency. |
| CurrencyRate | `currencyrates` | currency→Currency, rate_date (unique w/ currency), buy_rate/sell_rate/mid_rate `Decimal(18,6)` | Daily FX. |
| VoucherSeries | `voucherseries` | voucher_type, prefix, display_name, number_length, prefix_separator, starting_number, is_default, require_approval | Numbering config; unique (voucher_type, prefix, company). |
| UserRole | `userroles` | role_name (unique), description, is_system | RBAC role. |
| UserCredentials | `usercredentials` | username (unique), password_hash, role→UserRole, contact→AddressBook (1:1), employee→EmployeeDetails (opt 1:1), branch, last_login_at, password_changed_at | Auth principal. |
| UserAccessPermission | `useraccesspermissions` | role→UserRole, module_name, allow_create/read/update/delete/share `Boolean`, extras `JSON` | Granular CRUD per module per role; unique (role, module_name). |
| UserGroupPermissions | `usergrouppermissions` | flat permission flags | **Legacy — do not use** for new authorization. |
| ConfigSetting | `configsettings` | gm_key (unique), gm_value, data_type `Enum{string,integer,float,boolean,json,date}`, is_logged | See §3.9. |
| AuditLog | `log` | see §3.10 | Append-only; expose read-only. |
| ErrorReporting | `errorreporting` | error, table_name, query, is_resolved | Support triage. |
| ExtraValuesTable | `extravaluestable` | type, object_id, data `JSON`, hashtags `JSON` | See §3.8. Index (type, object_id). |
| VoucherLineRelation | `voucherlinerelations` | source_line_id, source_voucher_type, target_line_id, target_voucher_type, quantity_converted `Decimal(12,4)` | Line-level conversion lineage / pending-qty tracking. |
| AddressBook | `address_book` | contact_type `Enum{INDIVIDUAL,COMPANY,VENDOR,EMPLOYEE,OTHER}`, name, email, full address block | Central contact master. |
| ProjectMaster | `project_master` | project_code (unique), parent_project (self), project_status `Enum{Pending,Active,On Hold,Completed,Cancelled}`, dates, estimated_value; soft-FKs: associated_ledger_id, godown_id, coordinator_employee_id | Cost centre / project; self-referential. |

**Authentication contract:** `password_hash` holds a non-Django hash (bcrypt or
argon2). **Confirm the exact algorithm and parameters from real data** before building
verification, so credentials remain compatible with any co-resident application.

---

## 5. Domain: Accounts

| Entity | Table | Key attributes | Notes |
|---|---|---|---|
| AccountGroup | `accountgroups` | group_code/group_name (unique), parent_group (self), nature `Enum{Assets,Liabilities,Income,Expense,Capital}`, group_behavior `Enum{Debit,Credit}`, is_system_defined, affects_gross_profit, sequence | Chart-of-accounts tree. Expose computed `full_path`, `depth`. |
| LedgerMaster | `ledgermaster` | ledger_code (unique), ledger_name, account_group→AccountGroup, ledger_type `Enum{SundryDebtor,SundryCreditor,Bank,Cash,Expense,Income,Tax,FixedAsset,Capital,DutyTax,Stock,Other}`, parent_ledger (self), currency_code, opening_balance `Decimal(18,4)`, closing_balance, flags (is_individual, is_system_defined, is_frequent), soft-FK contact_id→address_book, denormalized contact/tax/credit fields | Atomic unit of double-entry. Expose computed `effective_balance`. |
| LedgerBankDetails | `ledgerbankdetails` | (PK=ledger) bank_account_number, iban, swift_code, bank_branch_name | 1:1 extension. |
| LedgerCreditSettings | `ledgercreditsettings` | (PK=ledger) credit_period_days, credit_limit `Decimal(15,2)`, payment_terms, caution_deposit | 1:1 extension. |
| LedgerTaxSettings | `ledgertaxsettings` | (PK=ledger) trn, tax_category (soft-FK), type_of_supply | 1:1 extension. |
| BillwiseRecord | `billwise_records` | voucher refs, ledger_id (legacy string), ref_type `Enum{New Ref,Agst Ref,Advance,On Account}`, debit_amount, credit_amount, due_date, salesman_id (soft-FK) | Bill-by-bill outstanding / ageing / settlement. |
| ChequeDetails | `cheque_details` | ledger_id (legacy string), instrument_type `Enum{Cheque,DD,NEFT,RTGS,Other}`, instrument_no, issued/presented/cleared/instrument/reconciled dates, is_presented/is_cleared/is_returned, our_bank_id (soft-FK) | PDC & bank instrument tracking, reconciliation. |

**Ledger creation rule:** a ledger and any of its 1:1 extension rows are written in a
single transaction. System-defined ledgers cannot be deleted.

---

## 6. Domain: Inventory

| Entity | Table | Key attributes | Notes |
|---|---|---|---|
| UOM | `uomlist` | uom_name (unique), uom_code | Unit of measure. |
| InventoryGroup | `salesinventorygroups` | group_name, group_code (unique), parent_group (self), sequence, soft-FKs default_sales_ledger_id / default_purchase_ledger_id | Product category tree. |
| Brand | `brands` | brand_name (unique), brand_code | |
| Category | `category` | category_name (unique), category_code | |
| InventoryItem | `salesinventoryitems` | item_name, item_code (unique), part_number, group refs (inventory_group, brand, category, uom), price/std_cost, opening & closing stock, reorder_level, flags {is_purchase_item, is_sales_item, is_stock_item, is_serialized, is_batch_tracked, is_perishable, is_service}, soft-FK GL ledgers (sales/purchase/returns), default_tax_category | Core item master. Expose `effective_stock`. |
| SKUMaster | `skumaster` | inventory_item→Item, sku_code, sku_name, barcode, rate, sku_type `Enum{1=Variant,2=Bundle,3=Alternate Unit}`, sku_possible_values `JSON` | Item variants. |
| ItemBatch | `itembatches` | inventory_item→Item, batch_number, mfg/expiry dates, cost_price `Decimal(15,4)`, selling_price | Batch/lot. Unique (item, batch_number). Expose `is_expired`. |
| ItemProperty | `salesinventoryitemproperties` | property_id, inventory_item, default_value | Variant properties. |
| ItemImage | `salesinventoryimages` | inventory_item, image `Binary`, file_name, width/height, image_type | |
| LedgerItemMapping | `ledgeritemmapping` | ledger_id, item_id (both soft-FK) | Party↔item restriction. Unique (ledger, item). |
| Ingredient (BOM) | `ingredients` | sales_item (finished), purchase_item (raw), purchase_uom, prep_route, sales_item_qty/purchase_item_qty `Decimal(12,4)` | Bill of materials / recipe. |
| Godown | `godown` | godown_code (unique), godown_name, location, is_profit_centre, is_default, is_production | Warehouse/location. |
| StockLedger | `stockledger` | voucher_header→Voucher, inventory_item, sku, batch, godown, quantity_in/quantity_out `Decimal(12,4)`, unit_cost/total_cost, posting_date | **Double-entry stock log.** See §8.2. |
| TaxCategories | `tax_categories` | tax_name (unique), tax_rate `Decimal(5,2)` | VAT/GST slab. |
| UOMConversion | `uom_conversion` | base_unit, to_unit, con_value, item_id | Conversion factors (legacy string-based). |
| PriceList | `price_lists` | price_list_name, start/end_date, is_default, show_in_pos, is_online | Named price schedule. |
| PriceListEntry | `pricelist_entries` | item_id, price, price_list→PriceList, mrp2_std1_cus0 `Enum{0=Custom,1=Standard,2=MRP}` | Per-item override. |
| RouteMaster | `route_master` | route_id (unique), route_name | Delivery/sales route. |
| RouteCustomerMapping | `route_customer_mapping` | route_master, customer_ledger_id (soft-FK) | Customer↔route. |
| RouteMapping | `route_mapping` | route_master, salesperson_employee_id (soft-FK), day_of_week `Enum{Mon..Sun}` | Salesperson schedule. |

---

## 7. Domain: Employee (HR)

| Entity | Table | Key attributes | Notes |
|---|---|---|---|
| Department | `department` | dept_code (unique), dept_name, parent_dept (self) | Hierarchical. |
| Designation | `designation` | designation_code (unique), designation_name, department | Job title. |
| EmployeeDetails | `employeedetails` | employee_code (unique), contact→AddressBook (1:1), name, gender `Enum{Male,Female,Other}`, marital_status `Enum{Single,Married,Divorced,Widowed}`, designation, department, joining/leaving dates, biometric_id | Core HR record. |
| EmployeeDocument | `employeedocuments` | employee→Employee, doc_type `Enum{Passport,Visa,EmiratesID,LabourCard,DrivingLicense,HealthCard,AirportPass,Other}`, doc_number, issue/expiry dates, visa fields | Unique (employee, doc_type); index expiry for alerts. |
| EmployeeBankDetails | `employeebankdetails` | (1:1) bank_name, account_number, iban, swift_code, account_type `Enum{Savings,Current,WPS}` | Salary disbursement. |
| EmployeeSalaryDetails | `employeesalarydetails` | (1:1) salary_ledger / advance_salary_ledger (soft-FK), basic_salary, da, hra, conveyance, overtime rates `Decimal(10,2)`, leave entitlements, working_hours, effective_from | Salary structure. |
| SalaryRevisionHistory | `salaryrevisionhistory` | employee, revision_date, before/after amounts, reason, revised_by | Immutable audit of salary changes. |
| LeavePolicy | `leavepolicy` | leave_type `Enum{Annual,Sick,Emergency,Maternity,Paternity,Unpaid,Compensatory,Other}`, max_days_*, carry_forward_limit, requires_approval, is_paid, applicable_gender | Leave-type master. |
| LeaveAllocation | `leaveallocation` | employee, leave_policy, year, allocated/carried_forward/used_days `Decimal(6,1)` | Unique (employee, policy, year). |
| LeaveRequest | `leaverequest` | employee, leave_policy, from/to_date, number_of_days, status `Enum{Pending,Approved,Rejected,Cancelled}`, approved_by | Approval workflow. |
| AttendanceDetails | `attendancedetails` | employee, working_date, check_in/out, working_hours, overtime_hours, half_day, status `Enum{PRESENT,ABSENT,HALFDAY,LEAVEPAID,LEAVEUNPAID,HOLIDAY}`, leave_request | Unique (employee, working_date). |
| ShiftMaster | `shiftmaster` | shift_code (unique), start/end_time, working_hours, break_minutes, is_night_shift | Shift definition. |
| EmployeeShiftAssignment | `employeeshiftassignment` | employee, shift, valid_from, valid_to (null=open) | Date-ranged assignment. |
| PayslipMain | `payslip_main` | employee_id (legacy), voucher refs, salary period | Payslip header. |

---

## 8. Domain: Transactions (Vouchers) — the heart of the system

### 8.1 Voucher structure
Every transactional document follows a **header + detail** shape:
- A row in `VoucherHeader` (`voucherheaders`) — the central registry of every posted
  voucher. Key: unique `(voucher_type, voucher_prefix, voucher_no)`. `voucher_type`
  ∈ {Quotation, SalesOrder, PurchaseOrder, PurchaseInvoice, SalesInvoice, Payment,
  Receipt, Journal, GodownTransfer, DebitNote, CreditNote, DeliveryNote, ReceiptNote, …}.
- A **type-specific main (header) row** sharing the header's primary key 1:1
  (e.g. `salesvouchermain`, `purchaseinvoicemain`, `quotationmain`).
- One or more **detail (line) rows** referencing the header (e.g. `salesvoucherdetails`).

**Shared header attributes** (the "VoucherMainBase" concept): party ledger, billing/
shipping contact, salesperson, project, totals (total, gross_total, vat_amount,
round_off, discount_amount/percent), `voucher_status`
`Enum{Draft,Approved,Posted,Cancelled,Closed}`, is_paid, references (reference, lpo_ref,
transaction_id), currency, delivery/expected dates, narration, audit.

**Shared line attributes** (the "VoucherDetailBase" concept): item, sku, uom,
salesperson, project, quantity, price, discount, subtotal, tax_rate, tax_amount,
item_voucher_status `Enum{0=Pending,1=Active,2=Completed,3=Cancelled}`,
item_production_status, narration.

**Two line-shape families:**
- **Item-based** lines (Quotation, SalesOrder, PurchaseInvoice, SalesInvoice,
  DeliveryNote, ReceiptNote, GodownTransfer, PurchaseOrder, Credit/Debit Note, …).
- **Ledger-based** lines (Payment, Receipt, Journal, Contra) — each line is a ledger
  + amount allocation rather than an inventory item.

Voucher-type-specific extras exist (e.g. SalesOrder/Invoice carry a `godown`;
GodownTransfer carries `from_godown`/`to_godown`; Quotation carries
`completion_probability`).

### 8.2 Double-entry posting (core invariant)
Posting a voucher must write **balanced** entries inside a single transaction:

- **Financial (General Ledger) → `journalledger`:** every posted voucher writes ≥2 rows.
  Per-row **XOR invariant**: exactly one of `debit_amount` / `credit_amount` is > 0.
  Document invariant: **Σ debit = Σ credit** across the voucher's rows.
  Typical postings:
  - SalesInvoice: Dr Debtor / Cr Sales (+ Cr Tax).
  - PurchaseInvoice: Dr Purchase / Cr Creditor (+ Dr Tax).
  - Payment: Dr Creditor / Cr Bank|Cash.
  - Receipt: Dr Bank|Cash / Cr Debtor.
  - Journal: balanced manual Dr/Cr pairs.
- **Inventory → `stockledger`:** stock-affecting vouchers write rows with the same
  **XOR invariant**: exactly one of `quantity_in` / `quantity_out` is > 0.
  - SalesInvoice/DeliveryNote: `quantity_out` from a godown.
  - PurchaseInvoice/ReceiptNote: `quantity_in` to a godown.
  - GodownTransfer: `quantity_out` from source + `quantity_in` to destination (no GL).

These CHECK constraints exist in the database. The application must **validate XOR and
balance in code before insert** so it never relies on a raw DB error for correctness.

### 8.3 Atomic voucher numbering (core invariant)
Gap-free, collision-free sequential numbers are generated via `TransactionHelper`
(`transactionhelper`), one row per `(voucher_type, voucher_prefix, financial_year)`:

```
BEGIN TRANSACTION
  lock the helper row with a pessimistic row lock   (SELECT … FOR UPDATE)
  next       = last_number + 1
  voucher_no = prefix + prefix_separator + zero_pad(next, number_length)
  set last_number = next
  INSERT VoucherHeader (and the type-specific main/detail rows)
COMMIT          -- lock released; on rollback the number is NOT consumed
```

Rules: the numbering and the voucher insert share **one** transaction (rollback must
not consume a number). Honor `reset_yearly` at financial-year rollover. Numbers must
**never** be generated outside this mechanism.

### 8.4 Posting orchestration (per voucher type)
A post operation performs, transactionally:
1. **Guards:** financial year not Closed/Locked; caller authorized for the action;
   policy checks (e.g. max discount percent).
2. **Number + header:** acquire number (§8.3), insert `VoucherHeader` + type main.
3. **Lines:** insert detail rows.
4. **Totals:** compute subtotal, tax, discount, round-off with exact `Decimal` math.
5. **GL post:** balanced `journalledger` rows (validate XOR + balance).
6. **Stock post:** `stockledger` rows where applicable (validate XOR).
7. **Bill-wise:** create/settle `billwise_records` for receivables/payables.
8. **Audit:** record CREATE/APPROVE/POST in the audit log.
Any failure rolls the entire operation back.

The orchestration differs between voucher types **only** in *which* ledgers it debits/
credits and *which* stock direction it posts — model this as per-type posting config so
one engine serves all types.

### 8.5 Supporting transaction entities

| Entity | Table | Purpose |
|---|---|---|
| JournalLedger | `journalledger` | Normalized GL log (see §8.2). Index posting_date, ledger, voucher. |
| VoucherLineAllocation | `voucherlineallocations` | Sub-line splits: allocation_type `Enum{EXPENSE,DISCOUNT,TAX,CHARGE,REBATE}`, method `Enum{BYVALUE,BYQUANTITY,BYWEIGHT,BYVOLUME,MANUAL}`. |
| VoucherLinkage | `voucherlinkage` | Header-to-header lineage: link_type `Enum{Conversion,Reference,Return,Amendment}`. Unique (source, target). |
| Shipment | `shipments` | 1:1 logistics metadata for a voucher (carrier, LR no, weight). |
| ItemPhysicalSpec | `itemphysicalspecs` | 1:1 dimension metadata per detail line (polymorphic by line id + type). |
| TermsAndConditions | `terms_and_conditions` | Reusable T&C templates for quotations/POs. |
| TransportationDetails | `transportation_details` | Dispatch tracking (loose voucher reference, no hard FK). |

### 8.6 Document lifecycle & conversions
Vouchers flow through related documents; conversions are tracked at two levels:
- **Header level** via `VoucherLinkage` (e.g. Quotation→SalesOrder is `Conversion`;
  PurchaseInvoice referencing a PurchaseOrder is `Reference`; a CreditNote against an
  invoice is `Return`).
- **Line level** via `VoucherLineRelation` with `quantity_converted`, enabling
  **partial** conversions and "pending quantity to deliver/invoice" computation, and
  preventing duplicate conversion of the same line quantity.

Typical sales flow: `Quotation → SalesOrder → DeliveryNote (+ StockLedger out) →
SalesInvoice (+ GL + bill-wise)`. Typical purchase flow: `PurchaseOrder → ReceiptNote
(+ StockLedger in) → PurchaseInvoice (+ GL + bill-wise)`.

---

## 9. Authorization Model (RBAC)

- Each `UserCredentials` has exactly one `UserRole`.
- Permissions are **per role, per module** in `UserAccessPermission`, with independent
  `allow_create / allow_read / allow_update / allow_delete / allow_share` flags and an
  `extras` JSON for additional variants.
- Every protected operation checks the relevant module + action flag and **denies by
  default** when no permission row exists.
- `module_name` values correspond to functional areas (e.g. `SalesInvoice`,
  `PurchaseOrder`, `Ledger`, `AccountGroup`).
- The legacy `UserGroupPermissions` flat-flag table is **not** used for new authorization.

---

## 10. API Surface (resource-oriented, transport-neutral)

Expose each entity as a resource supporting the standard operations, subject to RBAC and
the invariants above. Described abstractly (map to REST/GraphQL/RPC as desired):

- **Collection ops:** list (filter, sort, paginate; exclude inactive by default),
  search where noted (e.g. AddressBook, items, ledgers).
- **Item ops:** get by id, create, update, soft-delete (set `is_active=false`).
- **Relationship-aware create/update:** masters with 1:1 extensions accept the
  extension payload and persist atomically (Ledger, Employee).
- **Domain operations (beyond CRUD):**
  - Auth: `login` (verify credentials, issue session/token, update last login), `refresh`.
  - Vouchers: `post` (full orchestration §8.4), `approve`, `cancel`, `convert`
    (create a linked downstream voucher honoring partial-quantity rules).
  - Ledger: `balance` (compute `effective_balance` from opening balance + GL movements).
  - Financial year: `set-default`, `lock`/`close` (blocks posting).
  - Extras: get/set custom attributes for `(type, object_id)`.
  - Config: read typed setting values.
- **Standard response shape:** a uniform success/error envelope; list responses carry
  pagination metadata. Errors are typed (not-found, forbidden, validation, conflict,
  unauthorized) and never leak storage-layer internals.

---

## 11. Soft-FK Reference Map (application-enforced integrity)

| Source | Field | Target table |
|---|---|---|
| LedgerMaster | contact_id | address_book |
| LedgerTaxSettings | tax_category_id | tax_categories |
| ProjectMaster | associated_ledger_id | ledgermaster |
| ProjectMaster | godown_id | godown |
| ProjectMaster | coordinator_employee_id | employeedetails |
| BillwiseRecord | salesman_id | employeedetails |
| ChequeDetails | our_bank_id | ledgermaster |
| InventoryGroup | default_sales_ledger_id / default_purchase_ledger_id | ledgermaster |
| InventoryItem | sales_gl_ledger_id / default_purchase_ledger_id / default_sales_return_ledger_id / default_purchase_return_ledger_id | ledgermaster |
| LedgerItemMapping | ledger_id / item_id | ledgermaster / salesinventoryitems |
| RouteCustomerMapping | customer_ledger_id | ledgermaster |
| RouteMapping | salesperson_employee_id | employeedetails |
| EmployeeSalaryDetails | salary_ledger_id / advance_salary_ledger_id | ledgermaster |
| Voucher header/detail | billing_contact_id / shipping_contact_id | address_book |
| VoucherLineAllocation / ItemPhysicalSpec | detail_line_id (+ type) | any *details table |

On write, validate the referenced row exists (and is active where appropriate). On read,
resolve via explicit joins/lookups since no DB constraint enforces these.

---

## 12. Invariants Checklist (must hold regardless of implementation)

1. Money and quantities use exact decimal arithmetic — never binary floating point.
2. Soft delete only; system-defined records cannot be deleted.
3. Self-referential hierarchies are acyclic (validated on parent assignment).
4. 1:1 extension rows share the parent key and are written atomically with the parent.
5. Cross-module soft-FKs are validated by the application; no orphan references created.
6. Voucher numbers are gap-free, unique per (type, prefix, FY), generated only via the
   pessimistic-lock helper, never consumed on rollback.
7. GL posting: per-row debit/credit XOR **and** Σdebit = Σcredit per voucher.
8. Stock posting: per-row quantity_in/quantity_out XOR.
9. No posting into a Closed/Locked financial year.
10. Every protected operation is authorized (deny by default) and audited.
11. The database schema is a fixed contract — no destructive/conflicting migrations when
    coexisting with another application.

---

## 13. Open Items to Confirm (data-dependent)

1. **Password hashing** — exact algorithm and parameters of `usercredentials.password_hash`.
2. **Tenant scope** — whether masters (ledgers/items) are company/branch-scoped or global.
3. **Financial-year authority** — `ConfigSetting.FINANCIAL_YEAR` vs the default
   `FinancialYear` row as the source of the active FY for numbering/posting.
4. **Legacy string FKs** — `billwise_records.ledger_id`, `cheque_details.ledger_id`,
   `pricelist_entries.item_id` are stored as strings; confirm join semantics / migration.
