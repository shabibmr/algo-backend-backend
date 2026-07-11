# algoERP — Entity Relationship Diagrams (Mermaid)

> Technology-neutral ER diagrams, split per domain for readability, plus a cross-module
> "soft FK" overview. Hard relationships (DB foreign keys / 1:1 shared-PK) are drawn with
> solid Mermaid relations; **application-enforced "soft FK" integer links** (no DB
> constraint) are listed separately in §6 and rendered as dotted relations where shown.
> Full attribute lists live in `BACKEND_CONTEXT.md`. Crow's-foot notation:
> `||--o{` = one-to-many, `||--||` = one-to-one, `}o--||` = many-to-one (optional).

---

## 1. Organization & System

```mermaid
erDiagram
    CompanyProfile   ||--o{ FinancialYear : "has"
    CompanyProfile   ||--o{ Branch        : "has"
    CompanyProfile   ||--o{ VoucherSeries : "defines"
    FinancialYear    ||--o{ CurrencyRate  : "scopes"
    FinancialYear    ||--o{ VoucherSeries : "scopes"
    Branch           ||--o{ VoucherSeries : "scopes"
    Branch           ||--o{ UserCredentials : "assigned"
    Currency         ||--o{ CurrencyRate  : "rates"

    UserRole         ||--o{ UserAccessPermission : "grants"
    UserRole         ||--o{ UserCredentials      : "assigned to"
    AddressBook      ||--|| UserCredentials      : "1:1 contact"
    UserCredentials  ||--o{ AuditLog             : "acts"
    UserCredentials  ||--o{ ErrorReporting       : "reports"

    ProjectMaster    ||--o{ ProjectMaster : "parent/child"
    AddressBook      ||--o{ ProjectMaster : "owner contact"

    CompanyProfile {
        int id PK
        string company_name
        string trn
        string currency
        bool is_active
    }
    FinancialYear {
        int id PK
        string fy_code
        enum status "Open|Closed|Locked"
        bool is_default
        int company_id FK
    }
    Branch {
        int id PK
        string branch_code
        bool is_head_office
        int company_id FK
    }
    Currency {
        int id PK
        string iso_code
        bool is_base_currency
    }
    CurrencyRate {
        int id PK
        date rate_date
        decimal buy_rate
        decimal sell_rate
        int currency_id FK
    }
    VoucherSeries {
        int id PK
        string voucher_type
        string prefix
        int number_length
        bool is_default
    }
    UserRole {
        int id PK
        string role_name
        bool is_system
    }
    UserCredentials {
        int id PK
        string username
        string password_hash
        int role_id FK
        int contact_id FK
    }
    UserAccessPermission {
        int id PK
        string module_name
        bool allow_create
        bool allow_read
        bool allow_update
        bool allow_delete
        bool allow_share
    }
    AddressBook {
        int id PK
        enum contact_type
        string name
        string email
    }
    ProjectMaster {
        int id PK
        string project_code
        enum project_status
        int parent_project_id FK
    }
    AuditLog {
        int id PK
        enum action
        string table_name
        string record_id
        json data
    }
    ErrorReporting {
        int id PK
        text error
        bool is_resolved
    }
    ConfigSetting {
        int id PK
        string gm_key
        string gm_value
        enum data_type
    }
    ExtraValuesTable {
        int id PK
        string type
        string object_id
        json data
    }
```

---

## 2. Accounts

```mermaid
erDiagram
    AccountGroup ||--o{ AccountGroup       : "parent/child"
    AccountGroup ||--o{ LedgerMaster       : "classifies"
    LedgerMaster ||--o{ LedgerMaster       : "sub-ledger"
    LedgerMaster ||--|| LedgerBankDetails  : "1:1"
    LedgerMaster ||--|| LedgerCreditSettings : "1:1"
    LedgerMaster ||--|| LedgerTaxSettings   : "1:1"

    AccountGroup {
        int id PK
        string group_name
        enum nature "Assets|Liabilities|Income|Expense|Capital"
        enum group_behavior "Debit|Credit"
        bool is_system_defined
        int parent_group_id FK
    }
    LedgerMaster {
        int id PK
        string ledger_code
        string ledger_name
        enum ledger_type
        decimal opening_balance
        bool is_system_defined
        int account_group_id FK
        int parent_ledger_id FK
        int contact_id "soft FK -> address_book"
    }
    LedgerBankDetails {
        int ledger_id PK_FK
        string bank_account_number
        string iban
        string swift_code
    }
    LedgerCreditSettings {
        int ledger_id PK_FK
        int credit_period_days
        decimal credit_limit
    }
    LedgerTaxSettings {
        int ledger_id PK_FK
        string trn
        int tax_category_id "soft FK"
    }
    BillwiseRecord {
        int id PK
        enum ref_type
        decimal debit_amount
        decimal credit_amount
        date due_date
        string ledger_id "legacy string FK"
    }
    ChequeDetails {
        int id PK
        enum instrument_type
        string instrument_no
        bool is_cleared
        string ledger_id "legacy string FK"
    }
```

