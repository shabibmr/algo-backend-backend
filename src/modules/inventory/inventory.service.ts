import { prisma } from '../../core/db/prisma';
import {
  UomRepository,
  BrandRepository,
  CategoryRepository,
  TaxCategoryRepository,
  InventoryGroupRepository,
  InventoryItemRepository,
  SKUMasterRepository,
  ItemBatchRepository,
  ItemPropertyRepository,
  ItemImageRepository,
  IngredientRepository,
  GodownRepository,
  UOMConversionRepository,
  PriceListRepository,
  PriceListEntryRepository,
  RouteMasterRepository,
  RouteCustomerMappingRepository,
  RouteMappingRepository,
  LedgerItemMappingRepository,
} from './inventory.repository';
import { NotFoundError, ValidationError, ConflictError } from '../../core/errors/AppError';
import { toDecimal } from '../../core/utils/decimal';

const uomRepo = new UomRepository();
const brandRepo = new BrandRepository();
const categoryRepo = new CategoryRepository();
const taxCategoryRepo = new TaxCategoryRepository();
const groupRepo = new InventoryGroupRepository();
const itemRepo = new InventoryItemRepository();
const skuRepo = new SKUMasterRepository();
const batchRepo = new ItemBatchRepository();
const propertyRepo = new ItemPropertyRepository();
const imageRepo = new ItemImageRepository();
const ingredientRepo = new IngredientRepository();
const godownRepo = new GodownRepository();
const conversionRepo = new UOMConversionRepository();
const priceListRepo = new PriceListRepository();
const priceListEntryRepo = new PriceListEntryRepository();
const routeMasterRepo = new RouteMasterRepository();
const routeCustomerRepo = new RouteCustomerMappingRepository();
const routeMappingRepo = new RouteMappingRepository();
const ledgerItemMappingRepo = new LedgerItemMappingRepository();

// ── UOM Service ──────────────────────────────────────────────
export const UomService = {
  async listUoms(options: any) {
    return uomRepo.findMany(options);
  },
  async getUom(id: number) {
    const uom = await uomRepo.findById(id);
    if (!uom) throw new NotFoundError('UOM not found');
    return uom;
  },
  async createUom(data: any, user?: string) {
    const existing = await uomRepo.findFirst({ where: { uom_Name: data.uom_Name } });
    if (existing) throw new ConflictError('UOM name already exists');
    return uomRepo.create(data, { user });
  },
  async updateUom(id: number, data: any, user?: string) {
    const uom = await uomRepo.findById(id);
    if (!uom) throw new NotFoundError('UOM not found');
    if (data.uom_Name && data.uom_Name !== uom.uom_Name) {
      const existing = await uomRepo.findFirst({ where: { uom_Name: data.uom_Name } });
      if (existing) throw new ConflictError('UOM name already exists');
    }
    return uomRepo.update(id, data, { user });
  },
  async deleteUom(id: number, user?: string) {
    const uom = await uomRepo.findById(id);
    if (!uom) throw new NotFoundError('UOM not found');
    return uomRepo.delete(id, { user, hardDelete: true });
  },
};

// ── Brand Service ────────────────────────────────────────────
export const BrandService = {
  async listBrands(options: any) {
    return brandRepo.findMany(options);
  },
  async getBrand(id: number) {
    const brand = await brandRepo.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');
    return brand;
  },
  async createBrand(data: any, user?: string) {
    const existing = await brandRepo.findFirst({ where: { Brand_Name: data.Brand_Name } });
    if (existing) throw new ConflictError('Brand name already exists');
    return brandRepo.create(data, { user });
  },
  async updateBrand(id: number, data: any, user?: string) {
    const brand = await brandRepo.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');
    if (data.Brand_Name && data.Brand_Name !== brand.Brand_Name) {
      const existing = await brandRepo.findFirst({ where: { Brand_Name: data.Brand_Name } });
      if (existing) throw new ConflictError('Brand name already exists');
    }
    return brandRepo.update(id, data, { user });
  },
  async deleteBrand(id: number, user?: string) {
    const brand = await brandRepo.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');
    return brandRepo.delete(id, { user, hardDelete: true });
  },
};

