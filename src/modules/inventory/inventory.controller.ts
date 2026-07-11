import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../core/types';
import { getQueryOptions } from '../../core/utils/listQuery';
import {
  UomService,
  BrandService,
  CategoryService,
  TaxCategoryService,
  InventoryGroupService,
  InventoryItemService,
  SKUMasterService,
  ItemBatchService,
  ItemPropertyService,
  ItemImageService,
  IngredientService,
  GodownService,
  UOMConversionService,
  PriceListService,
  RouteService,
  LedgerItemMappingService,
  StockLedgerService,
} from './inventory.service';


export const InventoryController = {
  // ── UOM Controllers ─────────────────────────────────────────
  async listUoms(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UomService.listUoms(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getUom(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const uom = await UomService.getUom(Number(id));
      const response: ApiResponse<typeof uom> = {
        success: true,
        data: uom,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createUom(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await UomService.createUom(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'UOM created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateUom(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await UomService.updateUom(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'UOM updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteUom(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await UomService.deleteUom(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'UOM deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Brand Controllers ────────────────────────────────────────
  async listBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BrandService.listBrands(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const brand = await BrandService.getBrand(Number(id));
      const response: ApiResponse<typeof brand> = {
        success: true,
        data: brand,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await BrandService.createBrand(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Brand created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await BrandService.updateBrand(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Brand updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await BrandService.deleteBrand(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Brand deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Category Controllers ─────────────────────────────────────
  async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoryService.listCategories(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cat = await CategoryService.getCategory(Number(id));
      const response: ApiResponse<typeof cat> = {
        success: true,
        data: cat,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await CategoryService.createCategory(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Category created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await CategoryService.updateCategory(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Category updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await CategoryService.deleteCategory(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Category deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Tax Category Controllers ──────────────────────────────────
  async listTaxCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TaxCategoryService.listTaxCategories(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getTaxCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tax = await TaxCategoryService.getTaxCategory(Number(id));
      const response: ApiResponse<typeof tax> = {
        success: true,
        data: tax,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createTaxCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await TaxCategoryService.createTaxCategory(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Tax category created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateTaxCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await TaxCategoryService.updateTaxCategory(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Tax category updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteTaxCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await TaxCategoryService.deleteTaxCategory(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Tax category deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Inventory Group Controllers ───────────────────────────────
  async listInventoryGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await InventoryGroupService.listInventoryGroups();
      const response: ApiResponse<typeof groups> = {
        success: true,
        data: groups,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getInventoryGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const group = await InventoryGroupService.getInventoryGroup(Number(id));
      const response: ApiResponse<typeof group> = {
        success: true,
        data: group,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createInventoryGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await InventoryGroupService.createInventoryGroup(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Inventory group created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateInventoryGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await InventoryGroupService.updateInventoryGroup(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Inventory group updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteInventoryGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await InventoryGroupService.deleteInventoryGroup(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Inventory group deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Inventory Item Controllers ────────────────────────────────
  async listInventoryItems(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InventoryItemService.listInventoryItems({
        ...getQueryOptions(req),
        include: {
          uomlist: true,
          sales_inventory_groups: true,
        },
      });
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async lookupItems(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const result = await InventoryItemService.lookupItems(search);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await InventoryItemService.getInventoryItem(Number(id));
      const response: ApiResponse<typeof item> = {
        success: true,
        data: item,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await InventoryItemService.createInventoryItem(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Inventory item created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await InventoryItemService.updateInventoryItem(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Inventory item updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await InventoryItemService.deleteInventoryItem(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Inventory item deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── SKUMaster Controllers ──────────────────────────────────
  async listSkus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SKUMasterService.listSkus(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getSku(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sku = await SKUMasterService.getSku(Number(id));
      const response: ApiResponse<typeof sku> = {
        success: true,
        data: sku,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createSku(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await SKUMasterService.createSku(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'SKU created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateSku(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await SKUMasterService.updateSku(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'SKU updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteSku(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await SKUMasterService.deleteSku(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'SKU deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── ItemBatch Controllers ──────────────────────────────────
  async listBatches(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ItemBatchService.listBatches(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const batch = await ItemBatchService.getBatch(Number(id));
      const response: ApiResponse<typeof batch> = {
        success: true,
        data: batch,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await ItemBatchService.createBatch(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Item batch created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await ItemBatchService.updateBatch(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Item batch updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await ItemBatchService.deleteBatch(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Item batch deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── ItemProperty Controllers ────────────────────────────────
  async listProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ItemPropertyService.listProperties(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const prop = await ItemPropertyService.getProperty(Number(id));
      const response: ApiResponse<typeof prop> = {
        success: true,
        data: prop,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await ItemPropertyService.createProperty(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Item property created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await ItemPropertyService.deleteProperty(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Item property deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── ItemImage Controllers ───────────────────────────────────
  async listImages(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ItemImageService.listImages(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const image = await ItemImageService.getImage(Number(id));
      const response: ApiResponse<any> = {
        success: true,
        data: {
          ...image,
          ImageBase64: image.Image ? image.Image.toString('base64') : null,
        },
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createImage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await ItemImageService.createImage(req.body, user);
      const response: ApiResponse<any> = {
        success: true,
        message: 'Item image uploaded successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await ItemImageService.deleteImage(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Item image deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Ingredient (Recipe / BOM) Controllers ─────────────────────
  async listIngredients(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await IngredientService.listIngredients(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ing = await IngredientService.getIngredient(Number(id));
      const response: ApiResponse<typeof ing> = {
        success: true,
        data: ing,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await IngredientService.createIngredient(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Ingredient mapping created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await IngredientService.updateIngredient(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Ingredient mapping updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await IngredientService.deleteIngredient(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Ingredient mapping deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getRecipeForItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { salesItemId } = req.params;
      const recipe = await IngredientService.getRecipeForItem(Number(salesItemId));
      const response: ApiResponse<typeof recipe> = {
        success: true,
        data: recipe,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getUsageOfIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const { purchaseItemId } = req.params;
      const usage = await IngredientService.getUsageOfIngredient(Number(purchaseItemId));
      const response: ApiResponse<typeof usage> = {
        success: true,
        data: usage,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Godown Controllers ───────────────────────────────────────
  async listGodowns(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await GodownService.listGodowns(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getGodown(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const gd = await GodownService.getGodown(Number(id));
      const response: ApiResponse<typeof gd> = {
        success: true,
        data: gd,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createGodown(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await GodownService.createGodown(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Godown created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateGodown(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await GodownService.updateGodown(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Godown updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteGodown(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await GodownService.deleteGodown(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Godown deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── UOM Conversion Controllers ──────────────────────────────
  async listConversions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UOMConversionService.listConversions(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getConversion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const conv = await UOMConversionService.getConversion(Number(id));
      const response: ApiResponse<typeof conv> = {
        success: true,
        data: conv,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createConversion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await UOMConversionService.createConversion(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'UOM conversion created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateConversion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await UOMConversionService.updateConversion(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'UOM conversion updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteConversion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await UOMConversionService.deleteConversion(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'UOM conversion deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async lookupConversion(req: Request, res: Response, next: NextFunction) {
    try {
      const { baseUnit, toUnit, itemId } = req.query;
      if (!baseUnit || !toUnit) {
        throw new Error('baseUnit and toUnit query parameters are required');
      }
      const result = await UOMConversionService.lookupConversion(
        String(baseUnit),
        String(toUnit),
        itemId ? String(itemId) : undefined,
      );
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── PriceList Controllers ───────────────────────────────────
  async listPriceLists(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PriceListService.listPriceLists(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getPriceList(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pl = await PriceListService.getPriceList(Number(id));
      const response: ApiResponse<typeof pl> = {
        success: true,
        data: pl,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createPriceList(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await PriceListService.createPriceList(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Price list created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updatePriceList(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await PriceListService.updatePriceList(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Price list updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deletePriceList(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await PriceListService.deletePriceList(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Price list deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── PriceListEntry Controllers ──
  async getEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const entry = await PriceListService.getEntry(Number(id));
      const response: ApiResponse<typeof entry> = {
        success: true,
        data: entry,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },
  async createEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await PriceListService.createEntry(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Price list entry created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },
  async updateEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await PriceListService.updateEntry(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Price list entry updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },
  async deleteEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await PriceListService.deleteEntry(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Price list entry deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getEffectivePrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId, priceListId, date } = req.query;
      if (!itemId) {
        throw new Error('itemId query parameter is required');
      }
      const checkDate = date ? new Date(String(date)) : new Date();
      const price = await PriceListService.getEffectivePrice(
        String(itemId),
        priceListId ? Number(priceListId) : undefined,
        checkDate,
      );
      const response: ApiResponse<any> = {
        success: true,
        data: { price },
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Route Controllers ────────────────────────────────────────
  async listRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RouteService.listRoutes(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const route = await RouteService.getRoute(Number(id));
      const response: ApiResponse<typeof route> = {
        success: true,
        data: route,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await RouteService.createRoute(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Route created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await RouteService.updateRoute(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Route updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await RouteService.deleteRoute(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Route deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // RouteCustomerMapping Controllers
  async listCustomerMappings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RouteService.listCustomerMappings(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createCustomerMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await RouteService.createCustomerMapping(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Route customer mapping created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteCustomerMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await RouteService.deleteCustomerMapping(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Route customer mapping deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // RouteMapping (Salesman assignments) Controllers
  async listRouteMappings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RouteService.listRouteMappings(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createRouteMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await RouteService.createRouteMapping(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Route mapping created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteRouteMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await RouteService.deleteRouteMapping(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Route mapping deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getScheduleForSalesman(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const schedule = await RouteService.getScheduleForSalesman(Number(employeeId));
      const response: ApiResponse<typeof schedule> = {
        success: true,
        data: schedule,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getCustomersForRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { routeId } = req.params;
      const customers = await RouteService.getCustomersForRoute(Number(routeId));
      const response: ApiResponse<typeof customers> = {
        success: true,
        data: customers,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── LedgerItemMapping Controllers ─────────────────────────────
  async listLedgerItemMappings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LedgerItemMappingService.listMappings(getQueryOptions(req));
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createLedgerItemMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await LedgerItemMappingService.createMapping(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Ledger item mapping created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteLedgerItemMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await LedgerItemMappingService.deleteMapping(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Ledger item mapping deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async checkLedgerItemMapping(req: Request, res: Response, next: NextFunction) {
    try {
      const { ledgerId, itemId } = req.query;
      if (!ledgerId || !itemId) {
        throw new Error('ledgerId and itemId query parameters are required');
      }
      const allowed = await LedgerItemMappingService.isAllowed(String(ledgerId), String(itemId));
      const response: ApiResponse<boolean> = {
        success: true,
        data: allowed,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getAllowedItemsForLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { ledgerId } = req.params;
      const items = await LedgerItemMappingService.getAllowedItemsForLedger(String(ledgerId));
      const response: ApiResponse<typeof items> = {
        success: true,
        data: items,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getAllowedLedgersForItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const ledgers = await LedgerItemMappingService.getAllowedLedgersForItem(String(itemId));
      const response: ApiResponse<typeof ledgers> = {
        success: true,
        data: ledgers,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 48-49: Stock Ledger & Balance ───────────────────────
  async getStockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId = Number(req.params.itemId);
      const opts = {
        godown_id: req.query.godown_id ? Number(req.query.godown_id) : undefined,
        start_date: req.query.start_date ? new Date(String(req.query.start_date)) : undefined,
        end_date: req.query.end_date ? new Date(String(req.query.end_date)) : undefined,
        voucher_type: req.query.voucher_type ? String(req.query.voucher_type) : undefined,
      };
      const data = await StockLedgerService.getMovements(itemId, opts);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getStockByGodown(req: Request, res: Response, next: NextFunction) {
    try {
      const godownId = Number(req.params.godownId);
      const opts = {
        start_date: req.query.start_date ? new Date(String(req.query.start_date)) : undefined,
        end_date: req.query.end_date ? new Date(String(req.query.end_date)) : undefined,
      };
      const data = await StockLedgerService.getByGodown(godownId, opts);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getStockBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId = req.params.itemId ? Number(req.params.itemId) : undefined;
      const godownId = req.query.godown_id ? Number(req.query.godown_id) : undefined;

      if (itemId) {
        if (godownId) {
          const balance = await StockLedgerService.getBalance(itemId, godownId);
          return res
            .status(200)
            .json({
              success: true,
              data: { item_id: itemId, godown_id: godownId, balance },
              requestId: req.requestId,
            });
        }
        const byGodown = await StockLedgerService.getBalanceByGodown(itemId);
        const total = byGodown.reduce((s, r) => s + r.balance, 0);
        return res
          .status(200)
          .json({
            success: true,
            data: { item_id: itemId, total_balance: total, by_godown: byGodown },
            requestId: req.requestId,
          });
      }
      return res
        .status(400)
        .json({ success: false, message: 'item_id is required', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
};
