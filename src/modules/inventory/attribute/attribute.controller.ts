import { Request, Response, NextFunction } from 'express';
import { getQueryOptions } from '../../../core/utils/listQuery';
import {
  ProductAttributeService,
  ItemAttributeService,
  VariantSkuService,
} from './attribute.service';

export const AttributeController = {
  // ── Product Attribute Controllers ──────────────────────────
  async listProductAttributes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductAttributeService.listAttributes(getQueryOptions(req));
      return res.status(200).json({
        success: true,
        data: result,
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async listProductAttributeTree(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await ProductAttributeService.listAttributeTree();
      return res.status(200).json({
        success: true,
        data: tree,
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async getProductAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const attr = await ProductAttributeService.getAttribute(Number(id));
      return res.status(200).json({
        success: true,
        data: attr,
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async createProductAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await ProductAttributeService.createAttribute(req.body, user);
      return res.status(201).json({
        success: true,
        data: created,
        message: 'Product attribute created successfully',
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async updateProductAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await ProductAttributeService.updateAttribute(Number(id), req.body, user);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Product attribute updated successfully',
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async deleteProductAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await ProductAttributeService.deleteAttribute(Number(id), user);
      return res.status(200).json({
        success: true,
        message: 'Product attribute deleted successfully',
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  // ── Attribute Values Controllers ───────────────────────────
  async listProductAttributeValues(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const values = await ProductAttributeService.listValues(Number(id));
      return res.status(200).json({
        success: true,
        data: values,
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async createProductAttributeValue(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const created = await ProductAttributeService.createValue(Number(id), req.body, user);
      return res.status(201).json({
        success: true,
        data: created,
        message: 'Attribute option created successfully',
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async updateProductAttributeValue(req: Request, res: Response, next: NextFunction) {
    try {
      const { valueId } = req.params;
      const user = req.user?.username;
      const updated = await ProductAttributeService.updateValue(Number(valueId), req.body, user);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Attribute option updated successfully',
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async deleteProductAttributeValue(req: Request, res: Response, next: NextFunction) {
    try {
      const { valueId } = req.params;
      const user = req.user?.username;
      await ProductAttributeService.deleteValue(Number(valueId), user);
      return res.status(200).json({
        success: true,
        message: 'Attribute option deleted successfully',
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  // ── Item Attribute Assignment Controllers ──────────────────
  async getItemAttributes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const assignments = await ItemAttributeService.getItemAttributes(Number(id));
      return res.status(200).json({
        success: true,
        data: assignments,
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async assignItemAttributes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const result = await ItemAttributeService.assignAttributes(
        Number(id),
        req.body.attributes,
        user,
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Item attributes assigned successfully',
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async getItemAttributeSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const suggestions = await ItemAttributeService.getItemAttributeSuggestions(Number(id));
      return res.status(200).json({
        success: true,
        data: suggestions,
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  // ── SKU & Variant Resolution Controllers ───────────────────
  async getItemSkus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const skus = await VariantSkuService.getSkusForItem(Number(id), getQueryOptions(req));
      return res.status(200).json({
        success: true,
        data: skus,
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },

  async resolveVariantSku(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const result = await VariantSkuService.resolveVariantSku(req.body, user);
      return res.status(200).json({
        success: true,
        data: result,
        message: result.isNew ? 'Variant SKU created' : 'Existing variant SKU matched',
        requestId: req.requestId,
      });
    } catch (err) {
      return next(err);
    }
  },
};
