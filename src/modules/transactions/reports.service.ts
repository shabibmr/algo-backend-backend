import { prisma } from '../../core/db/prisma';

function parseFy(fyCode: string): { gte: Date; lte: Date } {
  const [y1, y2short] = fyCode.split('-');
  const y1n = parseInt(y1, 10);
  const y2n = parseInt(`${y1.slice(0, 2)}${y2short}`, 10);
  return { gte: new Date(`${y1n}-04-01`), lte: new Date(`${y2n}-03-31`) };
}

// ── Task 53: Sales Register ───────────────────────────────────────────────────
export const SalesRegisterService = {
  async get(opts: {
    start_date?: Date;
    end_date?: Date;
    financial_year?: string;
    prefix?: string;
    customer_ledger_id?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      start_date,
      end_date,
      financial_year,
      prefix,
      customer_ledger_id,
      page = 1,
      limit = 50,
    } = opts;

    let dateFilter: any = {};
    if (start_date || end_date) {
      dateFilter = {};
      if (start_date) dateFilter.gte = start_date;
      if (end_date) dateFilter.lte = end_date;
    } else if (financial_year) {
      dateFilter = parseFy(financial_year);
    }

    const where: any = {};
    if (Object.keys(dateFilter).length) where.voucher_date = dateFilter;
    if (prefix) where.voucher_prefix = prefix;
    if (customer_ledger_id) where.sales_invoice_main = { voucher_ledger_id: customer_ledger_id };

    const [rows, total] = await Promise.all([
      prisma.voucher_headers.findMany({
        where: { ...where, voucher_type: 'SalesInvoice' },
        include: { sales_invoice_main: true },
        orderBy: { voucher_date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.voucher_headers.count({ where: { ...where, voucher_type: 'SalesInvoice' } }),
    ]);

    return {
      items: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },
};

// ── Task 54: Purchase Register ────────────────────────────────────────────────
export const PurchaseRegisterService = {
  async get(opts: {
    start_date?: Date;
    end_date?: Date;
    financial_year?: string;
    prefix?: string;
    vendor_ledger_id?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      start_date,
      end_date,
      financial_year,
      prefix,
      vendor_ledger_id,
      page = 1,
      limit = 50,
    } = opts;

    let dateFilter: any = {};
    if (start_date || end_date) {
      dateFilter = {};
      if (start_date) dateFilter.gte = start_date;
      if (end_date) dateFilter.lte = end_date;
    } else if (financial_year) {
      dateFilter = parseFy(financial_year);
    }

    const where: any = {};
    if (Object.keys(dateFilter).length) where.voucher_date = dateFilter;
    if (prefix) where.voucher_prefix = prefix;
    if (vendor_ledger_id) where.purchase_invoice_main = { voucher_ledger_id: vendor_ledger_id };

    const [rows, total] = await Promise.all([
      prisma.voucher_headers.findMany({
        where: { ...where, voucher_type: 'PurchaseInvoice' },
        include: { purchase_invoice_main: true },
        orderBy: { voucher_date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.voucher_headers.count({ where: { ...where, voucher_type: 'PurchaseInvoice' } }),
    ]);

    return {
      items: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },
};

// ── Task 55: Stock Summary ────────────────────────────────────────────────────
export const StockSummaryService = {
  async get(opts: { as_of_date?: Date; godown_id?: number; category_id?: number }) {
    const { as_of_date, godown_id, category_id } = opts;

    const where: any = {};
    if (godown_id) where.godown_id = godown_id;
    if (as_of_date) where.posting_date = { lte: as_of_date };

    const rows = await prisma.stock_ledger.groupBy({
      by: ['item_id', 'godown_id'],
      where,
      _sum: { quantity_in: true, quantity_out: true, total_cost: true },
    });

    // Fetch item info for filtering by category
    const itemIds = [...new Set(rows.map((r) => r.item_id))];
    const items = await prisma.sales_inventory_items.findMany({
      where: {
        id: { in: itemIds },
        ...(category_id ? { category_id } : {}),
      },
      select: { id: true, Item_Name: true, category_id: true },
    });
    const itemMap = new Map(items.map((i) => [i.id, i]));

    const summary = rows
      .filter((r) => itemMap.has(r.item_id))
      .map((r) => ({
        item_id: r.item_id,
        item_name: itemMap.get(r.item_id)?.Item_Name,
        godown_id: r.godown_id,
        quantity_in: Number(r._sum.quantity_in ?? 0),
        quantity_out: Number(r._sum.quantity_out ?? 0),
        closing_qty: Number(r._sum.quantity_in ?? 0) - Number(r._sum.quantity_out ?? 0),
      }));

    return summary;
  },
};

// ── Task 56: Stock Valuation ──────────────────────────────────────────────────
export const StockValuationService = {
  async get(opts: { as_of_date?: Date; godown_id?: number }) {
    const { as_of_date, godown_id } = opts;

    const where: any = {};
    if (godown_id) where.godown_id = godown_id;
    if (as_of_date) where.posting_date = { lte: as_of_date };

    const rows = await prisma.stock_ledger.groupBy({
      by: ['item_id', 'godown_id'],
      where,
      _sum: { quantity_in: true, quantity_out: true, total_cost: true },
    });

    const itemIds = [...new Set(rows.map((r) => r.item_id))];
    const items = await prisma.sales_inventory_items.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, Item_Name: true, Price: true, Std_Cost: true },
    });
    const itemMap = new Map(items.map((i) => [i.id, i]));

    const valuation = rows.map((r) => {
      const closingQty = Number(r._sum.quantity_in ?? 0) - Number(r._sum.quantity_out ?? 0);
      const totalCost = Number(r._sum.total_cost ?? 0);
      const avgCost =
        Number(r._sum.quantity_in ?? 0) > 0 ? totalCost / Number(r._sum.quantity_in) : 0;
      return {
        item_id: r.item_id,
        item_name: itemMap.get(r.item_id)?.Item_Name,
        godown_id: r.godown_id,
        closing_qty: closingQty,
        avg_cost: avgCost,
        total_value: closingQty * avgCost,
      };
    });

    return valuation;
  },
};