// ── Category Service ─────────────────────────────────────────
export const CategoryService = {
  async listCategories(options: any) {
    return categoryRepo.findMany(options);
  },
  async getCategory(id: number) {
    const cat = await categoryRepo.findById(id);
    if (!cat) throw new NotFoundError('Category not found');
    return cat;
  },
  async createCategory(data: any, user?: string) {
    if (data.category_name) {
      const existing = await categoryRepo.findFirst({
        where: { category_name: data.category_name },
      });
      if (existing) throw new ConflictError('Category name already exists');
    }
    return categoryRepo.create(data, { user });
  },
  async updateCategory(id: number, data: any, user?: string) {
    const cat = await categoryRepo.findById(id);
    if (!cat) throw new NotFoundError('Category not found');
    if (data.category_name && data.category_name !== cat.category_name) {
      const existing = await categoryRepo.findFirst({
        where: { category_name: data.category_name },
      });
      if (existing) throw new ConflictError('Category name already exists');
    }
    return categoryRepo.update(id, data, { user });
  },
  async deleteCategory(id: number, user?: string) {
    const cat = await categoryRepo.findById(id);
    if (!cat) throw new NotFoundError('Category not found');
    return categoryRepo.delete(id, { user, hardDelete: true });
  },
};

// ── Tax Category Service ─────────────────────────────────────
export const TaxCategoryService = {
  async listTaxCategories(options: any) {
    return taxCategoryRepo.findMany(options);
  },
  async getTaxCategory(id: number) {
    const tax = await taxCategoryRepo.findById(id);
    if (!tax) throw new NotFoundError('Tax category not found');
    return tax;
  },
  async createTaxCategory(data: any, user?: string) {
    const existing = await taxCategoryRepo.findFirst({ where: { tax_name: data.tax_name } });
    if (existing) throw new ConflictError('Tax name already exists');
    return taxCategoryRepo.create(data, { user });
  },
  async updateTaxCategory(id: number, data: any, user?: string) {
    const tax = await taxCategoryRepo.findById(id);
    if (!tax) throw new NotFoundError('Tax category not found');
    if (data.tax_name && data.tax_name !== tax.tax_name) {
      const existing = await taxCategoryRepo.findFirst({ where: { tax_name: data.tax_name } });
      if (existing) throw new ConflictError('Tax name already exists');
    }
    return taxCategoryRepo.update(id, data, { user });
  },
  async deleteTaxCategory(id: number, user?: string) {
    const tax = await taxCategoryRepo.findById(id);
    if (!tax) throw new NotFoundError('Tax category not found');
    return taxCategoryRepo.delete(id, { user });
  },
};

// ── Inventory Group Service ──────────────────────────────────
export const InventoryGroupService = {
  async listInventoryGroups() {
    const result = await groupRepo.findMany({ limit: 1000 });
    const items = [];
    for (const group of result.items) {
      const { fullPath, depth } = await this.computeGroupPathAndDepth(group.id);
      items.push({
        ...group,
        full_path: fullPath,
        depth,
      });
    }
    return { items, meta: result.meta };
  },

  async getInventoryGroup(id: number) {
    const group = await groupRepo.findById(id);
    if (!group) throw new NotFoundError('Inventory group not found');
    const { fullPath, depth } = await this.computeGroupPathAndDepth(id);
    return {
      ...group,
      full_path: fullPath,
      depth,
    };
  },

  async createInventoryGroup(data: any, user?: string) {
    if (data.group_code) {
      const existing = await groupRepo.findFirst({ where: { group_code: data.group_code } });
      if (existing) throw new ConflictError('Inventory group code already exists');
    }
    if (data.parent_group_id) {
      const parent = await groupRepo.findById(data.parent_group_id);
      if (!parent) throw new ValidationError('Parent group does not exist');
    }
    return groupRepo.create(data, { user });
  },

  async updateInventoryGroup(id: number, data: any, user?: string) {
    const group = await groupRepo.findById(id);
    if (!group) throw new NotFoundError('Inventory group not found');

    if (data.group_code && data.group_code !== group.group_code) {
      const existing = await groupRepo.findFirst({ where: { group_code: data.group_code } });
      if (existing) throw new ConflictError('Inventory group code already exists');
    }

    if (data.parent_group_id) {
      if (data.parent_group_id === id) {
        throw new ValidationError('A group cannot be its own parent');
      }
      await this.assertNoCycle(data.parent_group_id, id);
    }
    return groupRepo.update(id, data, { user });
  },

  async deleteInventoryGroup(id: number, user?: string) {
    const group = await groupRepo.findById(id);
    if (!group) throw new NotFoundError('Inventory group not found');
    return groupRepo.delete(id, { user, hardDelete: true });
  },

  async assertNoCycle(parentId: number, selfId: number): Promise<void> {
    let currentId: number | null = parentId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (currentId === selfId) {
        throw new ValidationError('Circular dependency detected in Inventory Groups');
      }
      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);

      const parent = await groupRepo.findById(currentId);
      currentId = parent ? parent.parent_group_id : null;
    }
  },

  async computeGroupPathAndDepth(groupId: number): Promise<{ fullPath: string; depth: number }> {
    const path: string[] = [];
    let currentId: number | null = groupId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);

      const group = await groupRepo.findById(currentId);
      if (!group) break;

      path.unshift(group.Group_Name || '');
      currentId = group.parent_group_id;
    }

    return {
      fullPath: path.join(' / '),
      depth: path.length - 1,
    };
  },
};

