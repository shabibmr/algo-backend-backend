# algoERP — Enumeration Reference Appendix

> Every closed-set field in the domain, with its codes. Use this as the single source of
> truth when defining enum/constant types in any language. **Stored value** is the literal
> persisted in the database (string unless noted "integer code"). Validate all writes
> against these sets. Source of truth is the existing schema; confirm against live data if
> a value set looks extended.

---

## Organization & System

### FinancialYear.status
| Stored | Meaning |
|---|---|
| `Open` | Postings allowed. |
| `Closed` | Period closed; postings blocked. |
| `Locked` | Hard-locked; no changes/postings. |

### AddressBook.contact_type
`INDIVIDUAL` · `COMPANY` · `VENDOR` · `EMPLOYEE` · `OTHER` (default `INDIVIDUAL`)

### ProjectMaster.project_status
`Pending` · `Active` · `On Hold` · `Completed` · `Cancelled`

### ConfigSetting.data_type
`string` · `integer` · `float` · `boolean` · `json` · `date`
(declares how `gm_value` is cast)

### AuditLog.action
`CREATE` · `UPDATE` · `DELETE` · `LOGIN` · `LOGOUT` · `EXPORT` · `PRINT` · `APPROVE` · `CANCEL` · `OTHER`

### AuditLog.status
`SUCCESS` · `FAILURE` (stored as free string; treat as these two)

### VoucherLineRelation.* voucher types
Free-form voucher-type strings (see VoucherHeader.voucher_type) used in
`source_voucher_type` / `target_voucher_type`.

---

## Accounts

### AccountGroup.nature
`Assets` · `Liabilities` · `Income` · `Expense` · `Capital`

### AccountGroup.group_behavior
`Debit` · `Credit`
(normal balance side — Assets/Expenses = Debit; Liabilities/Income/Capital = Credit)

### LedgerMaster.ledger_type
`SundryDebtor` · `SundryCreditor` · `Bank` · `Cash` · `Expense` · `Income` · `Tax`
· `FixedAsset` · `Capital` · `DutyTax` · `Stock` · `Other`

### BillwiseRecord.ref_type
`New Ref` · `Agst Ref` · `Advance` · `On Account`

### ChequeDetails.instrument_type
`Cheque` · `DD` · `NEFT` · `RTGS` · `Other`

---

## Inventory

### SKUMaster.sku_type  *(integer code)*
| Code | Meaning |
|---|---|
| `1` | Variant |
| `2` | Bundle |
| `3` | Alternate Unit |

### PriceListEntry.mrp2_std1_cus0  *(integer code)*
| Code | Meaning |
|---|---|
| `0` | Custom price |
| `1` | Standard price |
| `2` | MRP |

### RouteMapping.day_of_week
`Monday` · `Tuesday` · `Wednesday` · `Thursday` · `Friday` · `Saturday` · `Sunday`

### InventoryItem boolean flags (not enums, listed for completeness)
`is_purchase_item` · `is_sales_item` · `is_stock_item` · `is_serialized`
· `is_batch_tracked` · `is_perishable` · `is_service`

---

## Employee (HR)

### EmployeeDetails.gender
`Male` · `Female` · `Other`

### EmployeeDetails.marital_status
`Single` · `Married` · `Divorced` · `Widowed`

### EmployeeDocument.doc_type
`Passport` · `Visa` · `EmiratesID` · `LabourCard` · `DrivingLicense` · `HealthCard`
· `AirportPass` · `Other`

### EmployeeBankDetails.account_type
`Savings` · `Current` · `WPS`

### LeavePolicy.leave_type
`Annual` · `Sick` · `Emergency` · `Maternity` · `Paternity` · `Unpaid`
· `Compensatory` · `Other`

### LeavePolicy.applicable_gender
`Male` · `Female` · `(null)` = all genders

### LeaveRequest.status
`Pending` · `Approved` · `Rejected` · `Cancelled`

### AttendanceDetails.status
`PRESENT` · `ABSENT` · `HALFDAY` · `LEAVEPAID` · `LEAVEUNPAID` · `HOLIDAY`

---

## Transactions (Vouchers)

### VoucherHeader.voucher_type
`Quotation` · `SalesOrder` · `PurchaseOrder` · `PurchaseInvoice` · `SalesInvoice`
· `Payment` · `Receipt` · `Journal` · `GodownTransfer` · `DebitNote` · `CreditNote`
· `DeliveryNote` · `ReceiptNote`
(extend only in lockstep with the schema; this is the registry's closed set)

### VoucherMainBase.voucher_status  *(all voucher header types)*
`Draft` · `Approved` · `Posted` · `Cancelled` · `Closed`

### VoucherDetailBase.item_voucher_status  *(integer code, all item lines)*
| Code | Meaning |
|---|---|
| `0` | Pending |
| `1` | Active |
| `2` | Completed |
| `3` | Cancelled |

### VoucherDetailBase.item_production_status  *(integer code)*
| Code | Meaning |
|---|---|
| `0` | Pending |
| `1` | Production |
| `2` | Completed |
| `3` | Cancelled |

### VoucherLineAllocation.allocation_type
`EXPENSE` · `DISCOUNT` · `TAX` · `CHARGE` · `REBATE`

### VoucherLineAllocation.allocation_method
`BYVALUE` · `BYQUANTITY` · `BYWEIGHT` · `BYVOLUME` · `MANUAL` (default `BYVALUE`)

### VoucherLinkage.link_type
| Stored | Meaning |
|---|---|
| `Conversion` | Full document conversion (e.g. Quotation → SalesOrder). |
| `Reference` | Partial/informational reference (e.g. Invoice references PO). |
| `Return` | Credit/Debit note raised against an original. |
| `Amendment` | Revised version supersedes predecessor. |

---

## Permission actions (RBAC, UserAccessPermission flags)
Not a single enum but the fixed action set per `module_name`:
`allow_create` · `allow_read` · `allow_update` · `allow_delete` · `allow_share`
(plus arbitrary keys inside the `extras` JSON).

---

## Implementation notes
1. **Integer-coded enums** (`sku_type`, `mrp2_std1_cus0`, `item_voucher_status`,
   `item_production_status`) persist the **number**, not the label — map carefully.
2. String enums persist the **exact** literal shown (case- and space-sensitive, e.g.
   `New Ref`, `On Hold`). Do not normalize casing on write.
3. `AuditLog.status` and a few legacy fields are free strings in the schema; treat the
   listed values as the canonical set but tolerate unknowns defensively on read.
4. Keep these sets in one shared module per service and reference them everywhere
   (validation, API schemas, DB writes) to avoid drift.
