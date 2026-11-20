import { z } from 'zod';
import { SkuType, PriceListEntryType, ProductAttributeType } from './enums';

// ── UOM (uomlist) ──────────────────────────────────────────
export const uomSchema = z.object({
  body: z.object({
    uom_Name: z.string().min(1).max(200),
    uom_code: z.string().min(1).max(20).optional().nullable(),
    decimal_places: z.number().int().nonnegative().default(0),
    narration: z.string().max(50).optional().nullable(),
    uom_symbol: z.string().max(50).optional().nullable(),
    UOM_decimal_Points: z.number().int().nonnegative().default(0),
    UOM_Narration: z.string().max(2000).optional().nullable(),
    is_Composite: z.boolean().default(false),
    SubUom: z.string().optional().nullable(),
    Hidden_row: z.string().max(50).optional().nullable(),
  }),
});

// ── Brand (brands) ─────────────────────────────────────────
export const brandSchema = z.object({
  body: z.object({
    Brand_Name: z.string().min(1).max(150),
    Brand_Description: z.string().max(2000).optional().nullable(),
  }),
});

// ── Category (category) ────────────────────────────────────
export const categorySchema = z.object({
  body: z.object({
    category_code: z.string().min(1).max(50).optional().nullable(),
    category_name: z.string().min(1).max(20),
    Description: z.string().max(50).optional().nullable(),
  }),
});

// ── TaxCategories (tax_categories) ─────────────────────────
export const taxCategorySchema = z.object({
  body: z.object({
    tax_name: z.string().min(1).max(50),
    tax_rate: z.number().min(0).max(100),
    is_active: z.boolean().default(true),
  }),
});

// ── InventoryGroup (sales_inventory_groups) ────────────────
export const inventoryGroupSchema = z.object({
  body: z.object({
    group_code: z.string().min(1).max(50).optional().nullable(),
    Group_ID: z.string().min(1).max(50).optional().nullable(),
    Group_Name: z.string().min(1).max(100),
    parent_group_id: z.number().int().optional().nullable(),
    Parent_ID: z.string().max(50).optional().nullable(),
    Group_Type: z.string().max(50).optional().nullable(),
    GroupNameArabic: z.string().max(500).optional().nullable(),
  }),
});

// ── InventoryItem (sales_inventory_items) ──────────────────
export const inventoryItemSchema = z.object({
  body: z.object({
    Item_Name: z.string().min(1).max(500),
    Item_Alias: z.string().max(500).optional().nullable(),
    inventory_group_id: z.number().int().optional().nullable(),
    uom_id: z.number().int().optional().nullable(),
    inventory_brand_id: z.number().int().optional().nullable(),
    category_id: z.number().int().optional().nullable(),
    Item_Code: z.string().min(1).max(500),
    Group_Id: z.string().min(1).max(100),
    Part_Number: z.string().max(100).optional().nullable(),
    Price: z.number().default(0),
    Opening_Stock: z.number().optional().nullable(),
    opening_stock_value: z.number().default(0),
    Opening_Balance: z.number().default(0),
    Opening_Balance_Date: z.coerce.date().optional().nullable(),
    Opening_Rate: z.number().optional().nullable(),
    Opening_Value: z.number().default(0),
    Narration: z.string().max(500).optional().nullable(),
    Serial_Number: z.string().max(100).optional().nullable(),
    Closing_Stock: z.number().default(0),
    Reorder_Level: z.number().default(0),
    is_purchase_item: z.boolean().default(true),
    is_sales_item: z.boolean().default(true),
    is_stock_item: z.boolean().default(true),
    is_serialized: z.boolean().default(false),
    is_batch_tracked: z.boolean().default(false),
    is_service: z.boolean().default(false),
    is_perishable: z.boolean().default(false),
    is_active: z.boolean().default(true),
    sales_gl_ledger_id: z.number().int().optional().nullable(),
    Std_Cost: z.number().default(0),
    Default_Sales_Ledger_id: z.string().max(100).optional().nullable(),
    default_purchase_ledger_id: z.number().int().optional().nullable(),
    default_sales_return_ledger_id: z.number().int().optional().nullable(),
    default_purchase_return_ledger_id: z.number().int().optional().nullable(),
    default_tax_category_id: z.number().int().optional().nullable(),
    Default_Input_Tax_Ledger: z.string().max(500).optional().nullable(),
    Default_Output_Tax_Ledger: z.string().max(500).optional().nullable(),
    Default_Sales_Return_Ledger: z.string().max(500).optional().nullable(),
    Default_Purchase_Return_Ledger: z.string().max(500).optional().nullable(),
    Vat_Rate: z.number().default(0),
    Default_UOM_ID: z.string().max(100).optional().nullable(),
    Warranty_Days: z.number().int().default(0),
    Shelf_Life: z.number().default(0),
    Brand_Id: z.string().max(150).optional().nullable(),
    base_price: z.number().default(0),
    standard_cost: z.number().default(0),
    moving_average_cost: z.number().default(0),
    Item_Description: z.string().max(2000).optional().nullable(),
    isCustomItem: z.boolean().optional().nullable(),
    Dimension: z.string().max(500).optional().nullable(),
    KOT_Printer: z.string().max(100).optional().nullable(),
    Item_Name_Arabic: z.string().max(500).optional().nullable(),
    Favourite: z.boolean().optional().nullable(),
    From_Time: z.coerce.date().optional().nullable(), // Can be string or datetime
    To_Time: z.coerce.date().optional().nullable(),
    Price_2: z.number().optional().nullable(),
    HSN_CODE: z.string().max(100).optional().nullable(),
    Section: z.string().max(100).optional().nullable(),
    Flags: z.string().optional().nullable(),
    Category: z.string().max(100).optional().nullable(),
    DefaultLedgerID: z.string().max(100).optional().nullable(),
    isSerailNumbered: z.boolean().default(false),
    isBatchProcessed: z.boolean().default(false),
    weight: z.number().optional().nullable(),
    location: z.string().max(50).optional().nullable(),
  }),
});