// ── Inventory Item Service ───────────────────────────────────
export const InventoryItemService = {
  async listInventoryItems(options: any) {
    return itemRepo.findMany(options);
  },

  async getInventoryItem(id: number) {
    const item = await itemRepo.findById(id, {
      include: {
        brands: true,
        category: true,
        sales_inventory_groups: true,
        tax_categories: true,
        uomlist: true,
      },
    });
    if (!item) throw new NotFoundError('Inventory item not found');

    const effectiveStock = await this.calculateEffectiveStock(id);
    return {
      ...item,
      effective_stock: effectiveStock,
    };
  },

  async createInventoryItem(data: any, user?: string) {
    // Unique Check
    const existing = await itemRepo.findFirst({ where: { Item_Code: data.Item_Code } });
    if (existing) throw new ConflictError('Item code already exists');

    // FK validations
    if (data.inventory_group_id) {
      const g = await groupRepo.findById(data.inventory_group_id);
      if (!g) throw new ValidationError('Inventory Group does not exist');
    }
    if (data.uom_id) {
      const u = await uomRepo.findById(data.uom_id);
      if (!u) throw new ValidationError('UOM does not exist');
    }
    if (data.inventory_brand_id) {
      const b = await brandRepo.findById(data.inventory_brand_id);
      if (!b) throw new ValidationError('Brand does not exist');
    }
    if (data.category_id) {
      const c = await categoryRepo.findById(data.category_id);
      if (!c) throw new ValidationError('Category does not exist');
    }
    if (data.default_tax_category_id) {
      const t = await taxCategoryRepo.findById(data.default_tax_category_id);
      if (!t) throw new ValidationError('Tax category does not exist');
    }

    // Soft GL ledger checks
    const ledgerFields = [
      'sales_gl_ledger_id',
      'default_purchase_ledger_id',
      'default_sales_return_ledger_id',
      'default_purchase_return_ledger_id',
    ];
    for (const field of ledgerFields) {
      if (data[field]) {
        const ledger = await prisma.ledger_master.findUnique({ where: { id: data[field] } });
        if (!ledger) throw new ValidationError(`Ledger ${field} does not exist`);
      }
    }

    return itemRepo.create(data, { user });
  },

  async updateInventoryItem(id: number, data: any, user?: string) {
    const item = await itemRepo.findById(id);
    if (!item) throw new NotFoundError('Inventory item not found');

    if (data.Item_Code && data.Item_Code !== item.Item_Code) {
      const existing = await itemRepo.findFirst({ where: { Item_Code: data.Item_Code } });
      if (existing) throw new ConflictError('Item code already exists');
    }

    // FK Validations
    if (data.inventory_group_id) {
      const g = await groupRepo.findById(data.inventory_group_id);
      if (!g) throw new ValidationError('Inventory Group does not exist');
    }
    if (data.uom_id) {
      const u = await uomRepo.findById(data.uom_id);
      if (!u) throw new ValidationError('UOM does not exist');
    }
    if (data.inventory_brand_id) {
      const b = await brandRepo.findById(data.inventory_brand_id);
      if (!b) throw new ValidationError('Brand does not exist');
    }
    if (data.category_id) {
      const c = await categoryRepo.findById(data.category_id);
      if (!c) throw new ValidationError('Category does not exist');
    }

    return itemRepo.update(id, data, { user });
  },

  async deleteInventoryItem(id: number, user?: string) {
    const item = await itemRepo.findById(id);
    if (!item) throw new NotFoundError('Inventory item not found');

    // Cascade delete related non-FK tables: properties & images
    return prisma.$transaction(async (tx) => {
      const itemCode = item.Item_Code;
      if (itemCode) {
        await tx.sales_inventory_item_properties.deleteMany({
          where: { Item_ID: itemCode },
        });
        await tx.sales_inventory_images.deleteMany({
          where: { Item_Id: itemCode },
        });
      }
      return itemRepo.delete(id, { user, tx });
    });
  },

  async calculateEffectiveStock(itemId: number): Promise<number> {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new NotFoundError('Inventory item not found');

    const openingStock = item.Opening_Stock || 0;

    const aggregations = await prisma.stock_ledger.aggregate({
      where: { item_id: itemId },
      _sum: {
        quantity_in: true,
        quantity_out: true,
      },
    });

    const qtyIn = aggregations._sum.quantity_in ? Number(aggregations._sum.quantity_in) : 0;
    const qtyOut = aggregations._sum.quantity_out ? Number(aggregations._sum.quantity_out) : 0;

    return openingStock + qtyIn - qtyOut;
  },
};