---

## 3. Inventory

```mermaid
erDiagram
    InventoryGroup ||--o{ InventoryGroup : "parent/child"
    InventoryGroup ||--o{ InventoryItem  : "groups"
    Brand          ||--o{ InventoryItem  : "brands"
    Category       ||--o{ InventoryItem  : "categorizes"
    UOM            ||--o{ InventoryItem  : "measures"
    TaxCategories  ||--o{ InventoryItem  : "default tax"

    InventoryItem  ||--o{ SKUMaster      : "variants"
    InventoryItem  ||--o{ ItemBatch      : "batches"
    InventoryItem  ||--o{ ItemProperty   : "properties"
    InventoryItem  ||--o{ ItemImage      : "images"
    InventoryItem  ||--o{ Ingredient     : "finished (BOM)"
    InventoryItem  ||--o{ Ingredient     : "raw material (BOM)"

    Godown         ||--o{ StockLedger    : "location"
    InventoryItem  ||--o{ StockLedger    : "moves"
    SKUMaster      ||--o{ StockLedger    : "variant moves"
    ItemBatch      ||--o{ StockLedger    : "batch moves"

    PriceList      ||--o{ PriceListEntry : "entries"
    RouteMaster    ||--o{ RouteCustomerMapping : "customers"
    RouteMaster    ||--o{ RouteMapping        : "salesperson schedule"

    InventoryItem {
        int id PK
        string item_code
        string item_name
        bool is_batch_tracked
        bool is_service
        int inventory_group_id FK
    }
    SKUMaster {
        int id PK
        string sku_code
        string barcode
        enum sku_type "1=Variant|2=Bundle|3=Alt"
    }
    ItemBatch {
        int id PK
        string batch_number
        date expiration_date
        decimal cost_price
    }
    StockLedger {
        int id PK
        decimal quantity_in "XOR with out"
        decimal quantity_out "XOR with in"
        decimal unit_cost
        date posting_date
        int voucher_header_id FK
        int godown_id FK
    }
    Godown {
        int id PK
        string godown_code
        bool is_default
    }
    InventoryGroup {
        int id PK
        string group_code
        int parent_group_id FK
    }
    TaxCategories {
        int id PK
        string tax_name
        decimal tax_rate
    }
    PriceList {
        int id PK
        string price_list_name
        bool is_default
    }
    PriceListEntry {
        int id PK
        string item_id
        float price
        enum mrp2_std1_cus0
    }
```

---

## 4. Employee (HR)

```mermaid
erDiagram
    Department  ||--o{ Department  : "parent/child"
    Department  ||--o{ Designation : "has"
    Designation ||--o{ EmployeeDetails : "titled"
    Department  ||--o{ EmployeeDetails : "belongs"
    AddressBook ||--|| EmployeeDetails : "1:1 contact"

    EmployeeDetails ||--|| EmployeeBankDetails    : "1:1"
    EmployeeDetails ||--|| EmployeeSalaryDetails  : "1:1"
    EmployeeDetails ||--o{ EmployeeDocument       : "documents"
    EmployeeDetails ||--o{ SalaryRevisionHistory  : "revisions"
    EmployeeDetails ||--o{ LeaveAllocation        : "allocations"
    EmployeeDetails ||--o{ LeaveRequest           : "requests"
    EmployeeDetails ||--o{ AttendanceDetails      : "attendance"
    EmployeeDetails ||--o{ EmployeeShiftAssignment : "shifts"

    LeavePolicy ||--o{ LeaveAllocation : "governs"
    LeavePolicy ||--o{ LeaveRequest    : "type of"
    LeaveRequest ||--o{ AttendanceDetails : "links leave"
    ShiftMaster ||--o{ EmployeeShiftAssignment : "assigned"

    EmployeeDetails {
        int id PK
        string employee_code
        enum gender
        enum marital_status
        int contact_id FK
        int designation_id FK
        int department_id FK
    }
    EmployeeSalaryDetails {
        int employee_id PK_FK
        decimal basic_salary
        decimal hra
        int salary_ledger_id "soft FK"
    }
    EmployeeBankDetails {
        int employee_id PK_FK
        string account_number
        enum account_type
    }
    EmployeeDocument {
        int id PK
        enum doc_type
        date expiry_date
    }
    LeavePolicy {
        int id PK
        enum leave_type
        bool is_paid
    }
    LeaveRequest {
        int id PK
        date from_date
        date to_date
        enum status
    }
    AttendanceDetails {
        int id PK
        date working_date
        enum status
    }
    ShiftMaster {
        int id PK
        string shift_code
        bool is_night_shift
    }
```

