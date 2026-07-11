import { BaseRepository } from '../../core/repository/BaseRepository';
import {
  quotation_main,
  quotation_details,
  sales_order_main,
  sales_order_details,
  purchase_order_main,
  purchase_order_details,
  godown_tranfer_main,
  godown_transfer_details,
  delivery_note_main,
  delivery_note_details,
  receipt_note_main,
  receipt_note_details,
  material_in_main,
  material_in_details,
  requirement_main,
  requirement_details,
  stock_request_main,
  stock_request_details,
  journal_ledger,
  voucher_line_allocations,
  voucher_line_relations,
  voucherlinkage,
  shipments,
  itemphysicalspecs,
} from '@prisma/client';

export class QuotationMainRepository extends BaseRepository<quotation_main> {
  constructor() {
    super({
      modelName: 'quotation_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class QuotationDetailRepository extends BaseRepository<quotation_details> {
  constructor() {
    super({
      modelName: 'quotation_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class SalesOrderMainRepository extends BaseRepository<sales_order_main> {
  constructor() {
    super({
      modelName: 'sales_order_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class SalesOrderDetailRepository extends BaseRepository<sales_order_details> {
  constructor() {
    super({
      modelName: 'sales_order_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class PurchaseOrderMainRepository extends BaseRepository<purchase_order_main> {
  constructor() {
    super({
      modelName: 'purchase_order_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class PurchaseOrderDetailRepository extends BaseRepository<purchase_order_details> {
  constructor() {
    super({
      modelName: 'purchase_order_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class GodownTransferMainRepository extends BaseRepository<godown_tranfer_main> {
  constructor() {
    super({
      modelName: 'godown_tranfer_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class GodownTransferDetailRepository extends BaseRepository<godown_transfer_details> {
  constructor() {
    super({
      modelName: 'godown_transfer_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class DeliveryNoteMainRepository extends BaseRepository<delivery_note_main> {
  constructor() {
    super({
      modelName: 'delivery_note_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class DeliveryNoteDetailRepository extends BaseRepository<delivery_note_details> {
  constructor() {
    super({
      modelName: 'delivery_note_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class ReceiptNoteMainRepository extends BaseRepository<receipt_note_main> {
  constructor() {
    super({
      modelName: 'receipt_note_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class ReceiptNoteDetailRepository extends BaseRepository<receipt_note_details> {
  constructor() {
    super({
      modelName: 'receipt_note_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class MaterialInMainRepository extends BaseRepository<material_in_main> {
  constructor() {
    super({
      modelName: 'material_in_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class MaterialInDetailRepository extends BaseRepository<material_in_details> {
  constructor() {
    super({
      modelName: 'material_in_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class RequirementMainRepository extends BaseRepository<requirement_main> {
  constructor() {
    super({
      modelName: 'requirement_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class RequirementDetailRepository extends BaseRepository<requirement_details> {
  constructor() {
    super({
      modelName: 'requirement_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class StockRequestMainRepository extends BaseRepository<stock_request_main> {
  constructor() {
    super({
      modelName: 'stock_request_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        createdAt: 'TimeStamp',
        lastModified: 'Last_Updated',
        addedBy: 'Added_By',
      },
    });
  }
}

export class StockRequestDetailRepository extends BaseRepository<stock_request_details> {
  constructor() {
    super({
      modelName: 'stock_request_details',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class JournalLedgerRepository extends BaseRepository<journal_ledger> {
  constructor() {
    super({
      modelName: 'journal_ledger',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class VoucherLineAllocationRepository extends BaseRepository<voucher_line_allocations> {
  constructor() {
    super({
      modelName: 'voucher_line_allocations',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class VoucherLineRelationRepository extends BaseRepository<voucher_line_relations> {
  constructor() {
    super({
      modelName: 'voucher_line_relations',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class VoucherLinkageRepository extends BaseRepository<voucherlinkage> {
  constructor() {
    super({
      modelName: 'voucherlinkage',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'last_modified',
        addedBy: 'added_by',
      },
    });
  }
}

export class ShipmentRepository extends BaseRepository<shipments> {
  constructor() {
    super({
      modelName: 'shipments',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}

export class ItemPhysicalSpecRepository extends BaseRepository<itemphysicalspecs> {
  constructor() {
    super({
      modelName: 'itemphysicalspecs',
      primaryKeyField: 'id',
      softDeleteField: null,
    });
  }
}