// ── SKUMaster Service ────────────────────────────────────────
export const SKUMasterService = {
  async listSkus(options: any) {
    return skuRepo.findMany(options);
  },
  async getSku(id: number) {
    const sku = await skuRepo.findById(id);
    if (!sku) throw new NotFoundError('SKU not found');
    return sku;
  },
  async createSku(data: any, user?: string) {
    if (data.inventory_item_id) {
      const item = await itemRepo.findById(data.inventory_item_id);
      if (!item) throw new ValidationError('Parent Item does not exist');
    }
    return skuRepo.create(data, { user });
  },
  async updateSku(id: number, data: any, user?: string) {
    const sku = await skuRepo.findById(id);
    if (!sku) throw new NotFoundError('SKU not found');
    return skuRepo.update(id, data, { user });
  },
  async deleteSku(id: number, user?: string) {
    const sku = await skuRepo.findById(id);
    if (!sku) throw new NotFoundError('SKU not found');
    return skuRepo.delete(id, { user, hardDelete: true });
  },
};

// ── ItemBatch Service ────────────────────────────────────────
export const ItemBatchService = {
  async listBatches(options: any) {
    const result = await batchRepo.findMany(options);
    const items = result.items.map((b) => ({
      ...b,
      is_expired: b.expiration_date ? new Date(b.expiration_date) < new Date() : false,
    }));
    return { items, meta: result.meta };
  },

  async getBatch(id: number) {
    const batch = await batchRepo.findById(id);
    if (!batch) throw new NotFoundError('Item Batch not found');
    return {
      ...batch,
      is_expired: batch.expiration_date ? new Date(batch.expiration_date) < new Date() : false,
    };
  },

  async createBatch(data: any, user?: string) {
    const existing = await batchRepo.findFirst({
      where: { item_id: data.item_id, batch_number: data.batch_number },
    });
    if (existing) throw new ConflictError('Batch number already exists for this item');

    const item = await itemRepo.findById(data.item_id);
    if (!item) throw new ValidationError('Inventory Item does not exist');

    return batchRepo.create(data, { user });
  },

  async updateBatch(id: number, data: any, user?: string) {
    const batch = await batchRepo.findById(id);
    if (!batch) throw new NotFoundError('Item Batch not found');

    if (
      data.batch_number &&
      data.item_id &&
      (data.batch_number !== batch.batch_number || data.item_id !== batch.item_id)
    ) {
      const existing = await batchRepo.findFirst({
        where: { item_id: data.item_id, batch_number: data.batch_number },
      });
      if (existing) throw new ConflictError('Batch number already exists for this item');
    }
    return batchRepo.update(id, data, { user });
  },

  async deleteBatch(id: number, user?: string) {
    const batch = await batchRepo.findById(id);
    if (!batch) throw new NotFoundError('Item Batch not found');
    return batchRepo.delete(id, { user });
  },
};

// ── ItemProperty Service ─────────────────────────────────────
export const ItemPropertyService = {
  async listProperties(options: any) {
    return propertyRepo.findMany(options);
  },
  async createProperty(data: any, user?: string) {
    return propertyRepo.create(data, { user });
  },
  async getProperty(id: number) {
    const prop = await propertyRepo.findById(id);
    if (!prop) throw new NotFoundError('Property not found');
    return prop;
  },
  async deleteProperty(id: number, user?: string) {
    const prop = await propertyRepo.findById(id);
    if (!prop) throw new NotFoundError('Property not found');
    return propertyRepo.delete(id, { user, hardDelete: true });
  },
};

// ── ItemImage Service ────────────────────────────────────────
export const ItemImageService = {
  async listImages(options: any) {
    return imageRepo.findMany(options);
  },
  async getImage(id: number) {
    const img = await imageRepo.findById(id);
    if (!img) throw new NotFoundError('Image not found');
    return img;
  },
  async createImage(payload: any, user?: string) {
    const { ImageBase64, ...data } = payload;
    let ImageBuffer: Buffer | null = null;
    if (ImageBase64) {
      ImageBuffer = Buffer.from(ImageBase64, 'base64');
    }
    return imageRepo.create(
      {
        ...data,
        Image: ImageBuffer,
      },
      { user },
    );
  },
  async deleteImage(id: number, user?: string) {
    const img = await imageRepo.findById(id);
    if (!img) throw new NotFoundError('Image not found');
    return imageRepo.delete(id, { user, hardDelete: true });
  },
};

