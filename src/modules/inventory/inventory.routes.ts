import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { validate } from '../../core/middleware/validate';
import {
  uomSchema,
  brandSchema,
  categorySchema,
  taxCategorySchema,
  inventoryGroupSchema,
  inventoryItemSchema,
  skuMasterSchema,
  itemBatchSchema,
  itemPropertySchema,
  itemImageSchema,
  ingredientSchema,
  godownSchema,
  uomConversionSchema,
  priceListSchema,
  priceListEntrySchema,
  routeMasterSchema,
  routeCustomerMappingSchema,
  routeMappingSchema,
  ledgerItemMappingSchema,
} from './inventory.schema';

const router = Router();

// Require authentication for all inventory routes
router.use(authenticate);

// ── UOM Routes ──────────────────────────────────────────────
router.get('/uom', authorize('Inventory', 'read'), InventoryController.listUoms);
router.get('/uom/:id', authorize('Inventory', 'read'), InventoryController.getUom);
router.post(
  '/uom',
  authorize('Inventory', 'create'),
  validate(uomSchema),
  InventoryController.createUom,
);
router.put(
  '/uom/:id',
  authorize('Inventory', 'update'),
  validate(uomSchema),
  InventoryController.updateUom,
);
router.delete('/uom/:id', authorize('Inventory', 'delete'), InventoryController.deleteUom);

// ── Brand Routes ────────────────────────────────────────────
router.get('/brand', authorize('Inventory', 'read'), InventoryController.listBrands);
router.get('/brand/:id', authorize('Inventory', 'read'), InventoryController.getBrand);
router.post(
  '/brand',
  authorize('Inventory', 'create'),
  validate(brandSchema),
  InventoryController.createBrand,
);
router.put(
  '/brand/:id',
  authorize('Inventory', 'update'),
  validate(brandSchema),
  InventoryController.updateBrand,
);
router.delete('/brand/:id', authorize('Inventory', 'delete'), InventoryController.deleteBrand);

// ── Category Routes ─────────────────────────────────────────
router.get('/category', authorize('Inventory', 'read'), InventoryController.listCategories);
router.get('/category/:id', authorize('Inventory', 'read'), InventoryController.getCategory);
router.post(
  '/category',
  authorize('Inventory', 'create'),
  validate(categorySchema),
  InventoryController.createCategory,
);
router.put(
  '/category/:id',
  authorize('Inventory', 'update'),
  validate(categorySchema),
  InventoryController.updateCategory,
);
router.delete(
  '/category/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteCategory,
);

// ── Tax Category Routes ─────────────────────────────────────
router.get('/tax-category', authorize('Inventory', 'read'), InventoryController.listTaxCategories);
router.get('/tax-category/:id', authorize('Inventory', 'read'), InventoryController.getTaxCategory);
router.post(
  '/tax-category',
  authorize('Inventory', 'create'),
  validate(taxCategorySchema),
  InventoryController.createTaxCategory,
);
router.put(
  '/tax-category/:id',
  authorize('Inventory', 'update'),
  validate(taxCategorySchema),
  InventoryController.updateTaxCategory,
);
router.delete(
  '/tax-category/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteTaxCategory,
);

// ── Inventory Group Routes ──────────────────────────────────
router.get('/group', authorize('Inventory', 'read'), InventoryController.listInventoryGroups);
router.get('/group/:id', authorize('Inventory', 'read'), InventoryController.getInventoryGroup);
router.post(
  '/group',
  authorize('Inventory', 'create'),
  validate(inventoryGroupSchema),
  InventoryController.createInventoryGroup,
);
router.put(
  '/group/:id',
  authorize('Inventory', 'update'),
  validate(inventoryGroupSchema),
  InventoryController.updateInventoryGroup,
);
router.delete(
  '/group/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteInventoryGroup,
);

// ── Inventory Item Routes ───────────────────────────────────
router.get('/item', authorize('Inventory', 'read'), InventoryController.listInventoryItems);
router.get('/item/:id', authorize('Inventory', 'read'), InventoryController.getInventoryItem);
router.post(
  '/item',
  authorize('Inventory', 'create'),
  validate(inventoryItemSchema),
  InventoryController.createInventoryItem,
);
router.put(
  '/item/:id',
  authorize('Inventory', 'update'),
  validate(inventoryItemSchema),
  InventoryController.updateInventoryItem,
);
router.delete(
  '/item/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteInventoryItem,
);

