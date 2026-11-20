-- INV-ATTR-001: Product Attributes, Values, Item Assignments, and Variant SKU Resolution
-- No FOREIGN KEY constraints (relationMode=prisma).
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- 1. product_attributes
CREATE TABLE IF NOT EXISTS `product_attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attribute_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attribute_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attribute_type` enum('PREDETERMINED','EDITABLE','GROUP') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PREDETERMINED',
  `data_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEXT',
  `parent_id` int(11) DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_attribute_code` (`attribute_code`),
  KEY `fk_attr_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. product_attribute_values (options for predetermined attributes)
CREATE TABLE IF NOT EXISTS `product_attribute_values` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attribute_id` int(11) NOT NULL,
  `attribute_value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_val_attr` (`attribute_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. item_attribute_assignments (links attributes to sales_inventory_items)
CREATE TABLE IF NOT EXISTS `item_attribute_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `attribute_id` int(11) NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_item_attribute` (`item_id`, `attribute_id`),
  KEY `fk_item_attr_attr` (`attribute_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. sku_attribute_values (attribute-value pairs for each SKU variant)
CREATE TABLE IF NOT EXISTS `sku_attribute_values` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku_id` int(11) NOT NULL,
  `attribute_id` int(11) NOT NULL,
  `attribute_value_id` int(11) DEFAULT NULL,
  `attribute_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sku_attribute` (`sku_id`, `attribute_id`),
  KEY `fk_sku_attr_attr` (`attribute_id`),
  KEY `fk_sku_attr_val` (`attribute_value_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Alter sku_master to add attribute_hash, attribute_summary and unique key
ALTER TABLE `sku_master`
  ADD COLUMN IF NOT EXISTS `attribute_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `attribute_summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- Check and add unique key if not exists
SET @dbname = DATABASE();
SET @tablename = "sku_master";
SET @keyname = "uk_item_attr_hash";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND INDEX_NAME = @keyname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE sku_master ADD UNIQUE KEY uk_item_attr_hash (inventory_item_id, attribute_hash)"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