// ── Ingredient Service ───────────────────────────────────────
export const IngredientService = {
  async listIngredients(options: any) {
    return ingredientRepo.findMany(options);
  },

  async getIngredient(id: number) {
    const ing = await ingredientRepo.findById(id);
    if (!ing) throw new NotFoundError('Ingredient mapping not found');
    return ing;
  },

  async createIngredient(data: any, user?: string) {
    // Validations
    if (data.sales_item_id) {
      const item = await itemRepo.findById(data.sales_item_id);
      if (!item) throw new ValidationError('Finished sales item does not exist');
    }
    if (data.purchase_item_id) {
      const item = await itemRepo.findById(data.purchase_item_id);
      if (!item) throw new ValidationError('Raw purchase item does not exist');
    }
    if (data.purchase_uom_id) {
      const uom = await uomRepo.findById(data.purchase_uom_id);
      if (!uom) throw new ValidationError('Purchase UOM does not exist');
    }
    if (data.prep_route_id) {
      const route = await routeMasterRepo.findById(data.prep_route_id);
      if (!route) throw new ValidationError('Preparation Route does not exist');
    }

    // Explicitly set the TakeAway field to match take_away_applicable boolean
    return ingredientRepo.create(
      {
        ...data,
        TakeAway: data.take_away_applicable ? 1 : 0,
      },
      { user },
    );
  },

  async updateIngredient(id: number, data: any, user?: string) {
    const ing = await ingredientRepo.findById(id);
    if (!ing) throw new NotFoundError('Ingredient mapping not found');
    return ingredientRepo.update(id, data, { user });
  },

  async deleteIngredient(id: number, user?: string) {
    const ing = await ingredientRepo.findById(id);
    if (!ing) throw new NotFoundError('Ingredient mapping not found');
    return ingredientRepo.delete(id, { user, hardDelete: true });
  },

  // Forward Lookup: Get recipe ingredients for finished item
  async getRecipeForItem(salesItemId: number) {
    return ingredientRepo.findMany({
      where: { sales_item_id: salesItemId },
      limit: 500,
    });
  },

  // Reverse Lookup: Get finished items using a raw ingredient
  async getUsageOfIngredient(purchaseItemId: number) {
    return ingredientRepo.findMany({
      where: { purchase_item_id: purchaseItemId },
      limit: 500,
    });
  },
};

// ── Godown Service ───────────────────────────────────────────
export const GodownService = {
  async listGodowns(options: any) {
    return godownRepo.findMany(options);
  },

  async getGodown(id: number) {
    const gd = await godownRepo.findById(id);
    if (!gd) throw new NotFoundError('Godown not found');
    return gd;
  },

  async createGodown(data: any, user?: string) {
    if (data.godown_code) {
      const existing = await godownRepo.findFirst({ where: { godown_code: data.godown_code } });
      if (existing) throw new ConflictError('Godown code already exists');
    }

    return prisma.$transaction(async (tx) => {
      if (data.is_default) {
        // Unset any existing default godowns
        await tx.godown.updateMany({
          data: { is_default: false },
        });
      }
      return godownRepo.create(data, { user, tx });
    });
  },

  async updateGodown(id: number, data: any, user?: string) {
    const gd = await godownRepo.findById(id);
    if (!gd) throw new NotFoundError('Godown not found');

    if (data.godown_code && data.godown_code !== gd.godown_code) {
      const existing = await godownRepo.findFirst({ where: { godown_code: data.godown_code } });
      if (existing) throw new ConflictError('Godown code already exists');
    }

    return prisma.$transaction(async (tx) => {
      if (data.is_default) {
        await tx.godown.updateMany({
          data: { is_default: false },
        });
      }
      return godownRepo.update(id, data, { user, tx });
    });
  },

  async deleteGodown(id: number, user?: string) {
    const gd = await godownRepo.findById(id);
    if (!gd) throw new NotFoundError('Godown not found');

    // Restrict delete if referenced by active stock entries
    const usage = await prisma.stock_ledger.count({
      where: { godown_id: id },
    });
    if (usage > 0) {
      throw new ConflictError(
        'Cannot delete godown as it has stock ledger transactions associated with it',
      );
    }

    return godownRepo.delete(id, { user, hardDelete: true });
  },
};

