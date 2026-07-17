# Database Refactoring — Session Context Export

> **Exported:** 2026-07-15
> **Purpose:** A self-contained context document detailing the database analysis, decisions, and schema changes log created during this session. This file can be used to resume database refactoring in subsequent sessions.

---

## 1. Summary of Session Activities

In this session, we initiated a systematic audit of the database schema for the ERP system to prepare for database refactoring and cleanups. We focused specifically on the **Inventory** module.

1. **Database Schema Mapping**:
   * Analyzed the database structure of `sales_inventory_groups` and `sales_inventory_items` using schema files located in the parent directory (`E:/work/algo-backend/algo_db_schema.txt`).
   * Checked the mapping between the SQL schemas and the frontend models/DTOs (`InventoryGroupDto`, `InventoryGroup`, and `inventoryGroupManifest`).

2. **Created Change Log (`DB_CHANGES.md`)**:
   * Created [DB_CHANGES.md](file:///E:/work/algo-backend/DB_CHANGES.md) to record database migrations and schema changes feature by feature.
   * Documented two initial database cleanup proposals for the `sales_inventory_groups` table.

---

## 2. Table Analysis & Identifiers Clarification

We resolved why the table `sales_inventory_groups` has three identifiers: `id`, `Group_ID`, and `group_code`:
* **`id` (Integer)**: Modern auto-increment primary key used for optimal relational SQL constraints (joins, self-referencing hierarchy).
* **`Group_ID` (String)**: Legacy unique string identifier required for backwards compatibility with legacy API endpoints and views.
* **`group_code` (String)**: User-facing, readable unique business code (e.g. `'RAW'`, `'FIN-GOODS'`).

---

## 3. Documented DB Cleanups (`DB_CHANGES.md`)

The following proposed changes have been logged in [DB_CHANGES.md](file:///E:/work/algo-backend/DB_CHANGES.md):

### A. Drop `Group_ID` Column from `sales_inventory_groups`
* **Change**: Drop the legacy `Group_ID` column and its related indexes (`Group_ID`, `Group_ID_2`, `Group_ID_3`).
* **Relational Impact**: Recreate the composite index `Group_ID_3` on `(Group_Name, Parent_ID)` instead.
* **Code Impact**: Clean up DTO/manifest mapping in the frontend codebase to migrate completely to the integer `id` and/or `group_code`.

### B. Default `parent_group_id` to `0`
* **Change**: Change the column `parent_group_id` to `NOT NULL` and default it to `0` (instead of `NULL`) for root-level groups.
* **Migration SQL**:
  ```sql
  ALTER TABLE `sales_inventory_groups` MODIFY COLUMN `parent_group_id` INT(11) NOT NULL DEFAULT 0;
  ```
* **Constraint Warning**: The table has a foreign key constraint pointing back to `id`:
  `CONSTRAINT fk_inv_group_parent FOREIGN KEY (parent_group_id) REFERENCES sales_inventory_groups (id)`.
  Setting `parent_group_id` to `0` will trigger a foreign key violation on inserts/updates unless:
  1. A dummy row with `id = 0` (e.g. `'Root'`) is explicitly inserted and maintained in the table.
  2. Or the foreign key constraint is dropped/modified.

---

## 4. Column Audit for `sales_inventory_items`

We mapped the full schema of the items table (`sales_inventory_items`) from the database dump. Important findings include:
* Contains multiple duplicate boolean flags from legacy stages (e.g. `is_purchase_item` vs `isPurchaseItem`, `is_active` vs `isActive`).
* Utilizes string-based legacy foreign keys (e.g. `Group_Id`, `Default_Sales_Ledger_id`, `Brand_Id`) alongside the updated integer foreign keys (`inventory_group_id`, `sales_gl_ledger_id`, `inventory_brand_id`).

---

## 5. Files Created / Consulted

* **Created**: [DB_CHANGES.md](file:///E:/work/algo-backend/DB_CHANGES.md) (Database schema migrations log)
* **Consulted**:
  * [feature-inventory.md](file:///E:/work/algo-backend/front/docs/feature-inventory.md)
  * [inventory_group_dto.dart](file:///E:/work/algo-backend/front/lib/features/inventory_group/data/inventory_group_dto.dart)
  * [inventory_group_manifest.dart](file:///E:/work/algo-backend/front/lib/features/inventory_group/inventory_group_manifest.dart)
  * [inventory_group.dart](file:///E:/work/algo-backend/front/lib/features/inventory_group/domain/inventory_group.dart)
  * `E:/work/algo-backend/algo_db_schema.txt` (Live MySQL DDL Dump)
