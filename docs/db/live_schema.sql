
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_code` varchar(50) DEFAULT NULL,
  `parent_group_id` int(11) DEFAULT NULL,
  `Group_Name` varchar(50) NOT NULL,
  `is_system_defined` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_group_parent` (`parent_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `address_book` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contact_type` enum('INDIVIDUAL','COMPANY','VENDOR','EMPLOYEE','OTHER') NOT NULL DEFAULT 'INDIVIDUAL',
  `Address_Id` varchar(500) NOT NULL,
  `Name` varchar(1000) DEFAULT NULL,
  `Designation` varchar(500) DEFAULT NULL,
  `Company_Name` varchar(500) DEFAULT NULL,
  `Email` varchar(500) DEFAULT NULL,
  `Ledger` varchar(1000) DEFAULT NULL,
  `Narration` varchar(1000) DEFAULT NULL,
  `TimeStamp` datetime DEFAULT current_timestamp(),
  `Building` varchar(500) DEFAULT NULL,
  `Street` varchar(500) DEFAULT NULL,
  `City` varchar(500) DEFAULT NULL,
  `Country` varchar(500) DEFAULT NULL,
  `POBox` varchar(100) DEFAULT NULL,
  `Phone_Number` varchar(100) DEFAULT NULL,
  `Mobile_Number` varchar(100) DEFAULT NULL,
  `Location` varchar(1000) DEFAULT NULL,
  `Address` varchar(1000) DEFAULT NULL,
  `Fax` varchar(100) DEFAULT NULL,
  `Location_Details` longtext DEFAULT NULL,
  `Route` varchar(20) DEFAULT NULL,
  `CustomerCode` varchar(20) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `Contact_Uuid` varchar(100) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 0,
  `Delivery_Charges` float(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attendance_employee_id` int(11) DEFAULT NULL,
  `working_date` date DEFAULT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `Employee_Id` varchar(20) NOT NULL,
  `Working_Day` date NOT NULL,
  `Start_Time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `End_Time` timestamp NULL DEFAULT NULL,
  `Working_Hours` int(11) NOT NULL,
  `overtime_hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status` enum('PRESENT','ABSENT','HALF_DAY','LEAVE_PAID','LEAVE_UNPAID','HOLIDAY') NOT NULL DEFAULT 'PRESENT',
  `OverTime` int(11) NOT NULL,
  `HalfDay` tinyint(1) NOT NULL,
  `Narration` varchar(200) DEFAULT NULL,
  `leave_request_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_attendance_employee` (`attendance_employee_id`),
  KEY `fk_att_leaverequest` (`leave_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `billwise_records` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `voucherPrefix` varchar(50) DEFAULT NULL,
  `VoucherType` varchar(200) DEFAULT NULL,
  `VoucherNo` varchar(200) DEFAULT NULL,
  `LedgerID` varchar(200) DEFAULT NULL,
  `RefType` varchar(50) DEFAULT NULL,
  `RefNo` varchar(200) DEFAULT NULL,
  `RefPrefix` varchar(200) DEFAULT NULL,
  `DebitAmount` float(10,2) DEFAULT NULL,
  `CreditAmount` float(10,2) DEFAULT NULL,
  `VoucherDate` datetime DEFAULT NULL,
  `Method_of_adj` varchar(100) DEFAULT NULL,
  `Due_Date` date DEFAULT NULL,
  `Salesman_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `boq_table` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Item_ID` varchar(100) NOT NULL,
  `Item_Qty` float(6,2) DEFAULT NULL,
  `Item_UOM` varchar(100) DEFAULT NULL,
  `Item_UOM_Conv` float(6,2) DEFAULT NULL,
  `Item_Rate` float(6,2) DEFAULT NULL,
  `Item_Description` varchar(500) DEFAULT NULL,
  `ItemRequirementID` varchar(100) DEFAULT NULL,
  `TransactionID` varchar(100) DEFAULT NULL,
  `Section_ID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `branch` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Brand_Name` varchar(150) NOT NULL,
  `Brand_Description` varchar(2000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `Last_Modified` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_brand_name` (`Brand_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_code` varchar(50) DEFAULT NULL,
  `category_name` varchar(20) DEFAULT NULL,
  `Description` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code` (`category_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheque_details` (
  `_id` int(10) NOT NULL AUTO_INCREMENT,
  `ledger_id` varchar(25) NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `branch_name` varchar(100) DEFAULT NULL,
  `Instrument_No` varchar(50) DEFAULT NULL,
  `VoucherType` varchar(100) DEFAULT NULL,
  `VoucherNo` varchar(100) DEFAULT NULL,
  `VoucherPrefix` varchar(100) DEFAULT NULL,
  `Issued_On` date DEFAULT NULL,
  `Presented_On` date DEFAULT NULL,
  `Cleared_On` date DEFAULT NULL,
  `Instrument_Date` date DEFAULT NULL,
  `is_Presented` tinyint(1) DEFAULT NULL,
  `is_Cleared` tinyint(1) DEFAULT NULL,
  `is_Returned` tinyint(1) DEFAULT NULL,
  `Reconciled_On` date DEFAULT NULL,
  `Narration` varchar(250) DEFAULT NULL,
  `debit_amount` decimal(10,2) DEFAULT NULL,
  `credit_amount` decimal(10,2) DEFAULT NULL,
  `Instrument_Type` varchar(20) DEFAULT NULL,
  `Added_By` varchar(50) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Our_Bank_ID` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `companyprofile` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Company_Name` varchar(100) DEFAULT NULL,
  `Branch` varchar(100) DEFAULT NULL,
  `AddressLine` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Phone_Number` varchar(100) DEFAULT NULL,
  `WebSite` varchar(100) DEFAULT NULL,
  `TRN` varchar(100) DEFAULT NULL,
  `Logo` mediumblob DEFAULT NULL,
  `Manager_Name` varchar(100) DEFAULT NULL,
  `Currency` varchar(100) DEFAULT NULL,
  `Currency_Decimal` int(11) DEFAULT 2,
  `Bill_Tag_Line` varchar(100) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `LedgerId` varchar(100) DEFAULT NULL,
  `Location` varchar(100) DEFAULT NULL,
  `Building` varchar(100) DEFAULT NULL,
  `POBox` varchar(100) DEFAULT NULL,
  `Street` varchar(100) DEFAULT NULL,
  `Fax` varchar(100) DEFAULT NULL,
  `Date_Of_Establishment` datetime DEFAULT NULL,
  `Mobile_Number` varchar(100) DEFAULT NULL,
  `Notes` varchar(2000) DEFAULT NULL,
  `License_Number` varchar(100) DEFAULT NULL,
  `Installation_Date` datetime DEFAULT NULL,
  `To_Mail_Addresses` varchar(2000) DEFAULT NULL,
  `FssaiLicense` varchar(100) DEFAULT NULL,
  `UseBom` tinyint(1) DEFAULT NULL,
  `Bank_Details` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `complaintregister_log` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Details_ID` int(11) DEFAULT NULL,
  `User_Id` int(11) DEFAULT NULL,
  `TimeStamp` timestamp NULL DEFAULT current_timestamp(),
  `Date` date DEFAULT NULL,
  `Status` int(11) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gm_key` varchar(100) DEFAULT NULL,
  `gm_value` varchar(500) DEFAULT NULL,
  `Time_Stamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Data_Type` varchar(50) DEFAULT NULL,
  `display_text` varchar(200) DEFAULT NULL,
  `Text_To_Display` varchar(200) DEFAULT NULL,
  `Value_Type` varchar(100) DEFAULT NULL,
  `Possible_Values` varchar(500) DEFAULT NULL,
  `is_logged` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`gm_key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contra_voucher_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `Ledger_ID` varchar(100) DEFAULT NULL,
  `Amount` float DEFAULT NULL,
  `Narration` varchar(2000) NOT NULL,
  `Cr_Amount` float(10,2) DEFAULT NULL,
  `Dr_Amount` float(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_contra_voucher_details_voucher` (`voucher_id`),
  KEY `fk_contra_voucher_details_project` (`voucher_project_id`),
  KEY `fk_contra_voucher_details_salesperson` (`salesperson_employee_id`),
  KEY `fk_contra_voucher_details_ledger` (`voucher_ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contra_voucher_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_contra_voucher_main_ledger` (`voucher_ledger_id`),
  KEY `fk_contra_voucher_main_project` (`voucher_project_id`),
  KEY `fk_contra_voucher_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cost_estimates` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `ItemRequirementID` varchar(100) NOT NULL,
  `TransactionID` varchar(100) NOT NULL,
  `Item_ID` varchar(100) DEFAULT NULL,
  `Section_ID` varchar(100) DEFAULT NULL,
  `Labour_Charge` float(6,2) DEFAULT NULL,
  `Material_Cost` float(6,2) DEFAULT NULL,
  `Hours` float(6,2) DEFAULT NULL,
  `Description` varchar(2000) DEFAULT NULL,
  `Start_Condition` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Start_Condition`)),
  `Assigned_Emp_ID` varchar(100) DEFAULT NULL,
  `Exp_Delivery_Date` datetime DEFAULT NULL,
  `Priority` int(11) DEFAULT NULL,
  `Status` int(11) DEFAULT NULL,
  `UUID` varchar(100) NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `credit_note_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_credit_note_details_voucher` (`voucher_id`),
  KEY `fk_credit_note_details_item` (`item_id`),
  KEY `fk_credit_note_details_sku` (`voucher_sku_id`),
  KEY `fk_credit_note_details_uom` (`voucher_uom_id`),
  KEY `fk_credit_note_details_project` (`voucher_project_id`),
  KEY `fk_credit_note_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `credit_note_main` (
  `id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `Invoice_Date` date DEFAULT NULL,
  `Invoice_No` varchar(20) DEFAULT NULL,
  `Location` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_credit_note_main_ledger` (`voucher_ledger_id`),
  KEY `fk_credit_note_main_project` (`voucher_project_id`),
  KEY `fk_credit_note_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_credit_note_main_godown` (`godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `currencymaster` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `currencyrates` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_details` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `Name` varchar(30) NOT NULL,
  `Address` varchar(150) NOT NULL,
  `Route` varchar(30) DEFAULT NULL,
  `Code` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `daily_closing` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `ShiftDate` datetime NOT NULL,
  `StartVoucherNo` int(11) NOT NULL,
  `StopVoucherNo` int(11) NOT NULL,
  `SalesValue` float NOT NULL,
  `OpeningBalance` float DEFAULT NULL,
  `CashSales` float DEFAULT NULL,
  `CardSales` float DEFAULT NULL,
  `CreditSales` float DEFAULT NULL,
  `ZomatoSales` float DEFAULT NULL,
  `ZomatoCash` float DEFAULT NULL,
  `ZomatoCredit` float DEFAULT NULL,
  `PurchaseCash` float DEFAULT NULL,
  `PurchaseCredit` float DEFAULT NULL,
  `PurchaseTotal` float DEFAULT NULL,
  `PaymentCash` float DEFAULT NULL,
  `ReceiptCash` float DEFAULT NULL,
  `cashierID` int(11) DEFAULT NULL,
  `voucherPrefix` varchar(10) DEFAULT NULL,
  `MacID` varchar(30) DEFAULT NULL,
  `POSNumber` varchar(30) DEFAULT NULL,
  `paxCount` int(11) DEFAULT NULL,
  `Narration` varchar(1000) DEFAULT NULL,
  `ShiftStart_DateTime` datetime DEFAULT NULL,
  `ShiftEnd_DateTime` datetime DEFAULT NULL,
  `TotalCash` float DEFAULT NULL,
  `CasinCounter` float DEFAULT NULL,
  `CashWithDrawn` float DEFAULT NULL,
  `CashBalance` float DEFAULT NULL,
  `TillDifference` float DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `daily_shift` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `ShiftDate` date NOT NULL,
  `StartVoucherNo` int(11) NOT NULL,
  `StopVoucherNo` int(11) NOT NULL,
  `OpeningBalance` int(11) NOT NULL,
  `CardAmount` int(11) NOT NULL,
  `CashInCounter` int(11) NOT NULL,
  `CashTaken` int(11) NOT NULL,
  `ShiftStaffName` varchar(50) NOT NULL,
  `Narration` varchar(50) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `debit_note_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_debit_note_details_voucher` (`voucher_id`),
  KEY `fk_debit_note_details_item` (`item_id`),
  KEY `fk_debit_note_details_sku` (`voucher_sku_id`),
  KEY `fk_debit_note_details_uom` (`voucher_uom_id`),
  KEY `fk_debit_note_details_project` (`voucher_project_id`),
  KEY `fk_debit_note_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `debit_note_main` (
  `id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `Invoice_Date` date DEFAULT NULL,
  `Invoice_No` varchar(20) DEFAULT NULL,
  `Location` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_debit_note_main_ledger` (`voucher_ledger_id`),
  KEY `fk_debit_note_main_project` (`voucher_project_id`),
  KEY `fk_debit_note_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_debit_note_main_godown` (`godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deleted_kot` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `sales_voucher_header_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `sales_Voucher_Id` int(11) NOT NULL,
  `Item_Name` int(11) NOT NULL,
  `Quantity` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `Rate_per` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Item_Discount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Amount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `vat_amount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Vat` float NOT NULL,
  `Narration` varchar(50) NOT NULL,
  `Voucher_Prefix` varchar(50) NOT NULL,
  `Voucher_Date` date NOT NULL,
  `total_discount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `service_tax_amount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Totat_Discount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Service_tax` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `table_name` varchar(20) NOT NULL,
  `is_printed` tinyint(1) NOT NULL DEFAULT 0,
  `is_saved` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `waiter_employee_id` int(11) DEFAULT NULL,
  `kot_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `waiterID` varchar(50) DEFAULT NULL,
  `kot_num` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `fk_deleted_kot_header` (`sales_voucher_header_id`),
  KEY `fk_deleted_kot_item` (`item_id`),
  KEY `fk_deleted_kot_waiter` (`waiter_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `delivery_note_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_delivery_note_details_voucher` (`voucher_id`),
  KEY `fk_delivery_note_details_item` (`item_id`),
  KEY `fk_delivery_note_details_sku` (`voucher_sku_id`),
  KEY `fk_delivery_note_details_uom` (`voucher_uom_id`),
  KEY `fk_delivery_note_details_project` (`voucher_project_id`),
  KEY `fk_delivery_note_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `delivery_note_main` (
  `id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(100) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `Location` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_delivery_note_main_ledger` (`voucher_ledger_id`),
  KEY `fk_delivery_note_main_project` (`voucher_project_id`),
  KEY `fk_delivery_note_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_delivery_note_main_godown` (`godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `department` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `designation` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(50) DEFAULT NULL,
  `contact_id` int(11) DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Name` varchar(100) NOT NULL,
  `Fathers_Name` varchar(100) DEFAULT NULL,
  `Date_of_Birth` date DEFAULT NULL,
  `Gender` varchar(100) DEFAULT NULL,
  `Nationality` varchar(100) DEFAULT NULL,
  `Marital_Status` varchar(100) DEFAULT NULL,
  `Phone` varchar(100) DEFAULT NULL,
  `Designation` varchar(100) DEFAULT NULL,
  `Department` varchar(100) DEFAULT NULL,
  `Date_of_Joining` date DEFAULT NULL,
  `Passport_No` varchar(100) DEFAULT NULL,
  `Passport_Expiry` date DEFAULT NULL,
  `Visa_No` varchar(100) DEFAULT NULL,
  `Visa_Expiry` date DEFAULT NULL,
  `Bank_Account_No` varchar(100) DEFAULT NULL,
  `Bank_Name` varchar(100) DEFAULT NULL,
  `Bank_Branch` varchar(100) DEFAULT NULL,
  `Bank_Code` varchar(100) DEFAULT NULL,
  `Highest_Qualification` varchar(100) DEFAULT NULL,
  `Date_of_Qualification` date DEFAULT NULL,
  `Emergency_Contact_Name` varchar(100) DEFAULT NULL,
  `Emergency_Contact_No` varchar(100) DEFAULT NULL,
  `Emergency_Contact_Relation` varchar(100) DEFAULT NULL,
  `UserName` varchar(100) DEFAULT NULL,
  `Password` varchar(100) DEFAULT NULL,
  `UserGroupID` int(11) DEFAULT NULL,
  `privilege` int(11) DEFAULT NULL,
  `Show_Employee` tinyint(1) DEFAULT NULL,
  `googleUUID` varchar(50) DEFAULT NULL,
  `gmailAddress` varchar(200) DEFAULT NULL,
  `defaultVoucherPrefix` varchar(10) DEFAULT NULL,
  `allowAllPrefix` tinyint(1) DEFAULT NULL,
  `Last_Modified` timestamp NULL DEFAULT current_timestamp(),
  `Biometric_ID` varchar(50) DEFAULT NULL,
  `Visa_Status` varchar(200) DEFAULT NULL,
  `Visa_Sponsor` varchar(200) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `Passport_Custody` varchar(100) DEFAULT NULL,
  `Passport_Issue_Date` date DEFAULT NULL,
  `Company_Mobile_Number` varchar(100) DEFAULT NULL,
  `Labour_Card_No` varchar(100) DEFAULT NULL,
  `Labour_Card_Expiry` date DEFAULT NULL,
  `Emirates_ID` varchar(100) DEFAULT NULL,
  `Emirates_ID_Expiry` date DEFAULT NULL,
  `Emirates_ID_Issue` date DEFAULT NULL,
  `Emirates_ID_PlaceOfIssue` varchar(200) DEFAULT NULL,
  `Driving_License_No` varchar(200) DEFAULT NULL,
  `Driving_License_Expiry` date DEFAULT NULL,
  `Driving_License_Issue` date DEFAULT NULL,
  `Driving_License_PlaceOfIssue` varchar(200) DEFAULT NULL,
  `Health_Card_No` varchar(200) DEFAULT NULL,
  `Health_Card_Issue` date DEFAULT NULL,
  `Health_Card_Expiry` date DEFAULT NULL,
  `Health_Card_PlaceOfIssue` varchar(200) DEFAULT NULL,
  `Airport_Pass_No` varchar(200) DEFAULT NULL,
  `Airport_Pass_Status` varchar(200) DEFAULT NULL,
  `Airport_Pass_Expiry` date DEFAULT NULL,
  `Airport_Pass_Issue` date DEFAULT NULL,
  `Image_Path` varchar(500) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `designation_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employee_contact` (`contact_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee_salary_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `salary_employee_id` int(11) DEFAULT NULL,
  `Employee_Id` varchar(20) NOT NULL,
  `adv_salary_ledger_id` int(11) DEFAULT NULL,
  `salary_ledger_id` int(11) DEFAULT NULL,
  `overtime_hourly_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Basic_Salary` float(10,2) DEFAULT NULL,
  `DA` float(10,2) DEFAULT NULL,
  `HRA` float(10,2) DEFAULT NULL,
  `Conveyance` float(10,2) DEFAULT NULL,
  `Monthly_Leave` int(11) DEFAULT NULL,
  `Weekly_Leave` int(11) DEFAULT NULL,
  `Annual_Leave` int(11) DEFAULT NULL,
  `Working_Hours` int(11) DEFAULT NULL,
  `OverTime_Pay` float DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `adv_salary_ledger` varchar(200) DEFAULT NULL,
  `salary_ledger` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Employee_Id` (`Employee_Id`),
  KEY `fk_salary_adv_ledger` (`adv_salary_ledger_id`),
  KEY `fk_salary_ledger` (`salary_ledger_id`),
  KEY `fk_salary_employee` (`salary_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employeebankdetails` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employeedocuments` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employeeshiftassignment` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `error_reporting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `error` longtext NOT NULL,
  `tablename` varchar(255) NOT NULL,
  `query` longtext NOT NULL,
  `time_stamp` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `client_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=177 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `extra_values_table` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `TYPE` varchar(200) NOT NULL,
  `OBJECT_ID` varchar(200) DEFAULT NULL,
  `DATA` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`DATA`)),
  `ADDED_BY` varchar(100) NOT NULL,
  `LAST_MODIFIED` timestamp NOT NULL DEFAULT current_timestamp(),
  `HASH_TAGS` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`HASH_TAGS`)),
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `financial_journal_entries` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `financialyear` (
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `godown` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `godown_code` varchar(100) DEFAULT NULL,
  `is_profit_centre` tinyint(1) NOT NULL DEFAULT 0,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_production` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `Godown_Name` varchar(100) NOT NULL,
  `Godown_Location` varchar(100) DEFAULT NULL,
  `Godown_Narration` varchar(500) DEFAULT NULL,
  `Last_Modified` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_godown_code` (`godown_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `godown_tranfer_main` (
  `id` int(11) NOT NULL,
  `from_godown_id` int(11) DEFAULT NULL,
  `to_godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `From_Location` varchar(100) DEFAULT NULL,
  `To_Location` varchar(100) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_godown_tranfer_main_ledger` (`voucher_ledger_id`),
  KEY `fk_godown_tranfer_main_project` (`voucher_project_id`),
  KEY `fk_godown_tranfer_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_godown_tranfer_main_from_godown` (`from_godown_id`),
  KEY `fk_godown_tranfer_main_to_godown` (`to_godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `godown_transfer_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Adj_value` decimal(10,2) DEFAULT NULL,
  `itemVoucherStatus` int(11) DEFAULT NULL,
  `itemProductionStatus` int(11) DEFAULT NULL,
  `CurrTime` time DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_godown_transfer_details_voucher` (`voucher_id`),
  KEY `fk_godown_transfer_details_item` (`item_id`),
  KEY `fk_godown_transfer_details_sku` (`voucher_sku_id`),
  KEY `fk_godown_transfer_details_uom` (`voucher_uom_id`),
  KEY `fk_godown_transfer_details_project` (`voucher_project_id`),
  KEY `fk_godown_transfer_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ingredients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sales_item_id` int(11) DEFAULT NULL,
  `purchase_item_id` int(11) DEFAULT NULL,
  `purchase_uom_id` int(11) DEFAULT NULL,
  `prep_route_id` int(11) DEFAULT NULL,
  `take_away_applicable` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `sales_item` varchar(100) NOT NULL,
  `sales_item_qty` decimal(12,4) NOT NULL DEFAULT 1.0000,
  `purchase_item` varchar(100) NOT NULL,
  `purchase_item_qty` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `TakeAway` tinyint(4) DEFAULT NULL,
  `Purchase_unit` int(11) DEFAULT NULL,
  `Route_ID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_recipe_sales_item` (`sales_item_id`),
  KEY `fk_recipe_purch_item` (`purchase_item_id`),
  KEY `fk_recipe_uom` (`purchase_uom_id`),
  KEY `fk_recipe_route` (`prep_route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_group_images` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Group_Id` varchar(1000) NOT NULL,
  `Image` mediumblob DEFAULT NULL,
  `Narration` varchar(50) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `FileName` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_movement_lines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `movement_id` int(11) NOT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `quantity` float NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_inv_mov_line_mov` (`movement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_movements` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_valuations` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_batch_helper` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `ItemID` varchar(50) DEFAULT NULL,
  `SKU_ID` varchar(100) DEFAULT NULL,
  `Batch_No` varchar(50) DEFAULT NULL,
  `Serial_No` varchar(50) DEFAULT NULL,
  `Voucher_No` varchar(50) DEFAULT NULL,
  `Voucher_Type` varchar(50) DEFAULT NULL,
  `Voucher_Prefix` varchar(50) DEFAULT NULL,
  `Ref_No` varchar(50) DEFAULT NULL,
  `Ref_Type` varchar(50) DEFAULT NULL,
  `Ref_Prefix` varchar(50) DEFAULT NULL,
  `Mfg_Date` date DEFAULT NULL,
  `Expiry_Date` date DEFAULT NULL,
  `Shelf_Life` int(11) DEFAULT NULL,
  `Purchase_Cost` float(10,2) DEFAULT NULL,
  `Selling_Price` float(10,2) DEFAULT NULL,
  `Cr_Qty` float(10,3) DEFAULT NULL,
  `Dr_Qty` float(10,3) DEFAULT NULL,
  `Batch_Name` varchar(250) DEFAULT NULL,
  `Uom` int(11) DEFAULT NULL,
  `Voucher_Date` date DEFAULT NULL,
  `Item_ReqUuid` varchar(250) DEFAULT NULL,
  `BarCode` varchar(100) DEFAULT NULL,
  `MRP` float(10,2) DEFAULT NULL,
  `TransactionID` varchar(100) NOT NULL,
  `RequirementID` varchar(100) NOT NULL,
  `Serial_No_Prefix` varchar(100) DEFAULT NULL,
  `Serial_No_Suffix` varchar(100) DEFAULT NULL,
  `Godown` varchar(50) DEFAULT NULL,
  `Serial_No_FROM` int(11) DEFAULT NULL,
  `SERIAL_NO_TO` int(11) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_batch_helper_x` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `ItemID` varchar(100) DEFAULT NULL,
  `Batch_No` varchar(255) DEFAULT NULL,
  `Batch_Name` varchar(255) DEFAULT NULL,
  `Voucher_No` int(11) DEFAULT NULL,
  `Voucher_Type` varchar(255) DEFAULT NULL,
  `Voucher_Prefix` varchar(255) DEFAULT NULL,
  `Voucher_Date` date DEFAULT NULL,
  `Mfg_Date` date DEFAULT NULL,
  `Expiry_Date` date DEFAULT NULL,
  `Shelf_Life` int(11) DEFAULT NULL,
  `Barcode` varchar(255) DEFAULT NULL,
  `Cost` decimal(10,2) DEFAULT NULL,
  `Selling_Price` decimal(10,2) DEFAULT NULL,
  `Cr_Qty` decimal(10,2) DEFAULT NULL,
  `Dr_Qty` decimal(10,2) DEFAULT NULL,
  `Uom` varchar(255) DEFAULT NULL,
  `Item_ReqUuid` varchar(255) DEFAULT NULL,
  `TransactionID` varchar(255) DEFAULT NULL,
  `RequirementID` varchar(255) DEFAULT NULL,
  `Godown` varchar(255) DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `Blocked` tinyint(1) DEFAULT NULL,
  `Cr_Rate` decimal(10,3) DEFAULT NULL,
  `Cr_Value` decimal(10,3) DEFAULT NULL,
  `Dr_Rate` decimal(10,3) DEFAULT NULL,
  `Dr_Value` decimal(10,3) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_batches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `batch_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `cost_price` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `selling_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_item_batch` (`item_id`,`batch_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item_tmp` (
  `ItemID` varchar(20) DEFAULT NULL,
  `Quantity` float(10,3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `itemphysicalspecs` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `journal_ledger` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_header_id` int(11) NOT NULL,
  `ledger_id` int(11) NOT NULL,
  `debit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `credit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `narration` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `salesman_id` int(11) DEFAULT NULL,
  `posting_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_posting_date` (`posting_date`),
  KEY `fk_journal_voucher` (`voucher_header_id`),
  KEY `fk_journal_ledger` (`ledger_id`),
  KEY `fk_journal_project` (`project_id`),
  KEY `fk_journal_salesman` (`salesman_id`),
  CONSTRAINT `chk_debit_credit` CHECK (`debit_amount` > 0.00 and `credit_amount` = 0.00 or `credit_amount` > 0.00 and `debit_amount` = 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `journal_voucher_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `Ledger_ID` varchar(100) DEFAULT NULL,
  `CR_Amount` float DEFAULT NULL,
  `DR_Amount` float DEFAULT NULL,
  `Narration` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_journal_voucher_details_voucher` (`voucher_id`),
  KEY `fk_journal_voucher_details_project` (`voucher_project_id`),
  KEY `fk_journal_voucher_details_salesperson` (`salesperson_employee_id`),
  KEY `fk_journal_voucher_details_ledger` (`voucher_ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `journal_voucher_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `TransactionId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_journal_voucher_main_ledger` (`voucher_ledger_id`),
  KEY `fk_journal_voucher_main_project` (`voucher_project_id`),
  KEY `fk_journal_voucher_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kot_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT NULL,
  `Item_Name` varchar(50) NOT NULL,
  `Quantity` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `Rate_per` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Item_Discount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Amount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `vat_amount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Vat` float NOT NULL,
  `Narration` varchar(50) NOT NULL,
  `Total_Discount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Service_Type` varchar(30) NOT NULL,
  `table_name` varchar(20) NOT NULL,
  `kot_number` int(11) DEFAULT NULL,
  `waiter_employee_id` int(11) DEFAULT NULL,
  `elapsed_time` varchar(50) DEFAULT NULL,
  `time_completed` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `kot_num` int(50) NOT NULL,
  `waiterID` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_kot_details_item` (`item_id`),
  KEY `fk_kot_details_waiter` (`waiter_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kot_details_deleted` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT NULL,
  `Item_Name` varchar(50) NOT NULL,
  `Quantity` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `Rate_per` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Item_Discount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Amount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `delete_position` int(11) NOT NULL DEFAULT 0,
  `delPos` int(11) NOT NULL,
  `Narration` varchar(50) NOT NULL,
  `Total_Discount` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Service_Type` varchar(30) NOT NULL,
  `table_name` varchar(20) NOT NULL,
  `kot_number` varchar(50) DEFAULT NULL,
  `waiter_employee_id` int(11) DEFAULT NULL,
  `elapsed_time` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `kot_num` varchar(50) NOT NULL,
  `waiterID` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `fk_kot_del_item` (`item_id`),
  KEY `fk_kot_del_waiter` (`waiter_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kotnumbertable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tem` varchar(4) DEFAULT NULL,
  `temp_prefix` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leaveallocation` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leavepolicy` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leaverequest` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ledger_bank_details` (
  `ledger_id` int(11) NOT NULL,
  `bank_account_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_branch_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ledger_credit_settings` (
  `ledger_id` int(11) NOT NULL,
  `credit_period_days` int(11) NOT NULL DEFAULT 0,
  `credit_limit` decimal(15,2) DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `caution_deposit` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ledger_item_mapping` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Ledger_Id` varchar(50) NOT NULL,
  `Item_Id` varchar(50) NOT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ledger_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ledger_code` varchar(100) DEFAULT NULL,
  `account_group_id` int(11) DEFAULT NULL,
  `Ledger_Name` varchar(150) NOT NULL,
  `Ledger_Type` varchar(50) DEFAULT NULL,
  `contact_id` int(11) DEFAULT NULL,
  `parent_ledger_id` int(11) DEFAULT NULL,
  `currency_code` varchar(3) NOT NULL DEFAULT 'AED',
  `is_system_defined` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `Opening_Balance` varchar(50) NOT NULL,
  `Opening_Balance_Date` date DEFAULT NULL,
  `Closing_Balance` double DEFAULT NULL,
  `Turn_Over` double DEFAULT NULL,
  `isIndividual` tinyint(1) DEFAULT 0,
  `Narration` varchar(50) DEFAULT '',
  `Contact_Person_Name` varchar(50) DEFAULT '',
  `Contant_Person_Number` varchar(50) DEFAULT '',
  `Registration_Number` varchar(50) DEFAULT '',
  `Default_Price_List_Id` varchar(50) DEFAULT '',
  `Birth_Date` varchar(50) DEFAULT '',
  `Credit_Period` int(11) DEFAULT 0,
  `Credit_Limit` float(10,2) DEFAULT NULL,
  `ParentCompany` varchar(1000) DEFAULT NULL,
  `creditAllowed` float DEFAULT NULL,
  `paymentTerms` varchar(100) DEFAULT NULL,
  `Tax_Rate` float DEFAULT NULL,
  `Type_Of_Supply` varchar(500) DEFAULT NULL,
  `Default_Tax_Ledger` varchar(500) DEFAULT NULL,
  `TRN` varchar(100) DEFAULT NULL,
  `DefaultRecord` tinyint(1) DEFAULT NULL,
  `DbName` varchar(20) DEFAULT NULL,
  `Discount_Percentage` float(10,2) DEFAULT NULL,
  `isFrequent` tinyint(1) DEFAULT NULL,
  `Date_Created` timestamp NULL DEFAULT current_timestamp(),
  `Last_Modified` timestamp NULL DEFAULT NULL,
  `Distance` float(10,3) DEFAULT NULL,
  `DeliveryRatePer` float(10,3) DEFAULT NULL,
  `GPSLocation` varchar(250) DEFAULT NULL,
  `default_salesman` varchar(10) DEFAULT NULL,
  `shipping_address` varchar(2000) DEFAULT NULL,
  `Caution_Deposit` float(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ledger_contact` (`contact_id`),
  KEY `fk_ledger_parent` (`parent_ledger_id`),
  KEY `fk_ledger_group` (`account_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ledger_tax_settings` (
  `ledger_id` int(11) NOT NULL,
  `trn` varchar(100) DEFAULT NULL,
  `tax_category_id` int(11) DEFAULT NULL,
  `type_of_supply` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `data` longtext NOT NULL,
  `action` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `client_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `material_in_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `crQty` float DEFAULT NULL,
  `drQty` float DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_material_in_details_voucher` (`voucher_id`),
  KEY `fk_material_in_details_item` (`item_id`),
  KEY `fk_material_in_details_sku` (`voucher_sku_id`),
  KEY `fk_material_in_details_uom` (`voucher_uom_id`),
  KEY `fk_material_in_details_project` (`voucher_project_id`),
  KEY `fk_material_in_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `material_in_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_material_in_main_ledger` (`voucher_ledger_id`),
  KEY `fk_material_in_main_project` (`voucher_project_id`),
  KEY `fk_material_in_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_voucher_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `Ledger_ID` varchar(100) DEFAULT NULL,
  `Amount` float(10,2) DEFAULT NULL,
  `Cr_Amount` float(10,2) DEFAULT NULL,
  `Dr_Amount` float(10,2) DEFAULT NULL,
  `Narration` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_payment_voucher_details_voucher` (`voucher_id`),
  KEY `fk_payment_voucher_details_project` (`voucher_project_id`),
  KEY `fk_payment_voucher_details_salesperson` (`salesperson_employee_id`),
  KEY `fk_payment_voucher_details_ledger` (`voucher_ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_voucher_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_payment_voucher_main_ledger` (`voucher_ledger_id`),
  KEY `fk_payment_voucher_main_project` (`voucher_project_id`),
  KEY `fk_payment_voucher_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payslip_main` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Employee_Id` varchar(50) DEFAULT NULL,
  `Voucher_No` varchar(20) DEFAULT NULL,
  `Voucher_Type` varchar(20) DEFAULT NULL,
  `Voucher_Prefix` varchar(20) DEFAULT NULL,
  `Salary_Period_Start` date DEFAULT NULL,
  `Salary_Period_End` date DEFAULT NULL,
  `Date_Created` date DEFAULT NULL,
  `Created_By` varchar(25) DEFAULT NULL,
  `Narration` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `price_lists` (
  `Price_List_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Price_List_Name` varchar(100) NOT NULL,
  `Price_List_Start_Date` date DEFAULT NULL,
  `Price_List_End_Date` date DEFAULT NULL,
  `Price_List_Default` tinyint(1) DEFAULT NULL,
  `Price_List_ShowInPos` tinyint(1) DEFAULT 1,
  `Last_Modified` timestamp NULL DEFAULT current_timestamp(),
  `Price_List_isOnline` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`Price_List_ID`),
  UNIQUE KEY `Price_List_ID` (`Price_List_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pricelist_entries` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Item_Id` varchar(50) NOT NULL,
  `Price` float(10,2) NOT NULL,
  `Price_List_ID` int(11) NOT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  `percent` float DEFAULT NULL,
  `UOM_Id` varchar(20) DEFAULT NULL,
  `MRP2_STD1_CUS0` int(11) DEFAULT 0,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `printers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `printer_name` varchar(200) NOT NULL,
  `printer_nickname` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_printer_name` (`printer_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `proforma_details` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_No` varchar(100) NOT NULL,
  `Voucher_Prefix` varchar(100) NOT NULL,
  `Voucher_Date` date NOT NULL,
  `Inventory_Item_ID` varchar(100) NOT NULL,
  `SKU_ID` varchar(200) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `UOM_id` varchar(50) DEFAULT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Project_ID` varchar(100) DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Salesman_ID` varchar(100) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `proforma_main` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_No` varchar(100) NOT NULL,
  `Voucher_Prefix` varchar(100) NOT NULL,
  `Date_Created` date NOT NULL,
  `Voucher_Date` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Ledger_ID` varchar(100) NOT NULL,
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Project_ID` varchar(100) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `Salesman_ID` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(20) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `PaymentSplit` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_code` varchar(100) DEFAULT NULL,
  `parent_project_master_id` int(11) DEFAULT NULL,
  `project_owner_contact_id` int(11) DEFAULT NULL,
  `associated_ledger_id` int(11) DEFAULT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `coordinator_employee_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `PROJECT_ID` varchar(100) NOT NULL,
  `PARENT_PROJECT_ID` varchar(100) DEFAULT '0',
  `PROJECT_LEVEL` int(10) NOT NULL DEFAULT 0,
  `Project_Name` varchar(500) NOT NULL,
  `Project_Description` varchar(1000) DEFAULT NULL,
  `Project_Owner` varchar(200) DEFAULT NULL,
  `Project_Status` varchar(50) DEFAULT NULL,
  `Start_Date` date DEFAULT NULL,
  `End_Date` date DEFAULT NULL,
  `Ledger_ID` varchar(200) DEFAULT NULL,
  `Phone` varchar(100) DEFAULT NULL,
  `Detail` varchar(5000) DEFAULT NULL,
  `Estimated_Value` float DEFAULT NULL,
  `Location` varchar(100) DEFAULT NULL,
  `Estimated_Start_Date` date DEFAULT NULL,
  `Estimated_End_Date` date DEFAULT NULL,
  `CORDINATOR_ID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_code` (`project_code`),
  KEY `fk_project_parent` (`parent_project_master_id`),
  KEY `fk_project_owner` (`project_owner_contact_id`),
  KEY `fk_project_ledger` (`associated_ledger_id`),
  KEY `fk_project_godown` (`godown_id`),
  KEY `fk_project_coordinator` (`coordinator_employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `properties` (
  `Property_id` int(11) NOT NULL AUTO_INCREMENT,
  `Property_Name` varchar(100) NOT NULL,
  `Property_Units` varchar(100) DEFAULT NULL,
  `Property_Default_Value` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Property_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property_values` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `PROPERTY_CHOICE_ID` varchar(200) NOT NULL,
  `PROPERTY_ID` varchar(200) NOT NULL,
  `PROPERTY_CHOICE` varchar(200) NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `IDCOL` (`PROPERTY_CHOICE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_invoice_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_purchase_invoice_details_voucher` (`voucher_id`),
  KEY `fk_purchase_invoice_details_item` (`item_id`),
  KEY `fk_purchase_invoice_details_sku` (`voucher_sku_id`),
  KEY `fk_purchase_invoice_details_uom` (`voucher_uom_id`),
  KEY `fk_purchase_invoice_details_project` (`voucher_project_id`),
  KEY `fk_purchase_invoice_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_invoice_main` (
  `id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NOT NULL DEFAULT '1999-12-31 13:00:00',
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `Invoice_Date` date DEFAULT NULL,
  `Invoice_No` varchar(20) DEFAULT NULL,
  `Location` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_purchase_invoice_main_ledger` (`voucher_ledger_id`),
  KEY `fk_purchase_invoice_main_project` (`voucher_project_id`),
  KEY `fk_purchase_invoice_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_purchase_invoice_main_godown` (`godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_order_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `TimeDate` datetime DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  `ContainerCount` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_purchase_order_details_voucher` (`voucher_id`),
  KEY `fk_purchase_order_details_item` (`item_id`),
  KEY `fk_purchase_order_details_sku` (`voucher_sku_id`),
  KEY `fk_purchase_order_details_uom` (`voucher_uom_id`),
  KEY `fk_purchase_order_details_project` (`voucher_project_id`),
  KEY `fk_purchase_order_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_order_itemwise` (
  `_id` int(11) NOT NULL DEFAULT 0,
  `Voucher_No` varchar(50) CHARACTER SET latin1 NOT NULL,
  `Voucher_Prefix` varchar(20) CHARACTER SET latin1 NOT NULL,
  `Date_Created` date NOT NULL,
  `Voucher_Date` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Salesman_ID` varchar(50) CHARACTER SET latin1 NOT NULL,
  `Item_ID` varchar(200) CHARACTER SET latin1 NOT NULL,
  `Qty_Total` float NOT NULL,
  `Narration` varchar(1000) CHARACTER SET latin1 DEFAULT NULL,
  `Added_By` varchar(200) CHARACTER SET latin1 NOT NULL,
  `Damage` float DEFAULT NULL,
  `Total_Amount` float NOT NULL,
  `Voucher_Status` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_order_main` (
  `id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `Location` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_purchase_order_main_ledger` (`voucher_ledger_id`),
  KEY `fk_purchase_order_main_project` (`voucher_project_id`),
  KEY `fk_purchase_order_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_purchase_order_main_godown` (`godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quotation_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` int(11) DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_quotation_details_voucher` (`voucher_id`),
  KEY `fk_quotation_details_item` (`item_id`),
  KEY `fk_quotation_details_sku` (`voucher_sku_id`),
  KEY `fk_quotation_details_uom` (`voucher_uom_id`),
  KEY `fk_quotation_details_project` (`voucher_project_id`),
  KEY `fk_quotation_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quotation_documents_table` (
  `_id` int(10) NOT NULL AUTO_INCREMENT,
  `File_Name` varchar(500) DEFAULT NULL,
  `File_Type` varchar(500) DEFAULT NULL,
  `File_Description` varchar(500) DEFAULT NULL,
  `File_Data` mediumblob DEFAULT NULL,
  `AddedByID` int(10) DEFAULT NULL,
  `ReqId` varchar(500) DEFAULT NULL,
  `ProjectId` varchar(500) DEFAULT NULL,
  `TimeStamp` datetime NOT NULL DEFAULT current_timestamp(),
  `Quotation_Number` varchar(500) DEFAULT NULL,
  `TagType` varchar(500) DEFAULT NULL,
  `SearchTag` varchar(1000) DEFAULT NULL,
  `ClientApprovalStatus` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quotation_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `TransactionId` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_quotation_main_ledger` (`voucher_ledger_id`),
  KEY `fk_quotation_main_project` (`voucher_project_id`),
  KEY `fk_quotation_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receipt_note_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_receipt_note_details_voucher` (`voucher_id`),
  KEY `fk_receipt_note_details_item` (`item_id`),
  KEY `fk_receipt_note_details_sku` (`voucher_sku_id`),
  KEY `fk_receipt_note_details_uom` (`voucher_uom_id`),
  KEY `fk_receipt_note_details_project` (`voucher_project_id`),
  KEY `fk_receipt_note_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receipt_note_main` (
  `id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `Location` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_receipt_note_main_ledger` (`voucher_ledger_id`),
  KEY `fk_receipt_note_main_project` (`voucher_project_id`),
  KEY `fk_receipt_note_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_receipt_note_main_godown` (`godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receipt_voucher_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `Ledger_ID` varchar(100) DEFAULT NULL,
  `Amount` float(10,2) DEFAULT NULL,
  `Cr_Amount` float(10,2) DEFAULT NULL,
  `Dr_Amount` float(10,2) DEFAULT NULL,
  `narration` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_receipt_voucher_details_voucher` (`voucher_id`),
  KEY `fk_receipt_voucher_details_project` (`voucher_project_id`),
  KEY `fk_receipt_voucher_details_salesperson` (`salesperson_employee_id`),
  KEY `fk_receipt_voucher_details_ledger` (`voucher_ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receipt_voucher_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `narration` varchar(500) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_receipt_voucher_main_ledger` (`voucher_ledger_id`),
  KEY `fk_receipt_voucher_main_project` (`voucher_project_id`),
  KEY `fk_receipt_voucher_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receivechannel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_data` longtext NOT NULL,
  `from_db_name` varchar(255) DEFAULT NULL,
  `time_stamp` timestamp(6) NULL DEFAULT NULL,
  `received_at` timestamp(6) NULL DEFAULT NULL,
  `typeofdata` varchar(255) NOT NULL,
  `data_type` varchar(255) DEFAULT NULL,
  `generated_Transactionid` varchar(50) NOT NULL,
  `generated_voucher_id` int(11) DEFAULT NULL,
  `Action` int(11) NOT NULL,
  `action_type` int(11) NOT NULL DEFAULT 0,
  `Status` int(11) NOT NULL DEFAULT 0,
  `sync_status` int(11) NOT NULL DEFAULT 0,
  `notification_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_recv_voucher` (`generated_voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `requirement_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `Price_Level` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_requirement_details_voucher` (`voucher_id`),
  KEY `fk_requirement_details_item` (`item_id`),
  KEY `fk_requirement_details_uom` (`voucher_uom_id`),
  KEY `fk_requirement_details_project` (`voucher_project_id`),
  KEY `fk_requirement_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `requirement_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_requirement_main_ledger` (`voucher_ledger_id`),
  KEY `fk_requirement_main_project` (`voucher_project_id`),
  KEY `fk_requirement_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `route_customer_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `route_master_id` int(11) DEFAULT NULL,
  `customer_ledger_id` int(11) DEFAULT NULL,
  `Ledger_ID` varchar(100) NOT NULL,
  `Last_Update_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_cust_route_id` (`route_master_id`),
  KEY `fk_cust_route_ledger` (`customer_ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `route_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `route_master_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `Day_Of_Week` varchar(11) NOT NULL,
  `Salesman_ID` int(11) NOT NULL,
  `Date_Created` datetime NOT NULL,
  `Last_Modified` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_emp_route_id` (`route_master_id`),
  KEY `fk_emp_route_salesman` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `route_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `route_id` varchar(50) NOT NULL,
  `route_name` varchar(20) DEFAULT NULL,
  `Description` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salaryrevisionhistory` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_inventory_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_code` varchar(50) DEFAULT NULL,
  `parent_group_id` int(11) DEFAULT NULL,
  `Group_ID` varchar(50) NOT NULL,
  `Group_Name` varchar(100) DEFAULT NULL,
  `Parent_ID` varchar(50) DEFAULT NULL,
  `Group_Type` varchar(50) DEFAULT NULL,
  `GroupNameArabic` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `Last_Modified` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Group_ID` (`Group_ID`),
  UNIQUE KEY `Group_ID_2` (`Group_ID`),
  UNIQUE KEY `GroupName` (`Group_Name`),
  UNIQUE KEY `uk_group_code` (`group_code`),
  KEY `Group_ID_3` (`Group_ID`,`Group_Name`,`Parent_ID`),
  KEY `fk_inv_group_parent` (`parent_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_inventory_images` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Item_Id` varchar(1000) NOT NULL,
  `Image` mediumblob DEFAULT NULL,
  `Narration` varchar(50) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `FileName` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_inventory_item_properties` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Property_ID` varchar(50) NOT NULL,
  `Item_ID` varchar(100) NOT NULL,
  `Default_Value` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_inventory_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Item_Name` varchar(500) NOT NULL,
  `Item_Alias` varchar(500) DEFAULT NULL,
  `inventory_group_id` int(11) DEFAULT NULL,
  `uom_id` int(11) DEFAULT NULL,
  `inventory_brand_id` int(11) DEFAULT NULL,
  `Item_Code` varchar(500) DEFAULT NULL,
  `Group_Id` varchar(100) NOT NULL,
  `Part_Number` varchar(100) DEFAULT NULL,
  `Price` float NOT NULL DEFAULT 0,
  `Opening_Stock` float DEFAULT NULL,
  `opening_stock_value` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Opening_Balance` float NOT NULL DEFAULT 0,
  `Opening_Balance_Date` date DEFAULT NULL,
  `Last_Modified_By` varchar(100) DEFAULT NULL,
  `Opening_Rate` double DEFAULT NULL,
  `Opening_Value` float NOT NULL DEFAULT 0,
  `Narration` varchar(500) DEFAULT NULL,
  `Serial_Number` varchar(100) DEFAULT NULL,
  `Closing_Stock` float DEFAULT 0,
  `Reorder_Level` float NOT NULL DEFAULT 0,
  `is_purchase_item` tinyint(1) NOT NULL DEFAULT 1,
  `is_sales_item` tinyint(1) NOT NULL DEFAULT 1,
  `is_stock_item` tinyint(1) NOT NULL DEFAULT 1,
  `is_serialized` tinyint(1) NOT NULL DEFAULT 0,
  `is_batch_tracked` tinyint(1) NOT NULL DEFAULT 0,
  `is_service` tinyint(1) NOT NULL DEFAULT 0,
  `is_perishable` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sales_gl_ledger_id` int(11) DEFAULT NULL,
  `Std_Cost` float DEFAULT 0,
  `Default_Sales_Ledger_id` varchar(100) DEFAULT NULL,
  `default_purchase_ledger_id` int(11) DEFAULT NULL,
  `default_sales_return_ledger_id` int(11) DEFAULT NULL,
  `default_purchase_return_ledger_id` int(11) DEFAULT NULL,
  `default_tax_category_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `Default_Input_Tax_Ledger` varchar(500) DEFAULT NULL,
  `Default_Output_Tax_Ledger` varchar(500) DEFAULT NULL,
  `Default_Sales_Return_Ledger` varchar(500) DEFAULT NULL,
  `Default_Purchase_Return_Ledger` varchar(500) DEFAULT NULL,
  `Vat_Rate` float NOT NULL DEFAULT 0,
  `Default_UOM_ID` varchar(100) DEFAULT NULL,
  `Last_Modified` timestamp NOT NULL DEFAULT current_timestamp(),
  `Date_Created` timestamp NOT NULL DEFAULT current_timestamp(),
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Warranty_Days` int(11) NOT NULL DEFAULT 0,
  `Shelf_Life` float NOT NULL DEFAULT 0,
  `Brand_Id` varchar(150) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `base_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `standard_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `moving_average_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `isCustomItem` tinyint(1) DEFAULT NULL,
  `Dimension` varchar(500) DEFAULT NULL,
  `KOT_Printer` varchar(100) DEFAULT NULL,
  `Item_Name_Arabic` varchar(500) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `Favourite` tinyint(1) DEFAULT NULL,
  `From_Time` time NOT NULL DEFAULT '00:00:00',
  `To_Time` time NOT NULL DEFAULT '23:59:59',
  `Price_2` float DEFAULT NULL,
  `HSN_CODE` varchar(100) DEFAULT NULL,
  `Section` varchar(100) DEFAULT NULL,
  `Flags` longtext DEFAULT NULL,
  `Category` varchar(100) DEFAULT NULL,
  `DefaultLedgerID` varchar(100) DEFAULT NULL,
  `isSerailNumbered` tinyint(1) DEFAULT 0,
  `isBatchProcessed` tinyint(1) DEFAULT 0,
  `weight` float(10,2) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_item_code` (`Item_Code`),
  KEY `Group_Id` (`Group_Id`,`Brand_Id`),
  KEY `fk_item_group` (`inventory_group_id`),
  KEY `fk_item_uom` (`uom_id`),
  KEY `fk_item_category` (`category_id`),
  KEY `fk_item_purch_gl` (`default_purchase_ledger_id`),
  KEY `fk_item_sales_ret_gl` (`default_sales_return_ledger_id`),
  KEY `fk_item_purch_ret_gl` (`default_purchase_return_ledger_id`),
  KEY `fk_item_tax` (`default_tax_category_id`),
  KEY `fk_item_brand` (`inventory_brand_id`),
  KEY `fk_item_sales_gl` (`sales_gl_ledger_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_inventory_items_sku` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `SKU_ID` varchar(200) DEFAULT NULL,
  `ITEM_ID` varchar(200) DEFAULT NULL,
  `PROPERTY_CHOICE_ID` varchar(200) NOT NULL,
  `PROPERTY_LABLE` varchar(200) DEFAULT NULL,
  `SKU_NAME` varchar(500) NOT NULL,
  `SKU_CODE` varchar(200) DEFAULT NULL,
  `TIME_STAMP` timestamp NOT NULL DEFAULT current_timestamp(),
  `LAST_MODIFIED` timestamp NOT NULL DEFAULT current_timestamp(),
  `RATE` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `IDCOL` (`SKU_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_invoice_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sales_invoice_details_voucher` (`voucher_id`),
  KEY `fk_sales_invoice_details_item` (`item_id`),
  KEY `fk_sales_invoice_details_sku` (`voucher_sku_id`),
  KEY `fk_sales_invoice_details_uom` (`voucher_uom_id`),
  KEY `fk_sales_invoice_details_project` (`voucher_project_id`),
  KEY `fk_sales_invoice_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_invoice_details_deleted` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_invoice_main` (
  `id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(100) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `PaymentSplit` tinyint(1) NOT NULL DEFAULT 0,
  `Location` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sales_invoice_main_ledger` (`voucher_ledger_id`),
  KEY `fk_sales_invoice_main_project` (`voucher_project_id`),
  KEY `fk_sales_invoice_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_sales_invoice_main_godown` (`godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_invoice_main_deleted` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(20) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `PaymentSplit` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_order_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `ItemVoucherStatus` float DEFAULT 0,
  `itemProductionStatus` float DEFAULT 0,
  `Tax_Rate` float DEFAULT NULL,
  `Tax_Amount` float DEFAULT NULL,
  `TimeDate` datetime DEFAULT NULL,
  `ContainerCount` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sales_order_details_voucher` (`voucher_id`),
  KEY `fk_sales_order_details_item` (`item_id`),
  KEY `fk_sales_order_details_sku` (`voucher_sku_id`),
  KEY `fk_sales_order_details_uom` (`voucher_uom_id`),
  KEY `fk_sales_order_details_project` (`voucher_project_id`),
  KEY `fk_sales_order_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_order_itemwise` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_No` varchar(50) NOT NULL,
  `Voucher_Prefix` varchar(20) NOT NULL,
  `Date_Created` date NOT NULL,
  `Voucher_Date` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Salesman_ID` varchar(50) NOT NULL,
  `Item_ID` varchar(200) NOT NULL,
  `Qty_Total` float NOT NULL,
  `Narration` varchar(1000) DEFAULT NULL,
  `Added_By` varchar(200) NOT NULL,
  `Damage` float DEFAULT NULL,
  `Total_Amount` float NOT NULL,
  `Voucher_Status` int(11) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_order_main` (
  `id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float NOT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(20) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(100) DEFAULT NULL,
  `Location` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sales_order_main_ledger` (`voucher_ledger_id`),
  KEY `fk_sales_order_main_project` (`voucher_project_id`),
  KEY `fk_sales_order_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_sales_order_main_godown` (`godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sendchannel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_data` longtext NOT NULL,
  `to_db_name` varchar(255) DEFAULT NULL,
  `time_stamp` timestamp(6) NULL DEFAULT current_timestamp(6),
  `sent_at` timestamp(6) NULL DEFAULT NULL,
  `typeofdata` varchar(255) NOT NULL,
  `data_type` varchar(255) DEFAULT NULL,
  `generated_Transactionid` varchar(50) NOT NULL,
  `generated_voucher_id` int(11) DEFAULT NULL,
  `Action` int(11) NOT NULL,
  `action_type` int(11) NOT NULL DEFAULT 0,
  `notification_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_send_voucher` (`generated_voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicecomplaintregister_main` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Ledger_ID` varchar(100) DEFAULT NULL,
  `Contact_ID` varchar(100) DEFAULT NULL,
  `Voucher_Date` date DEFAULT NULL,
  `Date_Created` date DEFAULT NULL,
  `TimeStamp` timestamp NULL DEFAULT current_timestamp(),
  `Location` varchar(100) DEFAULT NULL,
  `Complaint_Status` int(11) DEFAULT NULL,
  `Completion_Date` date DEFAULT NULL,
  `Remarks` int(11) DEFAULT NULL,
  `Non_Completion_Reason` varchar(100) DEFAULT NULL,
  `Non_Completion_id` int(11) DEFAULT NULL,
  `InspectedBy` int(11) DEFAULT NULL,
  `InspectionCharge` float DEFAULT NULL,
  `Inspected_Date` date DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cash_out_ledger_id` int(11) DEFAULT NULL,
  `delivery_ledger_id` int(11) DEFAULT NULL,
  `all_other_ledger_id` int(11) DEFAULT NULL,
  `default_cash_ledger_id` int(11) DEFAULT NULL,
  `kot_copy_count` int(11) NOT NULL DEFAULT 1,
  `default_voucher_prefix` varchar(50) DEFAULT NULL,
  `round_off_limit` decimal(10,4) NOT NULL DEFAULT 0.0000,
  `Cash_Out` int(11) DEFAULT NULL,
  `Delivery` int(11) DEFAULT NULL,
  `All_Other` int(11) DEFAULT NULL,
  `KOT_Copy` int(11) DEFAULT NULL,
  `Voucher_Prefix` varchar(50) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `Start_Time` time DEFAULT NULL,
  `End_Time` time DEFAULT NULL,
  `End_Day` int(11) DEFAULT NULL,
  `MAC_ID` varchar(300) DEFAULT NULL,
  `Type_Of_Trade` varchar(30) DEFAULT NULL,
  `Default_Cash` varchar(100) DEFAULT NULL,
  `POS_Number` varchar(30) DEFAULT NULL,
  `Port_No` varchar(50) DEFAULT NULL,
  `allow_split_tables` tinyint(1) NOT NULL DEFAULT 0,
  `use_token_system` tinyint(1) NOT NULL DEFAULT 0,
  `use_fifo_valuation` tinyint(1) NOT NULL DEFAULT 0,
  `is_tax_inclusive` tinyint(1) NOT NULL DEFAULT 0,
  `fiscal_year_start_date` date DEFAULT NULL,
  `fiscal_year_end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `SplitTables` tinyint(1) DEFAULT NULL,
  `Token_System` tinyint(1) DEFAULT NULL,
  `Fifo_Valuation` tinyint(1) DEFAULT 0,
  `Inclusive` tinyint(1) DEFAULT NULL,
  `YearStartDate` date DEFAULT NULL,
  `YearEndDate` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_settings_cashout` (`cash_out_ledger_id`),
  KEY `fk_settings_delivery` (`delivery_ledger_id`),
  KEY `fk_settings_allother` (`all_other_ledger_id`),
  KEY `fk_settings_cashledger` (`default_cash_ledger_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shiftmaster` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shifttable` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `ShiftDate` datetime NOT NULL,
  `StartVoucherNo` int(11) NOT NULL,
  `StopVoucherNo` int(11) NOT NULL,
  `SalesValue` float NOT NULL,
  `OpeningBalance` float DEFAULT NULL,
  `CashSales` float DEFAULT NULL,
  `CardSales` float DEFAULT NULL,
  `CreditSales` float DEFAULT NULL,
  `PurchaseCash` float DEFAULT NULL,
  `PurchaseCredit` float DEFAULT NULL,
  `PurchaseTotal` float DEFAULT NULL,
  `PurchaseCard` float(10,2) DEFAULT NULL,
  `PaymentCash` float DEFAULT NULL,
  `ReceiptCash` float DEFAULT NULL,
  `ReceiptCard` float(10,2) NOT NULL,
  `ReceiptTotal` float(10,2) NOT NULL,
  `PaymentCard` float(10,2) NOT NULL,
  `PaymentTotal` float(10,2) NOT NULL,
  `cashierID` int(11) DEFAULT NULL,
  `voucherPrefix` varchar(10) DEFAULT NULL,
  `MacID` varchar(30) DEFAULT NULL,
  `POSNumber` varchar(30) DEFAULT NULL,
  `paxCount` int(11) DEFAULT NULL,
  `Narration` varchar(1000) DEFAULT NULL,
  `ShiftStart_DateTime` datetime DEFAULT NULL,
  `ShiftEnd_DateTime` datetime DEFAULT NULL,
  `TotalCash` float DEFAULT NULL,
  `CasinCounter` float DEFAULT NULL,
  `CashWithDrawn` float DEFAULT NULL,
  `CashBalance` float DEFAULT NULL,
  `TillDifference` float DEFAULT NULL,
  `ZomatoSales` float(10,2) DEFAULT NULL,
  `ZomatoCash` float(10,2) DEFAULT NULL,
  `ZomatoCredit` float(10,2) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shipments` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sku_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku_code` varchar(100) DEFAULT NULL,
  `inventory_item_id` int(11) DEFAULT NULL,
  `ITEM_ID` varchar(200) CHARACTER SET utf8 NOT NULL,
  `sku_name` varchar(150) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `rate` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `SKU_DESCRIPTION` varchar(2000) CHARACTER SET utf8 DEFAULT NULL,
  `SKU_TYPE` int(11) DEFAULT NULL,
  `SKU_POSSIBLE_VALUES` longtext CHARACTER SET utf8 DEFAULT NULL,
  `SKU_VALUE` varchar(500) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sku_item` (`inventory_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_details` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_No` varchar(100) NOT NULL,
  `Voucher_Prefix` varchar(100) NOT NULL,
  `Voucher_Date` date NOT NULL,
  `Inventory_Item_ID` varchar(100) NOT NULL,
  `SKU_ID` varchar(200) DEFAULT NULL,
  `Quantity` float NOT NULL,
  `Price` float NOT NULL,
  `UOM_id` varchar(50) DEFAULT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Project_ID` varchar(100) DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Salesman_ID` varchar(100) DEFAULT NULL,
  `Adj_value` decimal(10,2) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_journal_details` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_No` varchar(100) DEFAULT NULL,
  `Voucher_Prefix` varchar(100) DEFAULT NULL,
  `Voucher_Date` date DEFAULT NULL,
  `Inventory_Item_ID` varchar(100) DEFAULT NULL,
  `SKU_ID` varchar(200) DEFAULT NULL,
  `Quantity` float DEFAULT NULL,
  `Price` float DEFAULT NULL,
  `UOM_id` varchar(50) DEFAULT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Project_ID` varchar(100) DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Salesman_ID` varchar(100) DEFAULT NULL,
  `crQty` float DEFAULT NULL,
  `drQty` float DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_journal_main` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_No` varchar(100) NOT NULL,
  `Voucher_Prefix` varchar(100) NOT NULL,
  `Date_Created` date NOT NULL,
  `Voucher_Date` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Ledger_ID` varchar(100) DEFAULT NULL,
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Project_ID` varchar(100) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `Salesman_ID` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(11) DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `TransactionId` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `Voucher_No` (`Voucher_No`,`Voucher_Prefix`),
  UNIQUE KEY `Voucher_No_2` (`Voucher_No`,`Voucher_Prefix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_ledger` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_header_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `sku_id` int(11) DEFAULT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `godown_id` int(11) NOT NULL,
  `quantity_in` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `quantity_out` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `unit_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `posting_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_stock_posting_date` (`posting_date`),
  KEY `fk_stock_voucher` (`voucher_header_id`),
  KEY `fk_stock_item` (`item_id`),
  KEY `fk_stock_sku` (`sku_id`),
  KEY `fk_stock_batch` (`batch_id`),
  KEY `fk_stock_godown` (`godown_id`),
  CONSTRAINT `chk_qty_in_out` CHECK (`quantity_in` > 0.0000 and `quantity_out` = 0.0000 or `quantity_out` > 0.0000 and `quantity_in` = 0.0000)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_main` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_No` varchar(100) NOT NULL,
  `Voucher_Prefix` varchar(100) NOT NULL,
  `Date_Created` date NOT NULL,
  `Voucher_Date` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Ledger_ID` varchar(100) DEFAULT NULL,
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Project_ID` varchar(100) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` tinyint(1) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `Salesman_ID` varchar(100) DEFAULT NULL,
  `TransactionId` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `Voucher_No` (`Voucher_No`,`Voucher_Prefix`),
  UNIQUE KEY `Voucher_No_2` (`Voucher_No`,`Voucher_Prefix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_request_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `inventory_item_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `Item_ID` varchar(100) NOT NULL,
  `UOM_ID` varchar(50) DEFAULT NULL,
  `Time_Stamp` timestamp NULL DEFAULT NULL,
  `Calulated_Qty` float DEFAULT NULL,
  `Request_Qty` float DEFAULT NULL,
  `Issue_qty` float DEFAULT NULL,
  `WorkOrder_Id` varchar(50) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  `Consumed_Qty` float(10,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_stock_request_details_voucher` (`voucher_id`),
  KEY `fk_stock_request_details_sku` (`voucher_sku_id`),
  KEY `fk_stock_request_details_uom` (`voucher_uom_id`),
  KEY `fk_stock_request_details_item` (`inventory_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_request_main` (
  `id` int(11) NOT NULL,
  `from_godown_id` int(11) DEFAULT NULL,
  `to_godown_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `Kitchen_Area` varchar(100) DEFAULT NULL,
  `PROJECT_ID` varchar(100) DEFAULT NULL,
  `Time_Stamp` timestamp NULL DEFAULT NULL,
  `Last_Updated` datetime(6) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `From_Location` varchar(100) DEFAULT NULL,
  `To_Location` varchar(100) DEFAULT NULL,
  `VoucherStatus` varchar(200) DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_stock_request_main_project` (`voucher_project_id`),
  KEY `fk_stock_request_main_salesperson` (`salesperson_employee_id`),
  KEY `fk_stock_request_main_from_godown` (`from_godown_id`),
  KEY `fk_stock_request_main_to_godown` (`to_godown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tab_queue` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_Type` varchar(50) DEFAULT NULL,
  `Transaction_No` varchar(50) DEFAULT NULL,
  `Voucher_Prefix` varchar(10) DEFAULT NULL,
  `Added_By` int(11) DEFAULT NULL,
  `Request_Print` tinyint(1) DEFAULT NULL,
  `Printer_Name` varchar(50) DEFAULT NULL,
  `IP_Address` varchar(50) DEFAULT NULL,
  `time_stamp` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `Device_Id` varchar(50) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tax_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tax_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tax_name` (`tax_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tempbill` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `itemname` varchar(100) DEFAULT NULL,
  `groupname` varchar(100) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `addons` varchar(100) DEFAULT NULL,
  `order_Number` int(11) DEFAULT NULL,
  `ipaddress` int(11) DEFAULT NULL,
  `orderstatus` int(11) DEFAULT NULL,
  `reference` int(11) DEFAULT NULL,
  `Kot_Number` int(11) DEFAULT NULL,
  `printer` varchar(100) DEFAULT NULL,
  `EntryTime` timestamp NULL DEFAULT current_timestamp(),
  `Voucher_Prefix` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tempvalues` (
  `CashierID` varchar(30) DEFAULT NULL,
  `Kotnumber` int(10) DEFAULT NULL,
  `waiterID` int(11) DEFAULT NULL,
  `leftwords` varchar(500) DEFAULT NULL,
  `rightwords` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `terms_and_conditions` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(100) DEFAULT NULL,
  `Delivery_Time` varchar(2000) DEFAULT NULL,
  `Payment_Terms` varchar(2000) DEFAULT NULL,
  `Warranty` varchar(2000) DEFAULT NULL,
  `Validity` varchar(2000) DEFAULT NULL,
  `Exclusion` varchar(2000) DEFAULT NULL,
  `Extra` varchar(2000) DEFAULT NULL,
  `added_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_modified` timestamp NULL DEFAULT NULL,
  `last_modified_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `time_details` (
  `client_id` varchar(255) CHARACTER SET utf8 NOT NULL,
  `Z` timestamp(6) NOT NULL DEFAULT '0000-00-00 00:00:00.000000',
  `B` timestamp(6) NOT NULL DEFAULT '0000-00-00 00:00:00.000000',
  `X` timestamp(6) NOT NULL DEFAULT '0000-00-00 00:00:00.000000',
  `dbName` varchar(50) CHARACTER SET utf8 NOT NULL,
  `C` timestamp(6) NOT NULL DEFAULT '0000-00-00 00:00:00.000000',
  `D` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactionhelper` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transportation_details` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_No` varchar(20) DEFAULT NULL,
  `Voucher_Type` varchar(50) DEFAULT NULL,
  `Voucher_Prefix` varchar(20) DEFAULT NULL,
  `TransactionId` varchar(100) DEFAULT NULL,
  `Packed_By` int(11) DEFAULT NULL,
  `Delivered_By` int(11) DEFAULT NULL,
  `vehicle_details` longtext DEFAULT NULL,
  `Vehicle_Id` varchar(50) DEFAULT NULL,
  `added_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_modified` timestamp NULL DEFAULT NULL,
  `last_modified_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uom_conversion` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `baseUnit` varchar(500) NOT NULL,
  `toUnit` varchar(500) NOT NULL,
  `conValue` varchar(50) NOT NULL,
  `itemID` varchar(500) DEFAULT NULL,
  `narration` varchar(5000) DEFAULT NULL,
  `Hidden_row` varchar(50) DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uomlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `UOM_id` int(11) DEFAULT NULL,
  `uom_code` varchar(20) DEFAULT NULL,
  `uom_Name` varchar(200) NOT NULL,
  `decimal_places` int(1) NOT NULL DEFAULT 0,
  `narration` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `uom_symbol` varchar(50) DEFAULT NULL,
  `UOM_decimal_Points` int(11) DEFAULT 0,
  `UOM_Narration` varchar(2000) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Modified` timestamp NULL DEFAULT NULL,
  `Hidden_row` varchar(50) DEFAULT NULL,
  `SubUom` longtext DEFAULT NULL,
  `is_Composite` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UOM_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_access_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) DEFAULT NULL,
  `module_name` varchar(100) DEFAULT NULL,
  `User_Group_Id` int(11) DEFAULT NULL,
  `Ui_Id` int(11) DEFAULT NULL,
  `Allow_Create` tinyint(1) DEFAULT NULL,
  `Allow_Read` tinyint(1) DEFAULT NULL,
  `Allow_Update` tinyint(1) DEFAULT NULL,
  `Allow_Delete` tinyint(1) DEFAULT NULL,
  `Allow_Share` tinyint(1) DEFAULT NULL,
  `Extras` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_permission_role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_credentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contact_id` int(11) NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `employee_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `google_uuid` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gmail_address` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_voucher_prefix` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allow_all_prefix` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_contact_creds` (`contact_id`),
  KEY `fk_creds_role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Name` varchar(100) NOT NULL,
  `Requirements_View` tinyint(4) DEFAULT NULL,
  `Requirements_Add` tinyint(4) DEFAULT NULL,
  `Requirements_Update` tinyint(4) DEFAULT NULL,
  `Requirements_Delete` tinyint(4) DEFAULT NULL,
  `Quotes_View` tinyint(4) DEFAULT NULL,
  `Quotes_Add` tinyint(4) DEFAULT NULL,
  `Quotes_Update` tinyint(4) DEFAULT NULL,
  `Quotes_Delete` tinyint(4) DEFAULT NULL,
  `exportQuote` tinyint(4) DEFAULT NULL,
  `clientApprove` tinyint(4) DEFAULT NULL,
  `managerApprove` tinyint(4) DEFAULT NULL,
  `reviseQuote` tinyint(4) DEFAULT NULL,
  `DraftsMan_View` tinyint(4) DEFAULT NULL,
  `DraftsMan_Add` tinyint(4) DEFAULT NULL,
  `DraftsMan_Update` tinyint(4) DEFAULT NULL,
  `DraftsMan_Delete` tinyint(4) DEFAULT NULL,
  `Sales_Orders_View` tinyint(4) DEFAULT NULL,
  `Sales_Orders_Add` tinyint(4) DEFAULT NULL,
  `Sales_Orders_Update` tinyint(4) DEFAULT NULL,
  `Sales_Orders_Delete` tinyint(4) DEFAULT NULL,
  `Sales_Invoices_View` tinyint(4) DEFAULT NULL,
  `Sales_Invoices_Add` tinyint(4) DEFAULT NULL,
  `Sales_Invoices_Update` tinyint(4) DEFAULT NULL,
  `Sales_Invoices_Delete` tinyint(4) DEFAULT NULL,
  `Purchase_Orders_View` tinyint(4) DEFAULT NULL,
  `Purchase_Orders_Add` tinyint(4) DEFAULT NULL,
  `Purchase_Orders_Update` tinyint(4) DEFAULT NULL,
  `Purchase_Orders_Delete` tinyint(4) DEFAULT NULL,
  `Purchase_Invoices_View` tinyint(4) DEFAULT NULL,
  `Purchase_Invoices_Add` tinyint(4) DEFAULT NULL,
  `Purchase_Invoices_Update` tinyint(4) DEFAULT NULL,
  `Purchase_Invoices_Delete` tinyint(4) DEFAULT NULL,
  `Delivery_Notes_View` tinyint(4) DEFAULT NULL,
  `Delivery_Notes_Add` tinyint(4) DEFAULT NULL,
  `Delivery_Notes_Update` tinyint(4) DEFAULT NULL,
  `Delivery_Notes_Delete` tinyint(4) DEFAULT NULL,
  `Credit_Notes_View` tinyint(4) DEFAULT NULL,
  `Credit_Notes_Add` tinyint(4) DEFAULT NULL,
  `Credit_Notes_Update` tinyint(4) DEFAULT NULL,
  `Credit_Notes_Delete` tinyint(4) DEFAULT NULL,
  `Debit_Notes_View` tinyint(4) DEFAULT NULL,
  `Debit_Notes_Add` tinyint(4) DEFAULT NULL,
  `Debit_Notes_Update` tinyint(4) DEFAULT NULL,
  `Debit_Notes_Delete` tinyint(4) DEFAULT NULL,
  `Receipt_Notes_View` tinyint(4) DEFAULT NULL,
  `Receipt_Notes_Add` tinyint(4) DEFAULT NULL,
  `Receipt_Notes_Update` tinyint(4) DEFAULT NULL,
  `Receipt_Notes_Delete` tinyint(4) DEFAULT NULL,
  `Journals_View` tinyint(4) DEFAULT NULL,
  `Journals_Add` tinyint(4) DEFAULT NULL,
  `Journals_Update` tinyint(4) DEFAULT NULL,
  `Journals_Delete` tinyint(4) DEFAULT NULL,
  `Payments_View` tinyint(4) DEFAULT NULL,
  `Payments_Add` tinyint(4) DEFAULT NULL,
  `Payments_Update` tinyint(4) DEFAULT NULL,
  `Payments_Delete` tinyint(4) DEFAULT NULL,
  `Purchases_View` tinyint(4) DEFAULT NULL,
  `Purchases_Add` tinyint(4) DEFAULT NULL,
  `Purchases_Update` tinyint(4) DEFAULT NULL,
  `Purchases_Delete` tinyint(4) DEFAULT NULL,
  `Receipts_View` tinyint(4) DEFAULT NULL,
  `Receipts_Add` tinyint(4) DEFAULT NULL,
  `Receipts_Update` tinyint(4) DEFAULT NULL,
  `Receipts_Delete` tinyint(4) DEFAULT NULL,
  `Stock_Entries_View` tinyint(4) DEFAULT NULL,
  `Stock_Entries_Add` tinyint(4) DEFAULT NULL,
  `Stock_Entries_Update` tinyint(4) DEFAULT NULL,
  `Stock_Entries_Delete` tinyint(4) DEFAULT NULL,
  `Stock_Journals_View` tinyint(4) DEFAULT NULL,
  `Stock_Journals_Add` tinyint(4) DEFAULT NULL,
  `Stock_Journals_Update` tinyint(4) DEFAULT NULL,
  `Stock_Journals_Delete` tinyint(4) DEFAULT NULL,
  `Material_In_Out_View` tinyint(4) DEFAULT NULL,
  `Material_In_Out_Add` tinyint(4) DEFAULT NULL,
  `Material_In_Out_Update` tinyint(4) DEFAULT NULL,
  `Material_In_Out_Delete` tinyint(4) DEFAULT NULL,
  `Godown_Transfer_View` tinyint(4) DEFAULT NULL,
  `Godown_Transfer_Add` tinyint(4) DEFAULT NULL,
  `Godown_Transfer_Update` tinyint(4) DEFAULT NULL,
  `Godown_Transfer_Delete` tinyint(4) DEFAULT NULL,
  `Account_Groups_View` tinyint(4) DEFAULT NULL,
  `Account_Groups_Add` tinyint(4) DEFAULT NULL,
  `Account_Groups_Update` tinyint(4) DEFAULT NULL,
  `Account_Groups_Delete` tinyint(4) DEFAULT NULL,
  `Ledgers_View` tinyint(4) DEFAULT NULL,
  `Ledgers_Add` tinyint(4) DEFAULT NULL,
  `Ledgers_Update` tinyint(4) DEFAULT NULL,
  `Ledgers_Delete` tinyint(4) DEFAULT NULL,
  `Bank_View` tinyint(4) DEFAULT NULL,
  `Bank_Add` tinyint(4) DEFAULT NULL,
  `Bank_Update` tinyint(4) DEFAULT NULL,
  `Bank_Delete` tinyint(4) DEFAULT NULL,
  `Brands_View` tinyint(4) DEFAULT NULL,
  `Brands_Add` tinyint(4) DEFAULT NULL,
  `Brands_Update` tinyint(4) DEFAULT NULL,
  `Brands_Delete` tinyint(4) DEFAULT NULL,
  `Godowns_View` tinyint(4) DEFAULT NULL,
  `Godowns_Add` tinyint(4) DEFAULT NULL,
  `Godowns_Update` tinyint(4) DEFAULT NULL,
  `Godowns_Delete` tinyint(4) DEFAULT NULL,
  `Properties_View` tinyint(4) DEFAULT NULL,
  `Properties_Add` tinyint(4) DEFAULT NULL,
  `Properties_Update` tinyint(4) DEFAULT NULL,
  `Properties_Delete` tinyint(4) DEFAULT NULL,
  `Sales_Inventory_Groups_View` tinyint(4) DEFAULT NULL,
  `Sales_Inventory_Groups_Add` tinyint(4) DEFAULT NULL,
  `Sales_Inventory_Groups_Update` tinyint(4) DEFAULT NULL,
  `Sales_Inventory_Groups_Delete` tinyint(4) DEFAULT NULL,
  `Sales_Inventory_Items_View` tinyint(4) DEFAULT NULL,
  `Sales_Inventory_Items_Add` tinyint(4) DEFAULT NULL,
  `Sales_Inventory_Items_Update` tinyint(4) DEFAULT NULL,
  `Sales_Inventory_Items_Delete` tinyint(4) DEFAULT NULL,
  `UOM_View` tinyint(4) DEFAULT NULL,
  `UOM_Add` tinyint(4) DEFAULT NULL,
  `UOM_Update` tinyint(4) DEFAULT NULL,
  `UOM_Delete` tinyint(4) DEFAULT NULL,
  `Price_Lists_View` tinyint(4) DEFAULT NULL,
  `Price_Lists_Add` tinyint(4) DEFAULT NULL,
  `Price_Lists_Update` tinyint(4) DEFAULT NULL,
  `Price_Lists_Delete` tinyint(4) DEFAULT NULL,
  `InventoryMasters` tinyint(4) DEFAULT NULL,
  `InventoryTransactions` tinyint(4) DEFAULT NULL,
  `FinanceMasters` tinyint(4) DEFAULT NULL,
  `FinanceTransactions` tinyint(4) DEFAULT NULL,
  `HR` tinyint(4) DEFAULT NULL,
  `Purchases` tinyint(4) DEFAULT NULL,
  `WareHouse` tinyint(4) DEFAULT NULL,
  `HelpDesk` tinyint(4) DEFAULT NULL,
  `Services` tinyint(4) DEFAULT NULL,
  `Finances` tinyint(4) DEFAULT NULL,
  `Inventory` tinyint(4) DEFAULT NULL,
  `Projects` tinyint(4) DEFAULT NULL,
  `Projects_View` tinyint(4) DEFAULT NULL,
  `Projects_Add` tinyint(4) DEFAULT NULL,
  `Projects_Update` tinyint(4) DEFAULT NULL,
  `Projects_Delete` tinyint(4) DEFAULT NULL,
  `Doucuments_View` tinyint(4) DEFAULT NULL,
  `Doucuments_Add` tinyint(4) DEFAULT NULL,
  `Doucuments_Update` tinyint(4) DEFAULT NULL,
  `Doucuments_Delete` tinyint(4) DEFAULT NULL,
  `WorkOrder_View` tinyint(4) DEFAULT NULL,
  `WorkOrder_Add` tinyint(4) DEFAULT NULL,
  `WorkOrder_Update` tinyint(4) DEFAULT NULL,
  `WorkOrder_Delete` tinyint(4) DEFAULT NULL,
  `DraftsExtraDocs` tinyint(4) DEFAULT NULL,
  `DraftStatus` tinyint(4) DEFAULT NULL,
  `MaxDiscountPercent` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicle_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehicle_master_id` int(11) DEFAULT NULL,
  `driver_contact_id` int(11) DEFAULT NULL,
  `shipping_company_id` int(11) DEFAULT NULL,
  `capacity` decimal(10,3) DEFAULT NULL,
  `Vehicle_Name` varchar(50) DEFAULT NULL,
  `Description` varchar(100) DEFAULT NULL,
  `Driver_Name` varchar(50) DEFAULT NULL,
  `Driver_Phone` varchar(50) DEFAULT NULL,
  `Vehicle_Capacity` varchar(50) DEFAULT NULL,
  `Shipping_Company` varchar(100) DEFAULT NULL,
  `TRN` varchar(50) DEFAULT NULL,
  `Rate_Per_Km` decimal(15,4) DEFAULT 0.0000,
  `In_Time` timestamp NULL DEFAULT NULL,
  `Out_Time` timestamp NULL DEFAULT NULL,
  `Unloaded_Weight` decimal(10,3) DEFAULT NULL,
  `Loaded_Weight` decimal(10,3) DEFAULT NULL,
  `Total_Weight` decimal(10,3) DEFAULT NULL,
  `is_outward` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_log_vehicle` (`vehicle_master_id`),
  KEY `fk_log_driver` (`driver_contact_id`),
  KEY `fk_log_shipping_company` (`shipping_company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehilce_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehicle_code` varchar(100) DEFAULT NULL,
  `owner_addr_contact_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `License_Plate_No` varchar(200) DEFAULT NULL,
  `Engine_No` varchar(200) DEFAULT NULL,
  `Vehicle_Brand` varchar(200) DEFAULT NULL,
  `Vehicle_Model` varchar(200) DEFAULT NULL,
  `Vehicle_Model_Variant` varchar(200) DEFAULT NULL,
  `Body_Color` varchar(200) DEFAULT NULL,
  `Purchase_Date` date DEFAULT NULL,
  `Odometer_Initial` int(11) DEFAULT NULL,
  `Fuel_Type` varchar(200) DEFAULT NULL,
  `Transmission_Type` varchar(200) DEFAULT NULL,
  `Last_Service_Date` date DEFAULT NULL,
  `Last_Service_Odometer` int(11) DEFAULT NULL,
  `Next_Service_Date` date DEFAULT NULL,
  `Next_Service_Odo` int(11) DEFAULT NULL,
  `Insurance_Provider` varchar(200) DEFAULT NULL,
  `Insurance_Policy_Number` varchar(200) DEFAULT NULL,
  `Insurance_Expiry_Date` date DEFAULT NULL,
  `Notes` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_vehicle_owner` (`owner_addr_contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visitorsregister` (
  `_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DATEVAL` datetime NOT NULL,
  `PHONENUMBER` varchar(100) DEFAULT NULL,
  `NAME` varchar(500) DEFAULT NULL,
  `ADDRESS` varchar(500) DEFAULT NULL,
  `TEMPERATURE` float DEFAULT NULL,
  `TIME_STAMP` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voucher_contacts_list` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Transaction_ID` varchar(100) NOT NULL,
  `AddressBook_ID` varchar(100) NOT NULL,
  `Contact_Name` varchar(200) DEFAULT NULL,
  `Contact_Phone` varchar(100) DEFAULT NULL,
  `Contact_Address` varchar(2000) DEFAULT NULL,
  `Address_Proof_File` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voucher_headers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_prefix` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_hdr` (`voucher_type`,`voucher_prefix`,`voucher_no`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voucher_line_allocations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `detail_line_id` int(11) NOT NULL,
  `ledger_id` int(11) NOT NULL,
  `allocation_type` enum('EXPENSE','DISCOUNT','TAX','CHARGE','REBATE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `allocated_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `allocation_method` enum('BY_VALUE','BY_QUANTITY','BY_WEIGHT','BY_VOLUME','MANUAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BY_VALUE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_line_allocation_ledger` (`ledger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voucher_line_relations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_line_id` int(11) NOT NULL,
  `target_line_id` int(11) NOT NULL,
  `quantity_converted` decimal(12,4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_source_line` (`source_line_id`),
  KEY `idx_target_line` (`target_line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voucher_no_seq` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_type` varchar(100) NOT NULL,
  `voucher_prefix` varchar(100) NOT NULL,
  `voucher_no` varchar(100) NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `voucher_type` (`voucher_type`,`voucher_prefix`),
  UNIQUE KEY `voucher_type_2` (`voucher_type`,`voucher_prefix`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voucher_type_prefix_mapping` (
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `Voucher_Type` varchar(50) DEFAULT NULL,
  `Voucher_Prefix` varchar(50) DEFAULT NULL,
  `Voucher_Name` varchar(100) DEFAULT NULL,
  `Affects_Ledger` tinyint(1) DEFAULT NULL,
  `Affects_Inventory` tinyint(1) DEFAULT NULL,
  `Inward_1_Outward_2` int(11) DEFAULT NULL,
  `Default_Price_List` int(11) DEFAULT NULL,
  `Default_Godown` varchar(100) DEFAULT 'Godown',
  `TAX_CLASS_ID` varchar(100) DEFAULT NULL,
  `autoRoundOff` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voucherlinkage` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voucherseries` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wastage_entry_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `voucher_sku_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `drQty` float DEFAULT NULL,
  `crQty` float DEFAULT NULL,
  `Price` float NOT NULL,
  `PriceLevel` varchar(100) DEFAULT NULL,
  `isCompoundItem` tinyint(1) DEFAULT NULL,
  `subItemOff_list_ID` varchar(100) DEFAULT NULL,
  `Discount_Percent` float DEFAULT NULL,
  `Discount_Amount` float DEFAULT NULL,
  `Subtotal` float DEFAULT NULL,
  `Item_Narration` varchar(2000) DEFAULT NULL,
  `Item_Description` varchar(2000) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_wastage_entry_details_voucher` (`voucher_id`),
  KEY `fk_wastage_entry_details_item` (`item_id`),
  KEY `fk_wastage_entry_details_sku` (`voucher_sku_id`),
  KEY `fk_wastage_entry_details_uom` (`voucher_uom_id`),
  KEY `fk_wastage_entry_details_project` (`voucher_project_id`),
  KEY `fk_wastage_entry_details_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wastage_entry_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` tinyint(1) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `TransactionId` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_wastage_entry_main_ledger` (`voucher_ledger_id`),
  KEY `fk_wastage_entry_main_project` (`voucher_project_id`),
  KEY `fk_wastage_entry_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `work_order_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `technician_employee_id` int(11) DEFAULT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_uom_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `WorkOrder_id` varchar(100) DEFAULT NULL,
  `SalesOrder_Id` varchar(100) DEFAULT NULL,
  `requirement_no` varchar(100) DEFAULT NULL,
  `Quantity` decimal(10,3) DEFAULT NULL,
  `Price` float DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `TechnicanID` varchar(50) DEFAULT NULL,
  `CompletedDate` datetime DEFAULT NULL,
  `Expected_Date` date DEFAULT NULL,
  `TimeStamp` datetime NOT NULL DEFAULT current_timestamp(),
  `Remarks` varchar(500) DEFAULT NULL,
  `DN_id` varchar(100) DEFAULT NULL,
  `Start_TimeStamp` timestamp NULL DEFAULT NULL,
  `Completion_Timestamp` timestamp NULL DEFAULT NULL,
  `Section` varchar(20) DEFAULT NULL,
  `UOM_Id` varchar(50) DEFAULT NULL,
  `ItemVoucherStatus` int(11) DEFAULT NULL,
  `itemProductionStatus` int(11) DEFAULT NULL,
  `Requirement_ItemID` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_work_order_detail_voucher` (`voucher_id`),
  KEY `fk_work_order_detail_item` (`item_id`),
  KEY `fk_work_order_detail_uom` (`voucher_uom_id`),
  KEY `fk_work_order_detail_project` (`voucher_project_id`),
  KEY `fk_work_order_detail_salesperson` (`salesperson_employee_id`),
  KEY `fk_work_order_detail_technician` (`technician_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `work_order_main` (
  `id` int(11) NOT NULL,
  `salesperson_employee_id` int(11) DEFAULT NULL,
  `voucher_project_id` int(11) DEFAULT NULL,
  `voucher_ledger_id` int(11) DEFAULT NULL,
  `Date_Created` date NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `Last_Updated` datetime(6) DEFAULT current_timestamp(6),
  `Billing_Name` varchar(100) DEFAULT NULL,
  `Total` float NOT NULL,
  `Discount_in_Amount` float DEFAULT NULL,
  `Discount_in_Percent` float DEFAULT NULL,
  `Narration` varchar(2000) DEFAULT NULL,
  `Added_By` varchar(100) DEFAULT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `Completion_Probability` float DEFAULT NULL,
  `Credit_Period` int(11) DEFAULT NULL,
  `Revision_Number` varchar(100) DEFAULT NULL,
  `Converted_To_Sales_Order` varchar(100) DEFAULT NULL,
  `Quotation_Dropped` tinyint(1) DEFAULT NULL,
  `Quotation_Dropped_Reason` varchar(2000) DEFAULT NULL,
  `Requirement_Voucher_No` varchar(100) DEFAULT NULL,
  `PaymentCompleted` varchar(50) DEFAULT NULL,
  `VoucherStatus` varchar(50) DEFAULT NULL,
  `LPO_Ref` varchar(100) DEFAULT NULL,
  `MODE_OF_SERVICE` varchar(10) DEFAULT NULL,
  `Vat_Amount` float DEFAULT NULL,
  `Gross_Total` float DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Voucher_No_Display` varchar(20) DEFAULT NULL,
  `Requirement_Voucher_List` longtext DEFAULT NULL,
  `Origin` int(20) DEFAULT NULL,
  `Customer_Expected_Date` date DEFAULT NULL,
  `Round_Off` float DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `Section` varchar(100) DEFAULT NULL,
  `Completed_TimeStamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_work_order_main_ledger` (`voucher_ledger_id`),
  KEY `fk_work_order_main_project` (`voucher_project_id`),
  KEY `fk_work_order_main_salesperson` (`salesperson_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