---

## 5. Transactions (Vouchers)

```mermaid
erDiagram
    VoucherHeader ||--|| SalesInvoiceMain     : "1:1 (per type)"
    VoucherHeader ||--o{ SalesInvoiceDetail   : "lines"
    VoucherHeader ||--o{ JournalLedger        : "GL postings"
    VoucherHeader ||--o{ StockLedger          : "stock postings"
    VoucherHeader ||--|| Shipment             : "1:1 logistics"
    VoucherHeader ||--o{ VoucherLinkage       : "source links"
    VoucherHeader ||--o{ VoucherLinkage       : "target links"
    LedgerMaster  ||--o{ JournalLedger        : "posted to"
    TransactionHelper ||..|| VoucherHeader     : "numbers (lock)"

    VoucherHeader {
        int id PK
        enum voucher_type
        string voucher_prefix
        string voucher_no
        date voucher_date
    }
    TransactionHelper {
        int id PK
        string voucher_type
        string voucher_prefix
        string financial_year
        int last_number
        int number_length
        bool reset_yearly
    }
    SalesInvoiceMain {
        int voucher_header_id PK_FK
        enum voucher_status "Draft|Approved|Posted|Cancelled|Closed"
        decimal total
        decimal vat_amount
        int voucher_ledger_id FK
    }
    SalesInvoiceDetail {
        int id PK
        decimal quantity
        decimal price
        decimal tax_amount
        int item_id FK
    }
    JournalLedger {
        int id PK
        decimal debit_amount "XOR with credit"
        decimal credit_amount "XOR with debit"
        date posting_date
        int ledger_id FK
    }
    VoucherLineAllocation {
        int id PK
        enum allocation_type
        enum allocation_method
        decimal allocated_amount
        int detail_line_id "poly"
    }
    VoucherLinkage {
        int id PK
        enum link_type "Conversion|Reference|Return|Amendment"
        int source_voucher_id FK
        int target_voucher_id FK
    }
    VoucherLineRelation {
        int id PK
        string source_voucher_type
        string target_voucher_type
        decimal quantity_converted
    }
    Shipment {
        int id PK
        string carrier_name
        string lr_no
    }
```

> The 1:1 main + lines pattern shown for `SalesInvoiceMain`/`SalesInvoiceDetail` repeats
> for every voucher type (Quotation, SalesOrder, PurchaseInvoice, Payment, Receipt,
> GodownTransfer, Journal, PurchaseOrder, Credit/Debit Note, Delivery/Receipt Note, …).
> Ledger-based types (Payment/Receipt/Journal/Contra) use ledger+amount lines instead of
> item lines.

---

## 6. Cross-Module Soft-FK Overview

Application-enforced integer links **without** DB foreign-key constraints (dotted).
These are why the modules avoid hard circular dependencies.

```mermaid
erDiagram
    LedgerMaster          }o..|| AddressBook    : "contact_id"
    LedgerTaxSettings     }o..|| TaxCategories  : "tax_category_id"
    ProjectMaster         }o..|| LedgerMaster   : "associated_ledger_id"
    ProjectMaster         }o..|| Godown         : "godown_id"
    ProjectMaster         }o..|| EmployeeDetails : "coordinator_employee_id"
    BillwiseRecord        }o..|| EmployeeDetails : "salesman_id"
    ChequeDetails         }o..|| LedgerMaster   : "our_bank_id"
    InventoryGroup        }o..|| LedgerMaster   : "default sales/purchase ledger"
    InventoryItem         }o..|| LedgerMaster   : "GL & return ledgers"
    InventoryItem         }o..|| TaxCategories  : "default_tax_category"
    LedgerItemMapping     }o..|| LedgerMaster   : "ledger_id"
    LedgerItemMapping     }o..|| InventoryItem  : "item_id"
    RouteCustomerMapping  }o..|| LedgerMaster   : "customer_ledger_id"
    RouteMapping          }o..|| EmployeeDetails : "salesperson_employee_id"
    EmployeeSalaryDetails }o..|| LedgerMaster   : "salary / advance ledgers"
    SalesInvoiceMain      }o..|| AddressBook    : "billing/shipping contact"
    SalesInvoiceMain      }o..|| EmployeeDetails : "salesperson"
    SalesInvoiceMain      }o..|| ProjectMaster  : "project"
    VoucherLineAllocation }o..|| LedgerMaster   : "ledger_id"
```

> Note: GitHub/most renderers ignore the dotted `..` styling for `erDiagram` relations and
> draw them solid; the dotted intent is documentary — these links are **not** enforced by
> the database and must be validated by the application (see `BACKEND_CONTEXT.md` §11).
