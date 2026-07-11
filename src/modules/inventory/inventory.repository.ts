import { BaseRepository } from '../../core/repository/BaseRepository';
import {
  uomlist,
  brands,
  category,
  tax_categories,
  sales_inventory_groups,
  sales_inventory_items,
  sku_master,
  item_batches,
  sales_inventory_item_properties,
  sales_inventory_images,
  ingredients,
  godown,
  uom_conversion,
  price_lists,
  pricelist_entries,
  route_master,
  route_customer_mapping,
  route_mapping,
  ledger_item_mapping,
} from '@prisma/client';

export class UomRepository extends BaseRepository<uomlist> {
  constructor() {
    super({
      modelName: 'uomlist',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'Last_Modified',
      },
    });
  }
}

export class BrandRepository extends BaseRepository<brands> {
  constructor() {
    super({
      modelName: 'brands',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'Last_Modified',
      },
    });
  }
}

export class CategoryRepository extends BaseRepository<category> {
  constructor() {
    super({
      modelName: 'category',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class TaxCategoryRepository extends BaseRepository<tax_categories> {
  constructor() {
    super({
      modelName: 'tax_categories',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class InventoryGroupRepository extends BaseRepository<sales_inventory_groups> {
  constructor() {
    super({
      modelName: 'sales_inventory_groups',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'Last_Modified',
      },
    });
  }
}

export class InventoryItemRepository extends BaseRepository<sales_inventory_items> {
  constructor() {
    super({
      modelName: 'sales_inventory_items',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        createdAt: 'Date_Created',
        lastModified: 'Last_Modified',
        lastModifiedBy: 'Last_Modified_By',
      },
    });
  }
}

export class SKUMasterRepository extends BaseRepository<sku_master> {
  constructor() {
    super({
      modelName: 'sku_master',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class ItemBatchRepository extends BaseRepository<item_batches> {
  constructor() {
    super({
      modelName: 'item_batches',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class ItemPropertyRepository extends BaseRepository<sales_inventory_item_properties> {
  constructor() {
    super({
      modelName: 'sales_inventory_item_properties',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class ItemImageRepository extends BaseRepository<sales_inventory_images> {
  constructor() {
    super({
      modelName: 'sales_inventory_images',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class IngredientRepository extends BaseRepository<ingredients> {
  constructor() {
    super({
      modelName: 'ingredients',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class GodownRepository extends BaseRepository<godown> {
  constructor() {
    super({
      modelName: 'godown',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'Last_Modified',
      },
    });
  }
}

export class UOMConversionRepository extends BaseRepository<uom_conversion> {
  constructor() {
    super({
      modelName: 'uom_conversion',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class PriceListRepository extends BaseRepository<price_lists> {
  constructor() {
    super({
      modelName: 'price_lists',
      primaryKeyField: 'Price_List_ID',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'Last_Modified',
      },
    });
  }
}

export class PriceListEntryRepository extends BaseRepository<pricelist_entries> {
  constructor() {
    super({
      modelName: 'pricelist_entries',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class RouteMasterRepository extends BaseRepository<route_master> {
  constructor() {
    super({
      modelName: 'route_master',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class RouteCustomerMappingRepository extends BaseRepository<route_customer_mapping> {
  constructor() {
    super({
      modelName: 'route_customer_mapping',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class RouteMappingRepository extends BaseRepository<route_mapping> {
  constructor() {
    super({
      modelName: 'route_mapping',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'Last_Modified',
      },
    });
  }
}

export class LedgerItemMappingRepository extends BaseRepository<ledger_item_mapping> {
  constructor() {
    super({
      modelName: 'ledger_item_mapping',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}