// ── SKU Routes ──────────────────────────────────────────────
router.get('/sku', authorize('Inventory', 'read'), InventoryController.listSkus);
router.get('/sku/:id', authorize('Inventory', 'read'), InventoryController.getSku);
router.post(
  '/sku',
  authorize('Inventory', 'create'),
  validate(skuMasterSchema),
  InventoryController.createSku,
);
router.put(
  '/sku/:id',
  authorize('Inventory', 'update'),
  validate(skuMasterSchema),
  InventoryController.updateSku,
);
router.delete('/sku/:id', authorize('Inventory', 'delete'), InventoryController.deleteSku);

// ── Item Batch Routes ───────────────────────────────────────
router.get('/batch', authorize('Inventory', 'read'), InventoryController.listBatches);
router.get('/batch/:id', authorize('Inventory', 'read'), InventoryController.getBatch);
router.post(
  '/batch',
  authorize('Inventory', 'create'),
  validate(itemBatchSchema),
  InventoryController.createBatch,
);
router.put(
  '/batch/:id',
  authorize('Inventory', 'update'),
  validate(itemBatchSchema),
  InventoryController.updateBatch,
);
router.delete('/batch/:id', authorize('Inventory', 'delete'), InventoryController.deleteBatch);

// ── Item Property Routes ────────────────────────────────────
router.get('/property', authorize('Inventory', 'read'), InventoryController.listProperties);
router.get('/property/:id', authorize('Inventory', 'read'), InventoryController.getProperty);
router.post(
  '/property',
  authorize('Inventory', 'create'),
  validate(itemPropertySchema),
  InventoryController.createProperty,
);
router.delete(
  '/property/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteProperty,
);

// ── Item Image Routes ───────────────────────────────────────
router.get('/image', authorize('Inventory', 'read'), InventoryController.listImages);
router.get('/image/:id', authorize('Inventory', 'read'), InventoryController.getImage);
router.post(
  '/image',
  authorize('Inventory', 'create'),
  validate(itemImageSchema),
  InventoryController.createImage,
);
router.delete('/image/:id', authorize('Inventory', 'delete'), InventoryController.deleteImage);

// ── Ingredient Routes ───────────────────────────────────────
router.get('/ingredient', authorize('Inventory', 'read'), InventoryController.listIngredients);
router.get(
  '/ingredient/recipe/:salesItemId',
  authorize('Inventory', 'read'),
  InventoryController.getRecipeForItem,
);
router.get(
  '/ingredient/usage/:purchaseItemId',
  authorize('Inventory', 'read'),
  InventoryController.getUsageOfIngredient,
);
router.get('/ingredient/:id', authorize('Inventory', 'read'), InventoryController.getIngredient);
router.post(
  '/ingredient',
  authorize('Inventory', 'create'),
  validate(ingredientSchema),
  InventoryController.createIngredient,
);
router.put(
  '/ingredient/:id',
  authorize('Inventory', 'update'),
  validate(ingredientSchema),
  InventoryController.updateIngredient,
);
router.delete(
  '/ingredient/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteIngredient,
);

// ── Godown Routes ───────────────────────────────────────────
router.get('/godown', authorize('Inventory', 'read'), InventoryController.listGodowns);
router.get('/godown/:id', authorize('Inventory', 'read'), InventoryController.getGodown);
router.post(
  '/godown',
  authorize('Inventory', 'create'),
  validate(godownSchema),
  InventoryController.createGodown,
);
router.put(
  '/godown/:id',
  authorize('Inventory', 'update'),
  validate(godownSchema),
  InventoryController.updateGodown,
);
router.delete('/godown/:id', authorize('Inventory', 'delete'), InventoryController.deleteGodown);

// ── UOM Conversion Routes ───────────────────────────────────
router.get('/conversion', authorize('Inventory', 'read'), InventoryController.listConversions);
router.get(
  '/conversion/lookup',
  authorize('Inventory', 'read'),
  InventoryController.lookupConversion,
);
router.get('/conversion/:id', authorize('Inventory', 'read'), InventoryController.getConversion);
router.post(
  '/conversion',
  authorize('Inventory', 'create'),
  validate(uomConversionSchema),
  InventoryController.createConversion,
);
router.put(
  '/conversion/:id',
  authorize('Inventory', 'update'),
  validate(uomConversionSchema),
  InventoryController.updateConversion,
);
router.delete(
  '/conversion/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteConversion,
);

