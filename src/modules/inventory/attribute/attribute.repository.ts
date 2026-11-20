import { BaseRepository } from '../../../core/repository/BaseRepository';

export class ProductAttributeRepository extends BaseRepository<any> {
  constructor() {
    super({
      modelName: 'product_attributes',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      searchFields: ['attribute_name', 'attribute_code'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class ProductAttributeValueRepository extends BaseRepository<any> {
  constructor() {
    super({
      modelName: 'product_attribute_values',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      searchFields: ['attribute_value', 'value_code'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class ItemAttributeAssignmentRepository extends BaseRepository<any> {
  constructor() {
    super({
      modelName: 'item_attribute_assignments',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class SkuAttributeValueRepository extends BaseRepository<any> {
  constructor() {
    super({
      modelName: 'sku_attribute_values',
      primaryKeyField: 'id',
      softDeleteField: null,
      searchFields: ['attribute_value'],
    });
  }
}