// ── SKUMaster (sku_master) ─────────────────────────────────
export const skuMasterSchema = z.object({
  body: z.object({
    sku_code: z.string().max(100).optional().nullable(),
    inventory_item_id: z.number().int().optional().nullable(),
    ITEM_ID: z.string().max(200),
    sku_name: z.string().max(150).optional().nullable(),
    barcode: z.string().max(100).optional().nullable(),
    rate: z.number().optional().nullable(),
    SKU_DESCRIPTION: z.string().max(2000).optional().nullable(),
    SKU_TYPE: z.nativeEnum(SkuType).optional().nullable(),
    SKU_POSSIBLE_VALUES: z.string().optional().nullable(),
    SKU_VALUE: z.string().max(500).optional().nullable(),
  }),
});

// ── ItemBatch (item_batches) ───────────────────────────────
export const itemBatchSchema = z.object({
  body: z.object({
    item_id: z.number().int(),
    batch_number: z.string().min(1).max(100),
    manufacturing_date: z.coerce.date().optional().nullable(),
    expiration_date: z.coerce.date().optional().nullable(),
    cost_price: z.number().default(0),
    selling_price: z.number().default(0),
    is_active: z.boolean().default(true),
  }),
});

// ── ItemProperty (sales_inventory_item_properties) ────────
export const itemPropertySchema = z.object({
  body: z.object({
    Property_ID: z.string().min(1).max(50),
    Item_ID: z.string().min(1).max(100),
    Default_Value: z.string().max(100).optional().nullable(),
  }),
});

// ── ItemImage (sales_inventory_images) ─────────────────────
export const itemImageSchema = z.object({
  body: z.object({
    Item_Id: z.string().min(1).max(1000),
    ImageBase64: z.string().optional().nullable(), // input as base64 string
    Narration: z.string().max(50).optional().nullable(),
    width: z.number().int().optional().nullable(),
    height: z.number().int().optional().nullable(),
    type: z.string().max(20).optional().nullable(),
    FileName: z.string().max(500).optional().nullable(),
  }),
});

// ── Ingredient (ingredients / Recipe) ───────────────────────
export const ingredientSchema = z.object({
  body: z.object({
    sales_item_id: z.number().int().optional().nullable(),
    purchase_item_id: z.number().int().optional().nullable(),
    purchase_uom_id: z.number().int().optional().nullable(),
    prep_route_id: z.number().int().optional().nullable(),
    take_away_applicable: z.boolean().default(true),
    sales_item: z.string().max(100),
    sales_item_qty: z.number().default(1),
    purchase_item: z.string().max(100),
    purchase_item_qty: z.number().default(0),
    TakeAway: z.number().int().optional().nullable(),
    Purchase_unit: z.number().int().optional().nullable(),
    Route_ID: z.string().max(100).optional().nullable(),
  }),
});

// ── Godown (godown) ────────────────────────────────────────
export const godownSchema = z.object({
  body: z.object({
    godown_code: z.string().max(100).optional().nullable(),
    Godown_Name: z.string().min(1).max(100),
    Godown_Location: z.string().max(100).optional().nullable(),
    Godown_Narration: z.string().max(500).optional().nullable(),
    is_profit_centre: z.boolean().default(false),
    is_default: z.boolean().default(false),
    is_production: z.boolean().default(false),
  }),
});

// ── UOMConversion (uom_conversion) ────────────────────────
export const uomConversionSchema = z.object({
  body: z.object({
    baseUnit: z.string().max(500),
    toUnit: z.string().max(500),
    conValue: z.string().max(50),
    itemID: z.string().max(500).optional().nullable(),
    narration: z.string().max(5000).optional().nullable(),
    Hidden_row: z.string().max(50).optional().nullable(),
    barcode: z.string().max(50).optional().nullable(),
  }),
});

