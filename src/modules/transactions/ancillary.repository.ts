import { BaseRepository } from '../../core/repository/BaseRepository';
import { terms_and_conditions, transportation_details } from '@prisma/client';

export class TermsAndConditionsRepository extends BaseRepository<terms_and_conditions> {
  constructor() {
    super({
      modelName: 'terms_and_conditions',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'last_modified',
      },
    });
  }
}

export class TransportationDetailsRepository extends BaseRepository<transportation_details> {
  constructor() {
    super({
      modelName: 'transportation_details',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'last_modified',
      },
    });
  }
}
