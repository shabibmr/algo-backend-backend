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

function headerWhere(voucherType: string, filters: ListFilters) {
  const where: any = { voucher_type: voucherType };
  if (filters.prefix) where.voucher_prefix = filters.prefix;
  const dr = dateRange(filters);
  if (dr) where.voucher_date = dr;
  return where;
}

function mainWhere(filters: ListFilters, ledgerKey = 'voucher_ledger_id') {
  const where: any = {};
  const dr = dateRange(filters);
  if (dr) where.Date_Created = dr;
  if (filters.ledger_id) where[ledgerKey] = filters.ledger_id;
  if (filters.status) where.VoucherStatus = filters.status;
  return where;
}

function paginateMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ─── 1. SalesInvoice ───────────────────────────────────────────────────────────

export const SalesInvoiceReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('SalesInvoice', filters);
    if (filters.ledger_id) {
      hWhere.sales_invoice_main = { voucher_ledger_id: filters.ledger_id };
    }

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { sales_invoice_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.sales_invoice_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`SalesInvoice #${id} not found`);
    const details = await prisma.sales_invoice_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 2. PurchaseInvoice ────────────────────────────────────────────────────────

export const PurchaseInvoiceReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('PurchaseInvoice', filters);
    if (filters.ledger_id) {
      hWhere.purchase_invoice_main = { voucher_ledger_id: filters.ledger_id };
    }

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { purchase_invoice_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.purchase_invoice_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`PurchaseInvoice #${id} not found`);
    const details = await prisma.purchase_invoice_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 3. Payment Voucher ────────────────────────────────────────────────────────

export const PaymentVoucherReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('Payment', filters);
    if (filters.ledger_id) {
      hWhere.payment_voucher_main = { voucher_ledger_id: filters.ledger_id };
    }

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { payment_voucher_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
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
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('Receipt', filters);
    if (filters.ledger_id) {
      hWhere.receipt_voucher_main = { voucher_ledger_id: filters.ledger_id };
    }

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { receipt_voucher_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
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
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('Contra', filters);
    if (filters.ledger_id) {
      hWhere.contra_voucher_main = { voucher_ledger_id: filters.ledger_id };
    }

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { contra_voucher_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
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
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('Journal', filters);

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { journal_voucher_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
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
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('CreditNote', filters);
    if (filters.ledger_id) {
      hWhere.credit_note_main = { voucher_ledger_id: filters.ledger_id };
    }

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { credit_note_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.credit_note_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`CreditNote #${id} not found`);
    const details = await prisma.credit_note_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 8. Debit Note ────────────────────────────────────────────────────────────

export const DebitNoteReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('DebitNote', filters);
    if (filters.ledger_id) {
      hWhere.debit_note_main = { voucher_ledger_id: filters.ledger_id };
    }

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { debit_note_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.debit_note_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`DebitNote #${id} not found`);
    const details = await prisma.debit_note_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 9. Quotation ─────────────────────────────────────────────────────────────

export const QuotationReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('Quotation', filters);
    const mainFilter: any = {};
    if (filters.ledger_id) mainFilter.voucher_ledger_id = filters.ledger_id;
    if (filters.status) mainFilter.VoucherStatus = filters.status;
    if (Object.keys(mainFilter).length) hWhere.quotation_main = mainFilter;

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { quotation_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.quotation_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`Quotation #${id} not found`);
    const details = await prisma.quotation_details.findMany({ where: { voucher_id: id } });
    const linkages = await prisma.voucherlinkage.findMany({
      where: { OR: [{ source_voucher_id: id }, { target_voucher_id: id }] },
    });
    return { ...main, details, linkages };
  },
};

// ─── 10. SalesOrder ───────────────────────────────────────────────────────────

export const SalesOrderReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('SalesOrder', filters);
    const mainFilter: any = {};
    if (filters.ledger_id) mainFilter.voucher_ledger_id = filters.ledger_id;
    if (filters.status) mainFilter.VoucherStatus = filters.status;
    if (Object.keys(mainFilter).length) hWhere.sales_order_main = mainFilter;

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { sales_order_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.sales_order_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`SalesOrder #${id} not found`);
    const details = await prisma.sales_order_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 11. PurchaseOrder ────────────────────────────────────────────────────────

export const PurchaseOrderReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('PurchaseOrder', filters);
    const mainFilter: any = {};
    if (filters.ledger_id) mainFilter.voucher_ledger_id = filters.ledger_id;
    if (filters.status) mainFilter.VoucherStatus = filters.status;
    if (Object.keys(mainFilter).length) hWhere.purchase_order_main = mainFilter;

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { purchase_order_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.purchase_order_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`PurchaseOrder #${id} not found`);
    const details = await prisma.purchase_order_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 12. DeliveryNote ─────────────────────────────────────────────────────────

export const DeliveryNoteReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('DeliveryNote', filters);

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { delivery_note_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.delivery_note_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`DeliveryNote #${id} not found`);
    const details = await prisma.delivery_note_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 13. ReceiptNote (GRN) ────────────────────────────────────────────────────

export const ReceiptNoteReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('ReceiptNote', filters);

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { receipt_note_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.receipt_note_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`ReceiptNote #${id} not found`);
    const details = await prisma.receipt_note_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 14. GodownTransfer ───────────────────────────────────────────────────────

export const GodownTransferReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('GodownTransfer', filters);

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { godown_tranfer_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.godown_tranfer_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`GodownTransfer #${id} not found`);
    const details = await prisma.godown_transfer_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 15. MaterialIn ───────────────────────────────────────────────────────────

export const MaterialInReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('MaterialIn', filters);

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { material_in_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.material_in_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`MaterialIn #${id} not found`);
    const details = await prisma.material_in_details.findMany({ where: { voucher_id: id } });
    return { ...main, details };
  },
};

// ─── 16. Requirement ──────────────────────────────────────────────────────────

export const RequirementReadService = {
  async list(filters: ListFilters) {
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('Requirement', filters);

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { requirement_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
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
    const { page, limit, skip } = parsePage(filters);
    const hWhere = headerWhere('StockRequest', filters);
    const mainFilter: any = {};
    if (filters.status) mainFilter.VoucherStatus = filters.status;
    if (Object.keys(mainFilter).length) hWhere.stock_request_main = mainFilter;

    const [total, items] = await Promise.all([
      prisma.voucher_headers.count({ where: hWhere }),
      prisma.voucher_headers.findMany({
        where: hWhere,
        include: { stock_request_main: true },
        orderBy: { voucher_date: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: paginateMeta(total, page, limit) };
  },

  async getById(id: number) {
    const main = await prisma.stock_request_main.findUnique({
      where: { id },
      include: { voucher_headers: true },
    });
    if (!main) throw new NotFoundError(`StockRequest #${id} not found`);
    const details = await prisma.stock_request_details.findMany({ where: { voucher_id: id } });
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