// ── PriceList (price_lists) ────────────────────────────────
export const priceListSchema = z.object({
  body: z.object({
    Price_List_Name: z.string().min(1).max(100),
    Price_List_Start_Date: z.coerce.date().optional().nullable(),
    Price_List_End_Date: z.coerce.date().optional().nullable(),
    Price_List_Default: z.boolean().default(false),
    Price_List_ShowInPos: z.boolean().default(true),
    Price_List_isOnline: z.boolean().default(false),
  }),
});

// ── PriceListEntry (pricelist_entries) ─────────────────────
export const priceListEntrySchema = z.object({
  body: z.object({
    Item_Id: z.string().max(50),
    Price: z.number(),
    Price_List_ID: z.number().int(),
    percent: z.number().optional().nullable(),
    UOM_Id: z.string().max(20).optional().nullable(),
    MRP2_STD1_CUS0: z.nativeEnum(PriceListEntryType).default(PriceListEntryType.CUSTOM),
  }),
});

// ── RouteMaster (route_master) ─────────────────────────────
export const routeMasterSchema = z.object({
  body: z.object({
    route_id: z.string().min(1).max(50),
    route_name: z.string().max(20).optional().nullable(),
    Description: z.string().max(50).optional().nullable(),
  }),
});

// ── RouteCustomerMapping (route_customer_mapping) ──────────
export const routeCustomerMappingSchema = z.object({
  body: z.object({
    route_master_id: z.number().int().optional().nullable(),
    customer_ledger_id: z.number().int().optional().nullable(),
    Ledger_ID: z.string().max(100),
  }),
});

// ── RouteMapping (route_mapping) ───────────────────────────
export const routeMappingSchema = z.object({
  body: z.object({
    route_master_id: z.number().int().optional().nullable(),
    salesperson_employee_id: z.number().int().optional().nullable(),
    Day_Of_Week: z.string().max(11), // 'Mon', 'Tue', etc. or full names
    Salesman_ID: z.number().int(),
    Date_Created: z.coerce.date(),
  }),
});

// ── LedgerItemMapping (ledger_item_mapping) ────────────────
export const ledgerItemMappingSchema = z.object({
  body: z.object({
    Ledger_Id: z.string().max(50),
    Item_Id: z.string().max(50),
  }),
});

// ── Product Attributes (product_attributes) ────────────────
export const productAttributeSchema = z.object({
  body: z.object({
    attribute_name: z.string().min(1).max(100),
    attribute_code: z.string().max(50).optional().nullable(),
    attribute_type: z.nativeEnum(ProductAttributeType).default(ProductAttributeType.PREDETERMINED),
    data_type: z.string().max(20).default('TEXT'),
    parent_id: z.number().int().optional().nullable(),
    unit: z.string().max(50).optional().nullable(),
    is_active: z.boolean().default(true),
  }),
});

export const updateProductAttributeSchema = z.object({
  body: z.object({
    attribute_name: z.string().min(1).max(100).optional(),
    attribute_code: z.string().max(50).optional().nullable(),
    attribute_type: z.nativeEnum(ProductAttributeType).optional(),
    data_type: z.string().max(20).optional(),
    parent_id: z.number().int().optional().nullable(),
    unit: z.string().max(50).optional().nullable(),
    is_active: z.boolean().optional(),
  }),
});

// ── Product Attribute Values (product_attribute_values) ────
export const productAttributeValueSchema = z.object({
  body: z.object({
    attribute_value: z.string().min(1).max(100),
    value_code: z.string().max(50).optional().nullable(),
    display_order: z.number().int().default(0),
    is_active: z.boolean().default(true),
  }),
});

export const updateProductAttributeValueSchema = z.object({
  body: z.object({
    attribute_value: z.string().min(1).max(100).optional(),
    value_code: z.string().max(50).optional().nullable(),
    display_order: z.number().int().optional(),
    is_active: z.boolean().optional(),
  }),
});

// ── Item Attribute Assignments (item_attribute_assignments) ─
export const assignItemAttributesSchema = z.object({
  body: z.object({
    attributes: z.array(
      z.object({
        attribute_id: z.number().int(),
        is_required: z.boolean().default(false),
        display_order: z.number().int().default(0),
      }),
    ),
  }),
});

// ── Variant SKU Resolution ─────────────────────────────────
export const resolveVariantSkuSchema = z.object({
  body: z.object({
    itemId: z.number().int(),
    attributes: z.array(
      z.object({
        attributeId: z.number().int(),
        value: z.string().min(1),
        valueId: z.number().int().optional().nullable(),
      }),
    ).min(1),
    rate: z.number().optional().nullable(),
    skuCode: z.string().max(100).optional().nullable(),
    barcode: z.string().max(100).optional().nullable(),
  }),
});
