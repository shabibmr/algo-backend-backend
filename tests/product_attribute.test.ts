import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/core/db/prisma';
import { generateAccessToken } from '../src/core/auth/jwt';

describe('🚀 Product Attributes & Variant SKU Integration Tests', () => {
  let adminToken: string;
  let testItemId: number;
  const itemCode = `OXFORD-${Date.now()}`;
  const createdAttrIds: number[] = [];

  beforeAll(async () => {
    // Generate valid admin token for Inventory module
    adminToken = generateAccessToken({
      userId: 1,
      username: 'admin',
      roleId: 1,
      branchId: 1,
    });

    // Unique code per run so a rerun does not collide with uk_item_code
    const testItem = await prisma.sales_inventory_items.create({
      data: {
        Item_Name: 'Oxford Cotton Shirt',
        Item_Code: itemCode,
        Group_Id: 'GRP1',
        Price: 45.0,
        is_active: true,
      },
    });
    testItemId = testItem.id;
  });

  afterAll(async () => {
    // Delete only rows this file created. Children before parents (fk_attr_parent is Restrict).
    const attrIds = createdAttrIds.filter((id) => id !== undefined);
    const skus = await prisma.sku_master.findMany({
      where: { inventory_item_id: testItemId },
      select: { id: true },
    });
    const skuIds = skus.map((s) => s.id);
    await prisma.sku_attribute_values.deleteMany({ where: { sku_id: { in: skuIds } } });
    await prisma.sku_master.deleteMany({ where: { inventory_item_id: testItemId } });
    await prisma.item_attribute_assignments.deleteMany({ where: { item_id: testItemId } });
    await prisma.product_attribute_values.deleteMany({ where: { attribute_id: { in: attrIds } } });
    await prisma.product_attributes.deleteMany({
      where: { id: { in: attrIds }, parent_id: { not: null } },
    });
    await prisma.product_attributes.deleteMany({ where: { id: { in: attrIds } } });
    await prisma.sales_inventory_items.deleteMany({ where: { id: testItemId } });
  });

  let sizeAttrId: number;
  let colorAttrId: number;
  let groupAttrId: number;
  let neckAttrId: number;
  let chestAttrId: number;
  let sizeMValId: number;
  let sizeLValId: number;

  it('1. Should create a PREDETERMINED attribute (Size) and add options', async () => {
    const res = await request(app)
      .post('/inventory/attribute')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attribute_name: 'Size',
        attribute_code: 'SIZE',
        attribute_type: 'PREDETERMINED',
        data_type: 'TEXT',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    sizeAttrId = res.body.data.id;
    createdAttrIds.push(sizeAttrId);

    // Add option M
    const optM = await request(app)
      .post(`/inventory/attribute/${sizeAttrId}/values`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attribute_value: 'M',
        value_code: 'M',
        display_order: 1,
      });
    expect(optM.status).toBe(201);
    sizeMValId = optM.body.data.id;

    // Add option L
    const optL = await request(app)
      .post(`/inventory/attribute/${sizeAttrId}/values`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attribute_value: 'L',
        value_code: 'L',
        display_order: 2,
      });
    expect(optL.status).toBe(201);
    sizeLValId = optL.body.data.id;

    // List values
    const listVals = await request(app)
      .get(`/inventory/attribute/${sizeAttrId}/values`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listVals.status).toBe(200);
    expect(listVals.body.data.length).toBe(2);
  });

  it('2. Should create an EDITABLE attribute (Color)', async () => {
    const res = await request(app)
      .post('/inventory/attribute')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attribute_name: 'Color',
        attribute_code: 'COLOR',
        attribute_type: 'EDITABLE',
        data_type: 'TEXT',
      });

    expect(res.status).toBe(201);
    colorAttrId = res.body.data.id;
    createdAttrIds.push(colorAttrId);

    // Attempting to add options to an EDITABLE attribute should fail validation
    const failOpt = await request(app)
      .post(`/inventory/attribute/${colorAttrId}/values`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ attribute_value: 'Red' });
    expect(failOpt.status).toBe(400);
  });

  it('3. Should create a 2-level GROUP attribute (Shirt Measurements) with sub-attributes', async () => {
    const groupRes = await request(app)
      .post('/inventory/attribute')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attribute_name: 'Shirt Measurements',
        attribute_code: 'SHIRT_MEASURE',
        attribute_type: 'GROUP',
      });

    expect(groupRes.status).toBe(201);
    groupAttrId = groupRes.body.data.id;
    createdAttrIds.push(groupAttrId);

    // Add sub-attribute Neck
    const neckRes = await request(app)
      .post('/inventory/attribute')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attribute_name: 'Neck',
        attribute_code: 'NECK_MEASURE',
        attribute_type: 'EDITABLE',
        parent_id: groupAttrId,
        unit: 'inches',
      });
    expect(neckRes.status).toBe(201);
    neckAttrId = neckRes.body.data.id;
    createdAttrIds.push(neckAttrId);

    // Add sub-attribute Chest
    const chestRes = await request(app)
      .post('/inventory/attribute')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attribute_name: 'Chest',
        attribute_code: 'CHEST_MEASURE',
        attribute_type: 'EDITABLE',
        parent_id: groupAttrId,
        unit: 'inches',
      });
    expect(chestRes.status).toBe(201);
    chestAttrId = chestRes.body.data.id;
    createdAttrIds.push(chestAttrId);

    // Verify 2-level hierarchy invariant: nested group must be rejected
    const nestedGroupFail = await request(app)
      .post('/inventory/attribute')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attribute_name: 'Sub Group',
        attribute_type: 'GROUP',
        parent_id: groupAttrId,
      });
    expect(nestedGroupFail.status).toBe(400);
  });

  it('4. Should assign attributes to an Item Master and retrieve them with sub-attributes', async () => {
    const assignRes = await request(app)
      .post(`/inventory/item/${testItemId}/attributes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attributes: [
          { attribute_id: sizeAttrId, is_required: true, display_order: 1 },
          { attribute_id: colorAttrId, is_required: false, display_order: 2 },
          { attribute_id: groupAttrId, is_required: false, display_order: 3 },
        ],
      });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/inventory/item/${testItemId}/attributes`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.length).toBe(3);

    // Verify group expanded with sub-attributes
    const groupItem = getRes.body.data.find(
      (a: any) => a.attribute_id === groupAttrId,
    );
    expect(groupItem.attribute.sub_attributes.length).toBe(2);
  });

  let resolvedSkuId: number;

  it('5. Should resolve variant SKU: create new SKU on first call with Option A semantic code', async () => {
    const res = await request(app)
      .post('/inventory/sku/resolve-variant')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        itemId: testItemId,
        attributes: [
          { attributeId: sizeAttrId, value: 'L', valueId: sizeLValId },
          { attributeId: colorAttrId, value: 'Navy Blue' },
          { attributeId: neckAttrId, value: '16.5' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isNew).toBe(true);
    expect(res.body.data.sku.id).toBeDefined();
    resolvedSkuId = res.body.data.sku.id;

    // Verify semantic code generation (Option A: <itemCode>-L-NAVYBLUE-165)
    expect(res.body.data.sku.sku_code).toContain(itemCode);
    expect(res.body.data.sku.sku_code).toContain('L');
    expect(res.body.data.sku.sku_code).toContain('NAVYBLUE');
    expect(res.body.data.sku.attribute_summary).toContain('Size: L');
    expect(res.body.data.sku.attribute_summary).toContain('Color: Navy Blue');
    expect(res.body.data.sku.attribute_summary).toContain('Neck: 16.5');
  });

  it('6. Should pick the EXACT same SKU ID on subsequent resolution with identical values', async () => {
    const res = await request(app)
      .post('/inventory/sku/resolve-variant')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        itemId: testItemId,
        attributes: [
          // Even if passed in different order or casing with whitespace
          { attributeId: colorAttrId, value: ' navy blue ' },
          { attributeId: neckAttrId, value: '16.5' },
          { attributeId: sizeAttrId, value: 'L', valueId: sizeLValId },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isNew).toBe(false);
    expect(res.body.data.sku.id).toBe(resolvedSkuId);
  });

  it('7. Should return past editable values in attribute suggestions for Dropdown + Add New', async () => {
    const res = await request(app)
      .get(`/inventory/item/${testItemId}/attribute-suggestions`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data[colorAttrId]).toBeDefined();
    expect(res.body.data[colorAttrId]).toContain('Navy Blue');
    expect(res.body.data[neckAttrId]).toContain('16.5');
  });

  it('8. Should list all variant SKUs for the item', async () => {
    const res = await request(app)
      .get(`/inventory/item/${testItemId}/skus`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    const matched = res.body.data.find((s: any) => s.id === resolvedSkuId);
    expect(matched).toBeDefined();
    expect(matched.sku_attribute_values.length).toBe(3);
  });
});
