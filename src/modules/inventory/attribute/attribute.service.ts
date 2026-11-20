import crypto from 'crypto';
import { ListQueryOptions } from '../../../core/utils/listQuery';
import { prisma } from '../../../core/db/prisma';
import { InventoryItemRepository } from '../inventory.repository';
import { ProductAttributeRepository, ProductAttributeValueRepository } from './attribute.repository';
import { NotFoundError, ValidationError, ConflictError } from '../../../core/errors/AppError';

const itemRepo = new InventoryItemRepository();
const productAttributeRepo = new ProductAttributeRepository();
const productAttributeValueRepo = new ProductAttributeValueRepository();

const skuInclude = {
  sku_attribute_values: {
    include: {
      attribute: true,
      attribute_value_rel: true,
    },
  },
};

function findSkuByHash(itemId: number, attributeHash: string) {
  return (prisma as any).sku_master.findFirst({
    where: { inventory_item_id: itemId, attribute_hash: attributeHash },
    include: skuInclude,
  });
}

// Checks the submitted attributes against the item's assignments and returns the attribute map.
async function validateVariantAttributes(
  itemId: number,
  attrs: Array<{ attributeId: number; valueId?: number | null }>,
): Promise<Map<number, any>> {
  const assignments = await (prisma as any).item_attribute_assignments.findMany({
    where: { item_id: itemId },
    include: {
      attribute: {
        include: { sub_attributes: { where: { is_active: true }, select: { id: true } } },
      },
    },
  });
  if (assignments.length === 0) {
    throw new ValidationError('This item has no assigned attributes, so it cannot have variants');
  }

  const allowed = new Set<number>();
  for (const a of assignments) {
    allowed.add(a.attribute_id);
    for (const child of a.attribute.sub_attributes) allowed.add(child.id);
  }

  const submitted = new Set(attrs.map((a) => a.attributeId));
  const dbAttrs = await (prisma as any).product_attributes.findMany({
    where: { id: { in: [...submitted] }, is_active: true },
    include: { values: { where: { is_active: true } } },
  });
  const attrMap = new Map<number, any>(dbAttrs.map((a: any) => [a.id, a]));

  for (const input of attrs) {
    const dbAttr = attrMap.get(input.attributeId);
    if (!dbAttr) throw new ValidationError(`Attribute ${input.attributeId} not found or inactive`);
    if (!allowed.has(input.attributeId)) {
      throw new ValidationError(`Attribute ${dbAttr.attribute_name} is not assigned to this item`);
    }
    if (input.valueId && !dbAttr.values.some((v: any) => v.id === input.valueId)) {
      throw new ValidationError(`Value ${input.valueId} is not an active option of ${dbAttr.attribute_name}`);
    }
  }

  for (const a of assignments) {
    if (!a.is_required) continue;
    const needed: number[] =
      a.attribute.attribute_type === 'GROUP'
        ? a.attribute.sub_attributes.map((c: any) => c.id)
        : [a.attribute_id];
    for (const id of needed) {
      if (!submitted.has(id)) {
        throw new ValidationError(`Required attribute ${id} (${a.attribute.attribute_name}) is missing`);
      }
    }
  }
  return attrMap;
}

