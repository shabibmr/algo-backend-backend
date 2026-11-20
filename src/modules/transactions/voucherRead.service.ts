import { prisma } from '../../core/db/prisma';
import { NotFoundError } from '../../core/errors/AppError';

// ─── Shared helpers ────────────────────────────────────────────────────────────

export interface ListFilters {
  start_date?: string;
  end_date?: string;
  prefix?: string;
  financial_year?: string;
  ledger_id?: number;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function parsePage(filters: ListFilters) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(200, Math.max(1, filters.limit || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function dateRange(filters: ListFilters) {
  const range: any = {};
  if (filters.start_date) range.gte = new Date(filters.start_date);
  if (filters.end_date) range.lte = new Date(filters.end_date);
  if (filters.financial_year && !filters.start_date && !filters.end_date) {
    // FY "2025-26" → Apr 2025 – Mar 2026
    const [startYr] = filters.financial_year.split('-').map(Number);
    range.gte = new Date(`${startYr}-04-01`);
    range.lte = new Date(`${startYr + 1}-03-31`);
  }
  return Object.keys(range).length ? range : undefined;
}

function getMainRelationKey(voucherType: string): string | null {
  const map: Record<string, string> = {
    SalesInvoice: 'sales_invoice_main',
    PurchaseInvoice: 'purchase_invoice_main',
    PaymentVoucher: 'payment_voucher_main',
    ReceiptVoucher: 'receipt_voucher_main',
    ContraVoucher: 'contra_voucher_main',
    JournalVoucher: 'journal_voucher_main',
    CreditNote: 'credit_note_main',
    DebitNote: 'debit_note_main',
    Quotation: 'quotation_main',
    SalesOrder: 'sales_order_main',
    PurchaseOrder: 'purchase_order_main',
    DeliveryNote: 'delivery_note_main',
    ReceiptNote: 'receipt_note_main',
    GodownTransfer: 'godown_tranfer_main',
    MaterialIn: 'material_in_main',
    Requirement: 'requirement_main',
    StockRequest: 'stock_request_main',
  };
  return map[voucherType] || null;
}

function headerWhere(voucherType: string, filters: ListFilters) {
  const where: any = { voucher_type: voucherType };
  if (filters.prefix) where.voucher_prefix = filters.prefix;
  const dr = dateRange(filters);
  if (dr) where.voucher_date = dr;
  
  const mainKey = getMainRelationKey(voucherType);
  if (filters.status && mainKey) {
    where[mainKey] = {
      ...(where[mainKey] || {}),
      VoucherStatus: filters.status,
    };
  }

  if (filters.search) {
    const searchConditions: any[] = [
      { voucher_no: { contains: filters.search } },
      { voucher_prefix: { contains: filters.search } },
    ];
    if (mainKey) {
      searchConditions.push({
        [mainKey]: {
          Narration: { contains: filters.search },
        },
      });
      if (voucherType === 'SalesInvoice') {
        searchConditions.push({
          [mainKey]: {
            Billing_Name: { contains: filters.search },
          },
        });
      }
    }
    where.OR = searchConditions;
  }
  return where;
}

function getOrderBy(voucherType: string, filters: ListFilters): any {
  if (filters.sortBy) {
    const direction = filters.sortOrder === 'asc' ? 'asc' : 'desc';
    if (['voucher_no', 'voucher_date', 'voucher_prefix'].includes(filters.sortBy)) {
      return { [filters.sortBy]: direction };
    }
    const mainKey = getMainRelationKey(voucherType);
    if (mainKey) {
      return {
        [mainKey]: {
          [filters.sortBy]: direction,
        },
      };
    }
  }
  return { voucher_date: 'desc' };
}

function paginateMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function genericList(voucherType: string, relationKey: string, filters: ListFilters) {
  const { page, limit, skip } = parsePage(filters);
  const hWhere = headerWhere(voucherType, filters);
  
  if (filters.ledger_id) {
    hWhere[relationKey] = {
      ...(hWhere[relationKey] || {}),
      voucher_ledger_id: filters.ledger_id,
    };
  }

  const orderBy = getOrderBy(voucherType, filters);

  const [total, items] = await Promise.all([
    prisma.voucher_headers.count({ where: hWhere }),
    prisma.voucher_headers.findMany({
      where: hWhere,
      include: { [relationKey]: true },
      orderBy,
      skip,
      take: limit,
    }),
  ]);
  return { items, meta: paginateMeta(total, page, limit) };
}

// ─── 1. SalesInvoice ───────────────────────────────────────────────────────────

interface SkuLabel {
  id: number;
  sku_code: string | null;
  attribute_summary: string | null;
}

/** Pure merge: copies sku_code and attribute_summary onto lines that have a voucher_sku_id. */
export function mergeSkuLabels<T extends { voucher_sku_id?: number | null }>(
  details: T[],
  skus: SkuLabel[],
): Array<T & { sku_code?: string | null; attribute_summary?: string | null }> {
  const byId = new Map(skus.map((s) => [s.id, s]));
  return details.map((d) => {
    const sku = d.voucher_sku_id ? byId.get(d.voucher_sku_id) : undefined;
    return sku ? { ...d, sku_code: sku.sku_code, attribute_summary: sku.attribute_summary } : d;
  });
}

/** Loads all referenced SKUs in one query and labels the detail lines. */
export async function attachSkuLabels<T extends { voucher_sku_id?: number | null }>(details: T[]) {
  const ids = [...new Set(details.map((d) => d.voucher_sku_id).filter((id): id is number => !!id))];
  if (ids.length === 0) return details;
  const skus = await prisma.sku_master.findMany({
    where: { id: { in: ids } },
    select: { id: true, sku_code: true, attribute_summary: true },
  });
  return mergeSkuLabels(details, skus);
}

export const SalesInvoiceReadService = {
  async list(filters: ListFilters) {
    return genericList('SalesInvoice', 'sales_invoice_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.sales_invoice_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`SalesInvoice #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.sales_invoice_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 2. PurchaseInvoice ────────────────────────────────────────────────────────

export const PurchaseInvoiceReadService = {
  async list(filters: ListFilters) {
    return genericList('PurchaseInvoice', 'purchase_invoice_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.purchase_invoice_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`PurchaseInvoice #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.purchase_invoice_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 3. Payment Voucher ────────────────────────────────────────────────────────

export const PaymentVoucherReadService = {
  async list(filters: ListFilters) {
    return genericList('PaymentVoucher', 'payment_voucher_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.payment_voucher_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`PaymentVoucher #${id} not found`);
    const details = await prisma.payment_voucher_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 4. Receipt Voucher ────────────────────────────────────────────────────────

export const ReceiptVoucherReadService = {
  async list(filters: ListFilters) {
    return genericList('ReceiptVoucher', 'receipt_voucher_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.receipt_voucher_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`ReceiptVoucher #${id} not found`);
    const details = await prisma.receipt_voucher_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 5. Contra Voucher ────────────────────────────────────────────────────────

export const ContraVoucherReadService = {
  async list(filters: ListFilters) {
    return genericList('ContraVoucher', 'contra_voucher_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.contra_voucher_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`ContraVoucher #${id} not found`);
    const details = await prisma.contra_voucher_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 6. Journal Voucher ───────────────────────────────────────────────────────

export const JournalVoucherReadService = {
  async list(filters: ListFilters) {
    return genericList('JournalVoucher', 'journal_voucher_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.journal_voucher_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`JournalVoucher #${id} not found`);
    const details = await prisma.journal_voucher_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 7. Credit Note ───────────────────────────────────────────────────────────

export const CreditNoteReadService = {
  async list(filters: ListFilters) {
    return genericList('CreditNote', 'credit_note_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.credit_note_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`CreditNote #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.credit_note_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 8. Debit Note ────────────────────────────────────────────────────────────

export const DebitNoteReadService = {
  async list(filters: ListFilters) {
    return genericList('DebitNote', 'debit_note_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.debit_note_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`DebitNote #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.debit_note_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 9. Quotation ─────────────────────────────────────────────────────────────

export const QuotationReadService = {
  async list(filters: ListFilters) {
    return genericList('Quotation', 'quotation_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.quotation_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`Quotation #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.quotation_details.findMany({ where: { voucher_id: id } }),
    );
    const linkages = await prisma.voucherlinkage.findMany({
      where: { OR: [{ source_voucher_id: id }, { target_voucher_id: id }] },
    });
    return { ...main, details, linkages };
  },
};

// ─── 10. SalesOrder ───────────────────────────────────────────────────────────

export const SalesOrderReadService = {
  async list(filters: ListFilters) {
    return genericList('SalesOrder', 'sales_order_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.sales_order_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`SalesOrder #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.sales_order_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 11. PurchaseOrder ────────────────────────────────────────────────────────

export const PurchaseOrderReadService = {
  async list(filters: ListFilters) {
    return genericList('PurchaseOrder', 'purchase_order_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.purchase_order_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`PurchaseOrder #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.purchase_order_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 12. DeliveryNote ─────────────────────────────────────────────────────────

export const DeliveryNoteReadService = {
  async list(filters: ListFilters) {
    return genericList('DeliveryNote', 'delivery_note_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.delivery_note_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`DeliveryNote #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.delivery_note_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 13. ReceiptNote (GRN) ────────────────────────────────────────────────────

export const ReceiptNoteReadService = {
  async list(filters: ListFilters) {
    return genericList('ReceiptNote', 'receipt_note_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.receipt_note_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`ReceiptNote #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.receipt_note_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 14. GodownTransfer ───────────────────────────────────────────────────────

export const GodownTransferReadService = {
  async list(filters: ListFilters) {
    return genericList('GodownTransfer', 'godown_tranfer_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.godown_tranfer_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`GodownTransfer #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.godown_transfer_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 15. MaterialIn ───────────────────────────────────────────────────────────

export const MaterialInReadService = {
  async list(filters: ListFilters) {
    return genericList('MaterialIn', 'material_in_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.material_in_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`MaterialIn #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.material_in_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 16. Requirement ──────────────────────────────────────────────────────────

export const RequirementReadService = {
  async list(filters: ListFilters) {
    return genericList('Requirement', 'requirement_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.requirement_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`Requirement #${id} not found`);
    const details = await prisma.requirement_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 17. StockRequest ─────────────────────────────────────────────────────────

export const StockRequestReadService = {
  async list(filters: ListFilters) {
    return genericList('StockRequest', 'stock_request_main', filters);
  },

  async getById(id: number) {
    const main = await prisma.stock_request_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`StockRequest #${id} not found`);
    const details = await attachSkuLabels(
      await prisma.stock_request_details.findMany({ where: { voucher_id: id } }),
    );
    return { ...main, details };
  },
};

// ─── 18. VoucherHeader generic read ───────────────────────────────────────────

export const VoucherHeaderReadService = {
  async getById(id: number) {
    const header = await prisma.voucher_headers.findUnique({ where: { id } });
    if (!header) throw new NotFoundError(`VoucherHeader #${id} not found`);
    return header;
  },
};

// ─── 19. VoucherLinkage read ──────────────────────────────────────────────────

export const VoucherLinkageReadService = {
  async getByVoucher(voucherHeaderId: number) {
    const linkages = await prisma.voucherlinkage.findMany({
      where: {
        OR: [{ source_voucher_id: voucherHeaderId }, { target_voucher_id: voucherHeaderId }],
      },
      include: {
        source_voucher: {
          select: {
            id: true,
            voucher_type: true,
            voucher_no: true,
            voucher_prefix: true,
            voucher_date: true,
          },
        },
        target_voucher: {
          select: {
            id: true,
            voucher_type: true,
            voucher_no: true,
            voucher_prefix: true,
            voucher_date: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return linkages;
  },
};

// ─── 20. VoucherLineRelation read ─────────────────────────────────────────────

export const VoucherLineRelationReadService = {
  async getBySourceLine(detailLineId: number) {
    const relations = await prisma.voucher_line_relations.findMany({
      where: { source_line_id: detailLineId },
      orderBy: { created_at: 'desc' },
    });

    const totalConverted = relations.reduce((sum, r) => sum + Number(r.quantity_converted), 0);

    return { relations, total_converted: totalConverted };
  },
};
