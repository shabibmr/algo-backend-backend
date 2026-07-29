-- gm_db_new catch-up to Prisma / gm_shi_fixed
-- No FOREIGN KEY constraints (relationMode=prisma).
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- branch
CREATE TABLE IF NOT EXISTS `branch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `branch_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int(11) NOT NULL,
  `address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_branch_code` (`branch_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- currencymaster
CREATE TABLE IF NOT EXISTS `currencymaster` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `iso_code` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `decimal_places` int(11) NOT NULL DEFAULT 2,
  `is_base_currency` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_iso_code` (`iso_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- currencyrates
CREATE TABLE IF NOT EXISTS `currencyrates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `currency_id` int(11) NOT NULL,
  `rate_date` date NOT NULL,
  `buy_rate` decimal(18,6) NOT NULL,
  `sell_rate` decimal(18,6) NOT NULL,
  `mid_rate` decimal(18,6) DEFAULT NULL,
  `financial_year_id` int(11) DEFAULT NULL,
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_currency_date` (`currency_id`,`rate_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- department
CREATE TABLE IF NOT EXISTS `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dept_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dept_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_dept_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dept_code` (`dept_code`),
  KEY `fk_dept_parent` (`parent_dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- designation
CREATE TABLE IF NOT EXISTS `designation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `designation_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_desig_code` (`designation_code`),
  KEY `fk_desig_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- shiftmaster
CREATE TABLE IF NOT EXISTS `shiftmaster` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shift_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `working_hours` decimal(4,1) NOT NULL,
  `break_minutes` int(11) NOT NULL DEFAULT 0,
  `is_night_shift` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_shift_code` (`shift_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- leavepolicy
CREATE TABLE IF NOT EXISTS `leavepolicy` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `leave_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_days_per_year` int(11) NOT NULL DEFAULT 0,
  `max_days_per_request` int(11) DEFAULT NULL,
  `carry_forward_limit` int(11) NOT NULL DEFAULT 0,
  `requires_approval` tinyint(1) NOT NULL DEFAULT 1,
  `is_paid` tinyint(1) NOT NULL DEFAULT 1,
  `applicable_gender` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_leave_type` (`leave_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- transactionhelper
CREATE TABLE IF NOT EXISTS `transactionhelper` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_prefix` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `financial_year` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_number` int(11) NOT NULL DEFAULT 0,
  `number_length` int(11) NOT NULL DEFAULT 5,
  `prefix_separator` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '/',
  `reset_yearly` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_seq` (`voucher_type`,`voucher_prefix`,`financial_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- voucherseries
CREATE TABLE IF NOT EXISTS `voucherseries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prefix` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `financial_year_id` int(11) DEFAULT NULL,
  `number_length` int(11) NOT NULL DEFAULT 5,
  `prefix_separator` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '/',
  `starting_number` int(11) NOT NULL DEFAULT 1,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `require_approval` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_series` (`voucher_type`,`prefix`,`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- voucherlinkage
CREATE TABLE IF NOT EXISTS `voucherlinkage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_voucher_id` int(11) NOT NULL,
  `target_voucher_id` int(11) NOT NULL,
  `link_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `narration` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_linkage` (`source_voucher_id`,`target_voucher_id`),
  KEY `idx_linkage_source` (`source_voucher_id`),
  KEY `idx_linkage_target` (`target_voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- shipments
CREATE TABLE IF NOT EXISTS `shipments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucherheaderid` int(11) NOT NULL,
  `carrier_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lr_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `boxes_count` int(11) NOT NULL DEFAULT 0,
  `total_weight` double NOT NULL DEFAULT 0,
  `shipped_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shipments_voucherheaderid_key` (`voucherheaderid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- itemphysicalspecs
CREATE TABLE IF NOT EXISTS `itemphysicalspecs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `detail_line_id` int(11) NOT NULL,
  `detail_line_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `length` double DEFAULT NULL,
  `dimension` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spec_notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_detail_line_spec` (`detail_line_id`,`detail_line_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- financial_journal_entries
CREATE TABLE IF NOT EXISTS `financial_journal_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `ledger_account_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `debit_amount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `credit_amount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_fin_jou_voucher` (`voucher_id`),
  KEY `fk_fin_jou_ledger` (`ledger_account_id`),
  KEY `fk_fin_jou_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- inventory_movements
CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `voucher_id` int(11) NOT NULL,
  `from_location_id` int(11) DEFAULT NULL,
  `to_location_id` int(11) DEFAULT NULL,
  `quantity_expected` float NOT NULL DEFAULT 0,
  `quantity_done` float NOT NULL DEFAULT 0,
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('Draft','Reserved','Done') NOT NULL DEFAULT 'Draft',
  PRIMARY KEY (`id`),
  KEY `fk_inv_move_item` (`item_id`),
  KEY `fk_inv_move_voucher` (`voucher_id`),
  KEY `fk_inv_move_from_loc` (`from_location_id`),
  KEY `fk_inv_move_to_loc` (`to_location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- inventory_movement_lines
CREATE TABLE IF NOT EXISTS `inventory_movement_lines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `movement_id` int(11) NOT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `quantity` float NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_inv_mov_line_mov` (`movement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- inventory_valuations
CREATE TABLE IF NOT EXISTS `inventory_valuations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `movement_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` float NOT NULL,
  `unit_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `total_value` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `consumed_quantity` float NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_inv_val_mov` (`movement_id`),
  KEY `fk_inv_val_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- employeedocuments
CREATE TABLE IF NOT EXISTS `employeedocuments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `doc_type` enum('Passport','Visa','EmiratesID','LabourCard','DrivingLicense','HealthCard','AirportPass','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `doc_number` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `place_of_issue` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_custody` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visa_status` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visa_sponsor` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `airport_pass_status` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_doctype` (`employee_id`,`doc_type`),
  KEY `idx_empd_expiry` (`expiry_date`),
  KEY `fk_empd_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- employeebankdetails
CREATE TABLE IF NOT EXISTS `employeebankdetails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_branch` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_bank` (`employee_id`),
  KEY `fk_empbank_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- salaryrevisionhistory
CREATE TABLE IF NOT EXISTS `salaryrevisionhistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `revision_date` date NOT NULL,
  `basic_salary_before` decimal(10,2) DEFAULT NULL,
  `basic_salary_after` decimal(10,2) DEFAULT NULL,
  `gross_before` decimal(12,2) DEFAULT NULL,
  `gross_after` decimal(12,2) DEFAULT NULL,
  `revision_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revised_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sal_rev_emp` (`employee_id`),
  KEY `idx_sal_rev_date` (`revision_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- leaveallocation
CREATE TABLE IF NOT EXISTS `leaveallocation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_policy_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `allocated_days` decimal(6,1) NOT NULL DEFAULT 0.0,
  `carried_forward` decimal(6,1) NOT NULL DEFAULT 0.0,
  `used_days` decimal(6,1) NOT NULL DEFAULT 0.0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_leave_alloc` (`employee_id`,`leave_policy_id`,`year`),
  KEY `fk_leavealloc_policy` (`leave_policy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- leaverequest
CREATE TABLE IF NOT EXISTS `leaverequest` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_policy_id` int(11) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `number_of_days` decimal(5,1) NOT NULL,
  `reason` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `applied_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_leavereq_emp` (`employee_id`),
  KEY `fk_leavereq_policy` (`leave_policy_id`),
  KEY `idx_leavereq_status` (`status`),
  KEY `idx_leavereq_from` (`from_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- employeeshiftassignment
CREATE TABLE IF NOT EXISTS `employeeshiftassignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `valid_from` date NOT NULL,
  `valid_to` date DEFAULT NULL,
  `assigned_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `added_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_shiftassign_emp` (`employee_id`),
  KEY `idx_shiftassign_dates` (`valid_from`,`valid_to`),
  KEY `fk_shiftassign_shift` (`shift_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- employee_details columns required by Prisma
SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA=@db AND TABLE_NAME='employee_details' AND COLUMN_NAME='department_id') = 0,
    'ALTER TABLE employee_details ADD COLUMN department_id INT NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA=@db AND TABLE_NAME='employee_details' AND COLUMN_NAME='designation_id') = 0,
    'ALTER TABLE employee_details ADD COLUMN designation_id INT NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Minimal seeds
INSERT INTO branch (id, branch_code, branch_name, company_id, address, is_active)
SELECT 1, 'BR001', 'Main Branch', 1, NULL, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM branch WHERE id = 1 OR branch_code = 'BR001');

UPDATE user_credentials
SET branch_id = 1
WHERE branch_id IS NULL OR branch_id = 0;

INSERT INTO transactionhelper
  (voucher_type, voucher_prefix, financial_year, last_number, number_length, prefix_separator, reset_yearly, is_active, added_by)
SELECT v.voucher_type, v.voucher_prefix, '2026-27', 0, 5, '/', 1, 1, 'system'
FROM (
  SELECT 'SalesInvoice' AS voucher_type, 'SI' AS voucher_prefix UNION ALL
  SELECT 'PurchaseInvoice', 'PI' UNION ALL
  SELECT 'SalesOrder', 'SO' UNION ALL
  SELECT 'PurchaseOrder', 'PO' UNION ALL
  SELECT 'DeliveryNote', 'DN' UNION ALL
  SELECT 'ReceiptNote', 'RN' UNION ALL
  SELECT 'Quotation', 'QT' UNION ALL
  SELECT 'PaymentVoucher', 'PV' UNION ALL
  SELECT 'ReceiptVoucher', 'RV' UNION ALL
  SELECT 'JournalVoucher', 'JV' UNION ALL
  SELECT 'ContraVoucher', 'CV' UNION ALL
  SELECT 'CreditNote', 'CN' UNION ALL
  SELECT 'DebitNote', 'DN2' UNION ALL
  SELECT 'StockJournal', 'SJ' UNION ALL
  SELECT 'GodownTransfer', 'GT' UNION ALL
  SELECT 'MaterialIn', 'MI' UNION ALL
  SELECT 'WastageEntry', 'WE'
) v
WHERE NOT EXISTS (
  SELECT 1 FROM transactionhelper t
  WHERE t.voucher_type = v.voucher_type
    AND t.voucher_prefix = v.voucher_prefix
    AND t.financial_year = '2026-27'
);

INSERT INTO voucherseries
  (voucher_type, prefix, display_name, company_id, branch_id, financial_year_id,
   number_length, prefix_separator, starting_number, is_default, is_active, require_approval)
SELECT v.voucher_type, v.prefix, v.display_name, 1, 1, 1, 5, '/', 1, 1, 1, 0
FROM (
  SELECT 'SalesInvoice' AS voucher_type, 'SI' AS prefix, 'Sales Invoice' AS display_name UNION ALL
  SELECT 'PurchaseInvoice', 'PI', 'Purchase Invoice' UNION ALL
  SELECT 'SalesOrder', 'SO', 'Sales Order' UNION ALL
  SELECT 'PurchaseOrder', 'PO', 'Purchase Order' UNION ALL
  SELECT 'DeliveryNote', 'DN', 'Delivery Note' UNION ALL
  SELECT 'ReceiptNote', 'RN', 'Receipt Note' UNION ALL
  SELECT 'PaymentVoucher', 'PV', 'Payment Voucher' UNION ALL
  SELECT 'ReceiptVoucher', 'RV', 'Receipt Voucher' UNION ALL
  SELECT 'JournalVoucher', 'JV', 'Journal Voucher'
) v
WHERE NOT EXISTS (
  SELECT 1 FROM voucherseries s
  WHERE s.voucher_type = v.voucher_type AND s.prefix = v.prefix AND s.company_id = 1
);

INSERT INTO currencymaster (iso_code, currency_name, symbol, decimal_places, is_base_currency, is_active)
SELECT 'AED', 'UAE Dirham', 'AED', 2, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM currencymaster WHERE iso_code = 'AED');

SET FOREIGN_KEY_CHECKS=1;
