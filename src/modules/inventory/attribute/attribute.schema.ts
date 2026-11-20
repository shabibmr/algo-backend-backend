import { z } from 'zod';
import { ProductAttributeType } from '../enums';

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
        value: z.string().min(1).max(255),
        valueId: z.number().int().optional().nullable(),
      }),
    ).min(1),
    rate: z.number().optional().nullable(),
    skuCode: z.string().max(100).optional().nullable(),
    barcode: z.string().max(100).optional().nullable(),
  }),
});