// ── Variant SKU Service ──────────────────────────────────────
export const VariantSkuService = {
  async getSkusForItem(itemId: number, options: ListQueryOptions) {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new NotFoundError('Item not found');
    const page = options.page ?? 1;
    const limit = options.limit ?? 50;
    const where = { inventory_item_id: itemId };
    const [items, total] = await Promise.all([
      (prisma as any).sku_master.findMany({
        where,
        include: skuInclude,
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).sku_master.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  },

  async resolveVariantSku(
    data: {
      itemId: number;
      attributes: Array<{
        attributeId: number;
        value: string;
        valueId?: number | null;
      }>;
      rate?: number | null;
      skuCode?: string | null;
      barcode?: string | null;
    },
    user?: string,
  ) {
    const item = await itemRepo.findById(data.itemId);
    if (!item) throw new NotFoundError('Item not found');

    if (!data.attributes || data.attributes.length === 0) {
      throw new ValidationError('At least one attribute value is required to resolve a variant SKU');
    }

    const ids = data.attributes.map((a) => a.attributeId);
    if (new Set(ids).size !== ids.length) {
      throw new ValidationError('Each attribute may appear only once');
    }

    // Validate before the lookup so an old SKU is not returned for an invalid request
    const attrMap = await validateVariantAttributes(data.itemId, data.attributes);

    // Sort attributes by attributeId ascending for deterministic canonical hash
    const sortedAttrs = [...data.attributes].sort((a, b) => a.attributeId - b.attributeId);

    // Canonical string for hashing (case-insensitive value comparison)
    const canonicalParts = sortedAttrs.map(
      (a) => `${a.attributeId}:${String(a.value).trim().toLowerCase()}`,
    );
    const canonicalString = canonicalParts.join('|');
    const attributeHash = crypto.createHash('sha256').update(canonicalString).digest('hex');

    // Check if matching SKU already exists for this item
    const existingSku = await findSkuByHash(data.itemId, attributeHash);

    if (existingSku) {
      return { sku: existingSku, isNew: false };
    }

    const summaryParts: string[] = [];
    const codeSegments: string[] = [];

    for (const attrInput of sortedAttrs) {
      const dbAttr = attrMap.get(attrInput.attributeId);
      const attrName = dbAttr ? dbAttr.attribute_name : `Attr${attrInput.attributeId}`;
      const cleanVal = String(attrInput.value).trim();
      summaryParts.push(`${attrName}: ${cleanVal}`);

      // Determine segment code (Option A: semantic generation)
      let segmentCode = '';
      if (attrInput.valueId && dbAttr && dbAttr.values) {
        const matchedVal = dbAttr.values.find((v: any) => v.id === attrInput.valueId);
        if (matchedVal && matchedVal.value_code) {
          segmentCode = matchedVal.value_code;
        }
      }
      if (!segmentCode) {
        segmentCode = cleanVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      }
      if (segmentCode) {
        codeSegments.push(segmentCode);
      }
    }

    const attributeSummary = summaryParts.join(' | ').slice(0, 500);

    // Generate semantic SKU code: ${ItemCode}-${Segment1}-${Segment2}...
    let generatedCode = data.skuCode?.trim();
    if (!generatedCode) {
      const baseItemCode = (item.Item_Code || `ITEM${item.id}`)
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .toUpperCase();
      const combinedSegments = codeSegments.join('-');
      generatedCode = combinedSegments ? `${baseItemCode}-${combinedSegments}` : `${baseItemCode}-VAR`;

      if (generatedCode.length > 80) {
        generatedCode = `${baseItemCode}-${attributeHash.substring(0, 8).toUpperCase()}`;
      }
    }

    const skuName = `${item.Item_Name} (${attributeSummary})`.slice(0, 150);

    // Atomic creation of sku_master and sku_attribute_values
    let newSku: any;
    try {
        newSku = await prisma.$transaction(async (tx: any) => {
        const collision = await tx.sku_master.findFirst({ where: { sku_code: generatedCode } });
        const finalSkuCode = collision
          ? `${generatedCode}-${attributeHash.substring(0, 4).toUpperCase()}`
          : generatedCode;

        const createdSku = await tx.sku_master.create({
          data: {
            sku_code: finalSkuCode,
            inventory_item_id: data.itemId,
            ITEM_ID: String(item.Item_Code || item.id),
            sku_name: skuName,
            barcode: data.barcode || null,
            rate: data.rate !== undefined && data.rate !== null ? data.rate : item.Price,
            SKU_TYPE: 1, // 1 = Variant
            attribute_hash: attributeHash,
            attribute_summary: attributeSummary,
          },
        });

        for (const attrInput of sortedAttrs) {
          await tx.sku_attribute_values.create({
            data: {
              sku_id: createdSku.id,
              attribute_id: attrInput.attributeId,
              attribute_value_id: attrInput.valueId || null,
              attribute_value: String(attrInput.value).trim(),
            },
          });
        }

        return tx.sku_master.findUnique({
          where: { id: createdSku.id },
          include: {
            sku_attribute_values: {
              include: {
                attribute: true,
                attribute_value_rel: true,
              },
            },
          },
        });
      });
    } catch (err: any) {
      // Another request created the same variant first. The transaction has rolled back,
      // so read the winner outside it.
      if (err?.code === 'P2002' && String(err?.meta?.target ?? '').includes('uk_item_attr_hash')) {
        const winner = await findSkuByHash(data.itemId, attributeHash);
        if (winner) return { sku: winner, isNew: false };
      }
      throw err;
    }

    return { sku: newSku, isNew: true };
  },
};

// ── Product Attribute Service ────────────────────────────────
export const ProductAttributeService = {
  async listAttributes(options: any) {
    return productAttributeRepo.findMany({
      ...options,
      include: {
        parent_attribute: { select: { id: true, attribute_name: true } },
        values: { orderBy: { display_order: 'asc' } },
        sub_attributes: {
          where: { is_active: true },
          include: { values: { orderBy: { display_order: 'asc' } } },
        },
      },
    });
  },

  async listAttributeTree() {
    return (prisma as any).product_attributes.findMany({
      where: { parent_id: null, is_active: true },
      include: {
        values: {
          where: { is_active: true },
          orderBy: { display_order: 'asc' },
        },
        sub_attributes: {
          where: { is_active: true },
          include: {
            values: {
              where: { is_active: true },
              orderBy: { display_order: 'asc' },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });
  },

  async getAttribute(id: number) {
    const attr = await (prisma as any).product_attributes.findUnique({
      where: { id },
      include: {
        parent_attribute: true,
        sub_attributes: {
          include: { values: { orderBy: { display_order: 'asc' } } },
        },
        values: { orderBy: { display_order: 'asc' } },
      },
    });
    if (!attr) throw new NotFoundError('Product attribute not found');
    return attr;
  },

  async createAttribute(data: any, user?: string) {
    if (data.attribute_type === 'GROUP' && data.parent_id) {
      throw new ValidationError('A GROUP attribute cannot have a parent attribute (groups cannot be nested)');
    }

    if (data.parent_id) {
      const parent = await (prisma as any).product_attributes.findUnique({
        where: { id: data.parent_id },
      });
      if (!parent) throw new ValidationError('Parent attribute does not exist');
      if (parent.attribute_type !== 'GROUP') {
        throw new ValidationError('Parent attribute must be of type GROUP');
      }
      if (parent.parent_id) {
        throw new ValidationError('Cannot nest attributes more than 2 levels deep');
      }
    }

    if (data.attribute_code) {
      const existing = await (prisma as any).product_attributes.findFirst({
        where: { attribute_code: data.attribute_code },
      });
      if (existing) throw new ConflictError('Attribute code already exists');
    }

    return productAttributeRepo.create(data, { user });
  },

  async updateAttribute(id: number, data: any, user?: string) {
    const existing = await (prisma as any).product_attributes.findUnique({
      where: { id },
      include: { sub_attributes: true },
    });
    if (!existing) throw new NotFoundError('Product attribute not found');

    if (data.parent_id === id) {
      throw new ValidationError('An attribute cannot be its own parent');
    }

    // Omitted fields keep their stored value; parent_id: null clears the parent
    const effectiveType = data.attribute_type ?? existing.attribute_type;
    const effectiveParentId = data.parent_id !== undefined ? data.parent_id : existing.parent_id;

    if (effectiveType === 'GROUP' && effectiveParentId) {
      throw new ValidationError('A GROUP attribute cannot have a parent attribute');
    }

    if (existing.sub_attributes?.length > 0 && effectiveType !== 'GROUP') {
      throw new ValidationError('Cannot change attribute type from GROUP when it already has sub-attributes');
    }

    if (effectiveParentId) {
      const parent = await (prisma as any).product_attributes.findUnique({
        where: { id: effectiveParentId },
      });
      if (!parent) throw new ValidationError('Parent attribute does not exist');
      if (parent.attribute_type !== 'GROUP') {
        throw new ValidationError('Parent attribute must be of type GROUP');
      }
      if (parent.parent_id) {
        throw new ValidationError('Cannot nest attributes more than 2 levels deep');
      }
    }

    if (data.attribute_code && data.attribute_code !== existing.attribute_code) {
      const codeCheck = await (prisma as any).product_attributes.findFirst({
        where: { attribute_code: data.attribute_code },
      });
      if (codeCheck) throw new ConflictError('Attribute code already exists');
    }

    return productAttributeRepo.update(id, data, { user });
  },

  async deleteAttribute(id: number, user?: string) {
    const existing = await (prisma as any).product_attributes.findUnique({
      where: { id },
      include: {
        sub_attributes: true,
        item_assignments: true,
        sku_attribute_values: true,
      },
    });
    if (!existing) throw new NotFoundError('Product attribute not found');

    if (existing.sub_attributes?.length > 0) {
      throw new ConflictError('Cannot delete attribute: it has sub-attributes');
    }
    if (existing.item_assignments?.length > 0) {
      throw new ConflictError('Cannot delete attribute: it is assigned to one or more items');
    }
    if (existing.sku_attribute_values?.length > 0) {
      throw new ConflictError('Cannot delete attribute: it is referenced by existing variant SKUs');
    }

    return productAttributeRepo.delete(id, { user, hardDelete: true });
  },

  // ── Values management for PREDETERMINED attributes ─────────
  async listValues(attributeId: number) {
    const attr = await (prisma as any).product_attributes.findUnique({
      where: { id: attributeId },
    });
    if (!attr) throw new NotFoundError('Product attribute not found');
    return (prisma as any).product_attribute_values.findMany({
      where: { attribute_id: attributeId, is_active: true },
      orderBy: { display_order: 'asc' },
    });
  },

  async createValue(attributeId: number, data: any, user?: string) {
    const attr = await (prisma as any).product_attributes.findUnique({
      where: { id: attributeId },
    });
    if (!attr) throw new NotFoundError('Product attribute not found');
    if (attr.attribute_type !== 'PREDETERMINED') {
      throw new ValidationError('Options can only be added to attributes of type PREDETERMINED');
    }
    return productAttributeValueRepo.create(
      { ...data, attribute_id: attributeId },
      { user },
    );
  },

  async updateValue(valueId: number, data: any, user?: string) {
    const val = await productAttributeValueRepo.findById(valueId);
    if (!val) throw new NotFoundError('Attribute value not found');
    return productAttributeValueRepo.update(valueId, data, { user });
  },

  async deleteValue(valueId: number, user?: string) {
    const val = await productAttributeValueRepo.findById(valueId);
    if (!val) throw new NotFoundError('Attribute value not found');

    const usageCount = await (prisma as any).sku_attribute_values.count({
      where: { attribute_value_id: valueId },
    });
    if (usageCount > 0) {
      throw new ConflictError('Cannot delete attribute value: it is used in existing variant SKUs');
    }

    return productAttributeValueRepo.delete(valueId, { user, hardDelete: true });
  },
};

// ── Item Attribute Assignment Service ────────────────────────
export const ItemAttributeService = {
  async assignAttributes(
    itemId: number,
    assignments: Array<{ attribute_id: number; is_required?: boolean; display_order?: number }>,
    user?: string,
  ) {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new NotFoundError('Item not found');

    const ids = assignments.map((a) => a.attribute_id);
    if (new Set(ids).size !== ids.length) {
      throw new ValidationError('Each attribute may be assigned only once');
    }
    const found = await (prisma as any).product_attributes.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const foundIds = new Set<number>(found.map((f: any) => f.id));
    const missing = ids.find((id) => !foundIds.has(id));
    if (missing !== undefined) {
      throw new ValidationError(`Attribute with ID ${missing} does not exist`);
    }

    return prisma.$transaction(async (tx: any) => {
      await tx.item_attribute_assignments.deleteMany({ where: { item_id: itemId } });
      if (assignments.length > 0) {
        await tx.item_attribute_assignments.createMany({
          data: assignments.map((a) => ({
            item_id: itemId,
            attribute_id: a.attribute_id,
            is_required: Boolean(a.is_required),
            display_order: Number(a.display_order ?? 0),
          })),
        });
      }
      return tx.item_attribute_assignments.findMany({
        where: { item_id: itemId },
        include: { attribute: true },
        orderBy: { display_order: 'asc' },
      });
    });
  },

  async getItemAttributes(itemId: number) {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new NotFoundError('Item not found');

    const assignments = await (prisma as any).item_attribute_assignments.findMany({
      where: { item_id: itemId },
      include: {
        attribute: {
          include: {
            values: {
              where: { is_active: true },
              orderBy: { display_order: 'asc' },
            },
            sub_attributes: {
              where: { is_active: true },
              include: {
                values: {
                  where: { is_active: true },
                  orderBy: { display_order: 'asc' },
                },
              },
              orderBy: { id: 'asc' },
            },
          },
        },
      },
      orderBy: { display_order: 'asc' },
    });

    return assignments;
  },

  async getItemAttributeSuggestions(itemId: number) {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new NotFoundError('Item not found');

    // Latest 500 recorded values for this item's SKUs, then at most 50 distinct per attribute
    const rows = await (prisma as any).sku_attribute_values.findMany({
      where: { sku: { inventory_item_id: itemId } },
      select: { attribute_id: true, attribute_value: true },
      orderBy: { id: 'desc' },
      take: 500,
    });

    const suggestions: Record<number, string[]> = {};
    for (const row of rows) {
      const list = (suggestions[row.attribute_id] ??= []);
      if (list.length < 50 && !list.includes(row.attribute_value)) {
        list.push(row.attribute_value);
      }
    }

    return suggestions;
  },
};