// ── UOM Conversion Service ───────────────────────────────────
export const UOMConversionService = {
  async listConversions(options: any) {
    return conversionRepo.findMany(options);
  },

  async getConversion(id: number) {
    const conv = await conversionRepo.findById(id);
    if (!conv) throw new NotFoundError('UOM conversion not found');
    return conv;
  },

  async createConversion(data: any, user?: string) {
    return conversionRepo.create(data, { user });
  },

  async updateConversion(id: number, data: any, user?: string) {
    const conv = await conversionRepo.findById(id);
    if (!conv) throw new NotFoundError('UOM conversion not found');
    return conversionRepo.update(id, data, { user });
  },

  async deleteConversion(id: number, user?: string) {
    const conv = await conversionRepo.findById(id);
    if (!conv) throw new NotFoundError('UOM conversion not found');
    return conversionRepo.delete(id, { user, hardDelete: true });
  },

  // Lookup conversion: Null itemID means global conversion
  async lookupConversion(baseUnit: string, toUnit: string, itemId?: string) {
    let conv = null;
    if (itemId) {
      conv = await conversionRepo.findFirst({
        where: { baseUnit, toUnit, itemID: itemId },
      });
    }
    if (!conv) {
      // Fallback to global
      conv = await conversionRepo.findFirst({
        where: { baseUnit, toUnit, itemID: null },
      });
    }

    if (!conv) {
      throw new NotFoundError(`UOM Conversion from ${baseUnit} to ${toUnit} not found.`);
    }

    return {
      ...conv,
      factor: toDecimal(conv.conValue),
    };
  },
};

// ── PriceList & PriceListEntry Service ────────────────────────
export const PriceListService = {
  async listPriceLists(options: any) {
    return priceListRepo.findMany(options);
  },

  async getPriceList(id: number) {
    const pl = await priceListRepo.findById(id);
    if (!pl) throw new NotFoundError('Price List not found');
    return pl;
  },

  async createPriceList(data: any, user?: string) {
    return prisma.$transaction(async (tx) => {
      if (data.Price_List_Default) {
        await tx.price_lists.updateMany({
          data: { Price_List_Default: false },
        });
      }
      return priceListRepo.create(data, { user, tx });
    });
  },

  async updatePriceList(id: number, data: any, user?: string) {
    const pl = await priceListRepo.findById(id);
    if (!pl) throw new NotFoundError('Price List not found');

    return prisma.$transaction(async (tx) => {
      if (data.Price_List_Default) {
        await tx.price_lists.updateMany({
          data: { Price_List_Default: false },
        });
      }
      return priceListRepo.update(id, data, { user, tx });
    });
  },

  async deletePriceList(id: number, user?: string) {
    const pl = await priceListRepo.findById(id);
    if (!pl) throw new NotFoundError('Price List not found');
    return priceListRepo.delete(id, { user, hardDelete: true });
  },

  // ── Price List Entries ──────────
  async getEntry(id: number) {
    const entry = await priceListEntryRepo.findById(id);
    if (!entry) throw new NotFoundError('Price list entry not found');
    return entry;
  },
  async createEntry(data: any, user?: string) {
    const pl = await priceListRepo.findById(data.Price_List_ID);
    if (!pl) throw new ValidationError('Price List does not exist');
    return priceListEntryRepo.create(data, { user });
  },
  async updateEntry(id: number, data: any, user?: string) {
    const entry = await priceListEntryRepo.findById(id);
    if (!entry) throw new NotFoundError('Price list entry not found');
    return priceListEntryRepo.update(id, data, { user });
  },
  async deleteEntry(id: number, user?: string) {
    const entry = await priceListEntryRepo.findById(id);
    if (!entry) throw new NotFoundError('Price list entry not found');
    return priceListEntryRepo.delete(id, { user, hardDelete: true });
  },

  // ── Effective Price Lookup ──────
  async getEffectivePrice(itemIdStr: string, priceListId?: number, checkDate: Date = new Date()) {
    let activePriceListId = priceListId;

    if (!activePriceListId) {
      // Find default price list
      const defaultPL = await priceListRepo.findFirst({
        where: { Price_List_Default: true },
      });
      if (defaultPL) {
        activePriceListId = defaultPL.Price_List_ID;
      }
    }

    let pl = null;
    if (activePriceListId) {
      pl = await priceListRepo.findById(activePriceListId);
    }

    // Verify validity date range if PL exists
    let isValidRange = true;
    if (pl) {
      if (pl.Price_List_Start_Date && checkDate < new Date(pl.Price_List_Start_Date)) {
        isValidRange = false;
      }
      if (pl.Price_List_End_Date && checkDate > new Date(pl.Price_List_End_Date)) {
        isValidRange = false;
      }
    }

    if (pl && isValidRange) {
      const entry = await priceListEntryRepo.findFirst({
        where: {
          Item_Id: itemIdStr,
          Price_List_ID: pl.Price_List_ID,
        },
      });
      if (entry) {
        return toDecimal(entry.Price);
      }
    }

    // Fallback to base price in item master
    const item = await itemRepo.findFirst({
      where: { Item_Code: itemIdStr },
    });
    if (!item) {
      throw new NotFoundError(`Inventory Item with code ${itemIdStr} not found.`);
    }

    return toDecimal(item.Price || 0);
  },
};