// ── PriceList & Entries Routes ──────────────────────────────
router.get('/pricelist', authorize('Inventory', 'read'), InventoryController.listPriceLists);
router.get(
  '/pricelist/effective-price',
  authorize('Inventory', 'read'),
  InventoryController.getEffectivePrice,
);
router.get('/pricelist/:id', authorize('Inventory', 'read'), InventoryController.getPriceList);
router.post(
  '/pricelist',
  authorize('Inventory', 'create'),
  validate(priceListSchema),
  InventoryController.createPriceList,
);
router.put(
  '/pricelist/:id',
  authorize('Inventory', 'update'),
  validate(priceListSchema),
  InventoryController.updatePriceList,
);
router.delete(
  '/pricelist/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deletePriceList,
);

// PriceList Entries
router.get('/pricelist-entry/:id', authorize('Inventory', 'read'), InventoryController.getEntry);
router.post(
  '/pricelist-entry',
  authorize('Inventory', 'create'),
  validate(priceListEntrySchema),
  InventoryController.createEntry,
);
router.put(
  '/pricelist-entry/:id',
  authorize('Inventory', 'update'),
  validate(priceListEntrySchema),
  InventoryController.updateEntry,
);
router.delete(
  '/pricelist-entry/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteEntry,
);

// ── Route Routes ────────────────────────────────────────────
router.get('/route', authorize('Inventory', 'read'), InventoryController.listRoutes);
router.get(
  '/route/customer-mapping',
  authorize('Inventory', 'read'),
  InventoryController.listCustomerMappings,
);
router.post(
  '/route/customer-mapping',
  authorize('Inventory', 'create'),
  validate(routeCustomerMappingSchema),
  InventoryController.createCustomerMapping,
);
router.delete(
  '/route/customer-mapping/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteCustomerMapping,
);

router.get('/route/mapping', authorize('Inventory', 'read'), InventoryController.listRouteMappings);
router.post(
  '/route/mapping',
  authorize('Inventory', 'create'),
  validate(routeMappingSchema),
  InventoryController.createRouteMapping,
);
router.delete(
  '/route/mapping/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteRouteMapping,
);

router.get(
  '/route/salesman/:employeeId',
  authorize('Inventory', 'read'),
  InventoryController.getScheduleForSalesman,
);
router.get(
  '/route/customers/:routeId',
  authorize('Inventory', 'read'),
  InventoryController.getCustomersForRoute,
);

router.get('/route/:id', authorize('Inventory', 'read'), InventoryController.getRoute);
router.post(
  '/route',
  authorize('Inventory', 'create'),
  validate(routeMasterSchema),
  InventoryController.createRoute,
);
router.put(
  '/route/:id',
  authorize('Inventory', 'update'),
  validate(routeMasterSchema),
  InventoryController.updateRoute,
);
router.delete('/route/:id', authorize('Inventory', 'delete'), InventoryController.deleteRoute);

// ── Ledger Item Mapping Routes ──────────────────────────────
router.get(
  '/ledger-item-mapping',
  authorize('Inventory', 'read'),
  InventoryController.listLedgerItemMappings,
);
router.get(
  '/ledger-item-mapping/check',
  authorize('Inventory', 'read'),
  InventoryController.checkLedgerItemMapping,
);
router.post(
  '/ledger-item-mapping',
  authorize('Inventory', 'create'),
  validate(ledgerItemMappingSchema),
  InventoryController.createLedgerItemMapping,
);
router.delete(
  '/ledger-item-mapping/:id',
  authorize('Inventory', 'delete'),
  InventoryController.deleteLedgerItemMapping,
);
router.get(
  '/ledger-item-mapping/ledger/:ledgerId',
  authorize('Inventory', 'read'),
  InventoryController.getAllowedItemsForLedger,
);
router.get(
  '/ledger-item-mapping/item/:itemId',
  authorize('Inventory', 'read'),
  InventoryController.getAllowedLedgersForItem,
);

// ── Stock Ledger & Balance (tasks 48-49) ─────────────────────
router.get(
  '/stock-ledger/:itemId',
  authorize('Inventory', 'read'),
  InventoryController.getStockMovements,
);
router.get(
  '/stock-ledger/godown/:godownId',
  authorize('Inventory', 'read'),
  InventoryController.getStockByGodown,
);
router.get('/stock-balance', authorize('Inventory', 'read'), InventoryController.getStockBalance);
router.get(
  '/stock-balance/:itemId/by-godown',
  authorize('Inventory', 'read'),
  InventoryController.getStockBalance,
);

export const inventoryRoutes = router;
export default router;
