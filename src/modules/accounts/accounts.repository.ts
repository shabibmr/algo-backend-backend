import { BaseRepository } from '../../core/repository/BaseRepository';
import {
  account_groups,
  ledger_master,
  ledger_bank_details,
  ledger_credit_settings,
  ledger_tax_settings,
  billwise_records,
  cheque_details,
} from '@prisma/client';

export class AccountGroupRepository extends BaseRepository<account_groups> {
  constructor() {
    super({
      modelName: 'account_groups',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'updated_at',
      },
    });
  }
}

export class LedgerMasterRepository extends BaseRepository<ledger_master> {
  constructor() {
    super({
      modelName: 'ledger_master',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      searchFields: ['Ledger_Name', 'Ledger_Type', 'ledger_code', 'currency_code'],
      filterFields: ['Ledger_Type', 'is_system_defined', 'is_active', 'account_group_id'],
      auditFieldMap: {
        createdAt: 'Date_Created',
        lastModified: 'Last_Modified',
      },
    });
  }
}

export class LedgerBankDetailsRepository extends BaseRepository<ledger_bank_details> {
  constructor() {
    super({
      modelName: 'ledger_bank_details',
      primaryKeyField: 'ledger_id', // 1:1, PK is ledger_id
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class LedgerCreditSettingsRepository extends BaseRepository<ledger_credit_settings> {
  constructor() {
    super({
      modelName: 'ledger_credit_settings',
      primaryKeyField: 'ledger_id', // 1:1, PK is ledger_id
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class LedgerTaxSettingsRepository extends BaseRepository<ledger_tax_settings> {
  constructor() {
    super({
      modelName: 'ledger_tax_settings',
      primaryKeyField: 'ledger_id', // 1:1, PK is ledger_id
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class BillwiseRecordRepository extends BaseRepository<billwise_records> {
  constructor() {
    super({
      modelName: 'billwise_records',
      primaryKeyField: 'id', // maps to _id
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class ChequeDetailsRepository extends BaseRepository<cheque_details> {
  constructor() {
    super({
      modelName: 'cheque_details',
      primaryKeyField: 'id', // maps to _id
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}