// ── Route & Route Mapping Service ────────────────────────────
export const RouteService = {
  // Master
  async listRoutes(options: any) {
    return routeMasterRepo.findMany(options);
  },
  async getRoute(id: number) {
    const route = await routeMasterRepo.findById(id);
    if (!route) throw new NotFoundError('Route not found');
    return route;
  },
  async createRoute(data: any, user?: string) {
    const existing = await routeMasterRepo.findFirst({ where: { route_id: data.route_id } });
    if (existing) throw new ConflictError('Route ID already exists');
    return routeMasterRepo.create(data, { user });
  },
  async updateRoute(id: number, data: any, user?: string) {
    const route = await routeMasterRepo.findById(id);
    if (!route) throw new NotFoundError('Route not found');
    if (data.route_id && data.route_id !== route.route_id) {
      const existing = await routeMasterRepo.findFirst({ where: { route_id: data.route_id } });
      if (existing) throw new ConflictError('Route ID already exists');
    }
    return routeMasterRepo.update(id, data, { user });
  },
  async deleteRoute(id: number, user?: string) {
    const route = await routeMasterRepo.findById(id);
    if (!route) throw new NotFoundError('Route not found');
    return routeMasterRepo.delete(id, { user, hardDelete: true });
  },

  // RouteCustomerMapping
  async listCustomerMappings(options: any) {
    return routeCustomerRepo.findMany(options);
  },
  async createCustomerMapping(data: any, user?: string) {
    if (data.route_master_id) {
      const route = await routeMasterRepo.findById(data.route_master_id);
      if (!route) throw new ValidationError('Route Master does not exist');
    }
    if (data.customer_ledger_id) {
      const ledger = await prisma.ledger_master.findUnique({
        where: { id: data.customer_ledger_id },
      });
      if (!ledger) throw new ValidationError('Customer Ledger does not exist');
    }
    return routeCustomerRepo.create(data, { user });
  },
  async deleteCustomerMapping(id: number, user?: string) {
    const mapping = await routeCustomerRepo.findById(id);
    if (!mapping) throw new NotFoundError('Mapping not found');
    return routeCustomerRepo.delete(id, { user, hardDelete: true });
  },

  // RouteMapping (Salesman assignments)
  async listRouteMappings(options: any) {
    return routeMappingRepo.findMany(options);
  },
  async createRouteMapping(data: any, user?: string) {
    if (data.route_master_id) {
      const route = await routeMasterRepo.findById(data.route_master_id);
      if (!route) throw new ValidationError('Route Master does not exist');
    }
    if (data.salesperson_employee_id) {
      const emp = await prisma.employee_details.findUnique({
        where: { id: data.salesperson_employee_id },
      });
      if (!emp) throw new ValidationError('Salesperson Employee does not exist');
    }
    return routeMappingRepo.create(data, { user });
  },
  async deleteRouteMapping(id: number, user?: string) {
    const mapping = await routeMappingRepo.findById(id);
    if (!mapping) throw new NotFoundError('Route mapping not found');
    return routeMappingRepo.delete(id, { user, hardDelete: true });
  },

  // Query helper: salesperson schedule
  async getScheduleForSalesman(employeeId: number) {
    return routeMappingRepo.findMany({
      where: { salesperson_employee_id: employeeId },
      include: {
        route_master: true,
      },
      limit: 100,
    });
  },

  // Query helper: customers in route
  async getCustomersForRoute(routeMasterId: number) {
    return routeCustomerRepo.findMany({
      where: { route_master_id: routeMasterId },
      include: {
        ledger_master: true,
      },
      limit: 100,
    });
  },
};

