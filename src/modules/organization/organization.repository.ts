import { BaseRepository } from '../../core/repository/BaseRepository';
import {
  companyprofile,
  financialyear,
  branch,
  currencymaster,
  currencyrates,
  voucherseries,
  config_settings,
  address_book,
  extra_values_table,
  log,
  user_roles,
  user_credentials,
  user_access_permissions,
  project_master,
  error_reporting,
} from '@prisma/client';

export class CompanyProfileRepository extends BaseRepository<companyprofile> {
  constructor() {
    super({
      modelName: 'companyprofile',
      primaryKeyField: 'id',
      // companyprofile has no is_active / updated_at columns (Prisma schema).
      softDeleteField: null,
      searchFields: ['Company_Name', 'Branch', 'TRN'],
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class FinancialYearRepository extends BaseRepository<financialyear> {
  constructor() {
    super({
      modelName: 'financialyear',
      primaryKeyField: 'id',
      softDeleteField: null,
      searchFields: ['fy_code', 'display_name'],
      filterFields: ['company_id', 'status', 'is_default'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class BranchRepository extends BaseRepository<branch> {
  constructor() {
    super({
      modelName: 'branch',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      searchFields: ['branch_name', 'branch_code'],
      filterFields: ['company_id', 'is_active'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class CurrencyRepository extends BaseRepository<currencymaster> {
  constructor() {
    super({
      modelName: 'currencymaster',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      searchFields: ['currency_name', 'iso_code'],
      filterFields: ['is_base_currency', 'is_active'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class CurrencyRateRepository extends BaseRepository<currencyrates> {
  constructor() {
    super({
      modelName: 'currencyrates',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class VoucherSeriesRepository extends BaseRepository<voucherseries> {
  constructor() {
    super({
      modelName: 'voucherseries',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      searchFields: ['display_name', 'prefix', 'voucher_type'],
      filterFields: ['company_id', 'branch_id', 'financial_year_id', 'voucher_type', 'is_active', 'is_default'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class ConfigSettingRepository extends BaseRepository<config_settings> {
  constructor() {
    super({
      modelName: 'config_settings',
      primaryKeyField: 'id',
      softDeleteField: null,
      searchFields: ['gm_key', 'display_text'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class AddressBookRepository extends BaseRepository<address_book> {
  constructor() {
    super({
      modelName: 'address_book',
      primaryKeyField: 'id',
      softDeleteField: 'isActive', // maps toisActive tinyint(1)
      searchFields: ['Name', 'Company_Name', 'Email'],
      filterFields: ['contact_type'],
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class ExtraValuesRepository extends BaseRepository<extra_values_table> {
  constructor() {
    super({
      modelName: 'extra_values_table',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class AuditLogRepository extends BaseRepository<log> {
  constructor() {
    super({
      modelName: 'log',
      primaryKeyField: 'id',
      softDeleteField: null,
      searchFields: ['action', 'data'],
      filterFields: ['status', 'client_id'],
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class UserRoleRepository extends BaseRepository<user_roles> {
  constructor() {
    super({
      modelName: 'user_roles',
      primaryKeyField: 'id',
      softDeleteField: null,
      searchFields: ['role_name', 'description'],
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class UserCredentialsRepository extends BaseRepository<user_credentials> {
  constructor() {
    super({
      modelName: 'user_credentials',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      searchFields: ['username'],
      filterFields: ['role_id', 'branch_id', 'is_active'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class UserAccessPermissionRepository extends BaseRepository<user_access_permissions> {
  constructor() {
    super({
      modelName: 'user_access_permissions',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class ProjectMasterRepository extends BaseRepository<project_master> {
  constructor() {
    super({
      modelName: 'project_master',
      primaryKeyField: 'id',
      softDeleteField: null,
      searchFields: ['Project_Name', 'project_code', 'PROJECT_ID'],
      filterFields: ['parent_project_master_id', 'godown_id'],
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class ErrorReportingRepository extends BaseRepository<error_reporting> {
  constructor() {
    super({
      modelName: 'error_reporting',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}