// ── LedgerItemMapping Service ────────────────────────────────
export const LedgerItemMappingService = {
  async listMappings(options: any) {
    return ledgerItemMappingRepo.findMany(options);
  },

  async createMapping(data: any, user?: string) {
    const existing = await ledgerItemMappingRepo.findFirst({
      where: { Ledger_Id: data.Ledger_Id, Item_Id: data.Item_Id },
    });
    if (existing) throw new ConflictError('Mapping already exists for this party and item');

    // Validations (Soft FKs)
    const ledger = await prisma.ledger_master.findFirst({
      where: { ledger_code: data.Ledger_Id },
    });
    if (!ledger) {
      // fallback to Ledger Name check or ID check
      const ledgerById = await prisma.ledger_master.findFirst({
        where: { id: Number(data.Ledger_Id) || -1 },
      });
      if (!ledgerById) throw new ValidationError(`Ledger with ID/Code ${data.Ledger_Id} not found`);
    }

    const item = await itemRepo.findFirst({
      where: { Item_Code: data.Item_Id },
    });
    if (!item) {
      const itemById = await itemRepo.findById(Number(data.Item_Id) || -1);
      if (!itemById)
        throw new ValidationError(`Inventory Item with ID/Code ${data.Item_Id} not found`);
    }

    return ledgerItemMappingRepo.create(data, { user });
  },

  async deleteMapping(id: number, user?: string) {
    const mapping = await ledgerItemMappingRepo.findById(id);
    if (!mapping) throw new NotFoundError('Ledger item mapping not found');
    return ledgerItemMappingRepo.delete(id, { user, hardDelete: true });
  },

  // Check if item is allowed for ledger
  async isAllowed(ledgerIdStr: string, itemIdStr: string): Promise<boolean> {
    const count = await ledgerItemMappingRepo.count({
      where: { Ledger_Id: ledgerIdStr },
    });
    // If no mappings exist for this ledger, assume no restrictions (allowed by default)
    if (count === 0) return true;

    // Otherwise, check if specific mapping exists
    const mapping = await ledgerItemMappingRepo.findFirst({
      where: { Ledger_Id: ledgerIdStr, Item_Id: itemIdStr },
    });
    return !!mapping;
  },

  // Bidirectional lookups
  async getAllowedItemsForLedger(ledgerIdStr: string) {
    return ledgerItemMappingRepo.findMany({
      where: { Ledger_Id: ledgerIdStr },
      limit: 1000,
    });
  },

  async getAllowedLedgersForItem(itemIdStr: string) {
    return ledgerItemMappingRepo.findMany({
      where: { Item_Id: itemIdStr },
      limit: 1000,
    });
  },
};

// ── Task 48 & 49: Stock Ledger & Balance service ─────────────────────────────
export const StockLedgerService = {
  async getMovements(
    itemId: number,
    opts: { godown_id?: number; start_date?: Date; end_date?: Date; voucher_type?: string } = {},
  ) {
    const where: any = { item_id: itemId };
    if (opts.godown_id) where.godown_id = opts.godown_id;
    if (opts.start_date || opts.end_date) {
      where.posting_date = {};
      if (opts.start_date) where.posting_date.gte = opts.start_date;
      if (opts.end_date) where.posting_date.lte = opts.end_date;
    }
    if (opts.voucher_type) {
      where.voucher_headers = { voucher_type: opts.voucher_type };
    }
    return prisma.stock_ledger.findMany({
      where,
      include: { voucher_headers: true, godown: true, sales_inventory_items: true },
      orderBy: { posting_date: 'asc' },
    });
  },

  async getByGodown(godownId: number, opts: { start_date?: Date; end_date?: Date } = {}) {
    const where: any = { godown_id: godownId };
    if (opts.start_date || opts.end_date) {
      where.posting_date = {};
      if (opts.start_date) where.posting_date.gte = opts.start_date;
      if (opts.end_date) where.posting_date.lte = opts.end_date;
    }
    return prisma.stock_ledger.findMany({
      where,
      include: { sales_inventory_items: true, voucher_headers: true },
      orderBy: { posting_date: 'asc' },
    });
  },

  async getBalance(itemId: number, godownId?: number): Promise<number> {
    const where: any = { item_id: itemId };
    if (godownId) where.godown_id = godownId;
    const agg = await prisma.stock_ledger.aggregate({
      where,
      _sum: { quantity_in: true, quantity_out: true },
    });
    const inQty = Number(agg._sum.quantity_in ?? 0);
    const outQty = Number(agg._sum.quantity_out ?? 0);
    return inQty - outQty;
  },

  async getBalanceByGodown(itemId: number) {
    const rows = await prisma.stock_ledger.groupBy({
      by: ['godown_id'],
      where: { item_id: itemId },
      _sum: { quantity_in: true, quantity_out: true },
    });
    return rows.map((r) => ({
      godown_id: r.godown_id,
      balance: Number(r._sum.quantity_in ?? 0) - Number(r._sum.quantity_out ?? 0),
    }));
  },

  // Guard used by SalesInvoice / DeliveryNote posting
  async assertStockAvailable(itemId: number, godownId: number, requestedQty: number) {
    const item = await prisma.sales_inventory_items.findUnique({ where: { id: itemId } });
    if (!item || !item.is_stock_item) return; // non-stock items skip guard
    const balance = await this.getBalance(itemId, godownId);
    if (balance < requestedQty) {
      throw new ValidationError(
        `Insufficient stock: item ${itemId} in godown ${godownId} — available ${balance}, requested ${requestedQty}`,
      );
    }
  },
};
