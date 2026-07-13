import { prisma } from '../../core/db/prisma';

// ── Task 60: Dashboard Summary ────────────────────────────────────────────────
export const DashboardService = {
  async getSummary(opts: {
    company_id?: number;
    branch_id?: number;
    start_date: Date;
    end_date: Date;
  }) {
    const { start_date, end_date } = opts;
    const dateFilter = { gte: start_date, lte: end_date };

    const [salesCount, purchaseCount, cashAgg, bankAgg, topCustomers] = await Promise.all([
      prisma.voucher_headers.count({
        where: { voucher_type: 'SalesInvoice', voucher_date: dateFilter },
      }),
      prisma.voucher_headers.count({
        where: { voucher_type: 'PurchaseInvoice', voucher_date: dateFilter },
      }),
      prisma.journal_ledger.aggregate({
        where: { posting_date: dateFilter, ledger_master: { Ledger_Type: 'Cash' } },
        _sum: { debit_amount: true, credit_amount: true },
      }),
      prisma.journal_ledger.aggregate({
        where: { posting_date: dateFilter, ledger_master: { Ledger_Type: 'Bank' } },
        _sum: { debit_amount: true, credit_amount: true },
      }),
      prisma.sales_invoice_main.groupBy({
        by: ['voucher_ledger_id'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    const cashNet =
      Number(cashAgg._sum.debit_amount ?? 0) - Number(cashAgg._sum.credit_amount ?? 0);
    const bankNet =
      Number(bankAgg._sum.debit_amount ?? 0) - Number(bankAgg._sum.credit_amount ?? 0);

    return {
      period: { start_date, end_date },
      sales_count: salesCount,
      purchase_count: purchaseCount,
      cash_position: cashNet,
      bank_position: bankNet,
      top_customers: topCustomers,
    };
  },

  async getTrend(opts: { company_id?: number; branch_id?: number; months: number }) {
    const { months } = opts;
    const now = new Date();
    const buckets = Array.from({ length: months }, (_, i) => {
      const offset = months - 1 - i;
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
      return { start, end };
    });

    const points = await Promise.all(
      buckets.map(async ({ start, end }) => {
        const dateFilter = { gte: start, lte: end };
        const [salesCount, purchaseCount, cashAgg, bankAgg] = await Promise.all([
          prisma.voucher_headers.count({
            where: { voucher_type: 'SalesInvoice', voucher_date: dateFilter },
          }),
          prisma.voucher_headers.count({
            where: { voucher_type: 'PurchaseInvoice', voucher_date: dateFilter },
          }),
          prisma.journal_ledger.aggregate({
            where: { posting_date: dateFilter, ledger_master: { Ledger_Type: 'Cash' } },
            _sum: { debit_amount: true, credit_amount: true },
          }),
          prisma.journal_ledger.aggregate({
            where: { posting_date: dateFilter, ledger_master: { Ledger_Type: 'Bank' } },
            _sum: { debit_amount: true, credit_amount: true },
          }),
        ]);

        const cashNet =
          Number(cashAgg._sum.debit_amount ?? 0) - Number(cashAgg._sum.credit_amount ?? 0);
        const bankNet =
          Number(bankAgg._sum.debit_amount ?? 0) - Number(bankAgg._sum.credit_amount ?? 0);

        return {
          month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
          sales_count: salesCount,
          purchase_count: purchaseCount,
          cash_position: cashNet,
          bank_position: bankNet,
        };
      }),
    );

    return { points };
  },
};

// ── Task 61: Alerts service ───────────────────────────────────────────────────
export const AlertsService = {
  async getAlerts() {
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 86400000);

    const [expiringDocs, overdueBills] = await Promise.all([
      prisma.employeedocuments.findMany({
        where: { expiry_date: { gte: today, lte: in30Days } },
        include: { employee_details: { select: { Name: true, employee_code: true } } },
        orderBy: { expiry_date: 'asc' },
      }),
      prisma.billwise_records.findMany({
        where: { RefType: 'New Ref', Due_Date: { lt: today } },
        orderBy: { Due_Date: 'asc' },
        take: 50,
      }),
    ]);

    return {
      expiring_documents: expiringDocs.map((d) => ({
        type: 'document_expiry',
        employee: d.employee_details,
        doc_type: d.doc_type,
        expiry_date: d.expiry_date,
        days_until_expiry: d.expiry_date
          ? Math.ceil((new Date(d.expiry_date).getTime() - today.getTime()) / 86400000)
          : null,
      })),
      overdue_bills: overdueBills.map((b) => ({
        type: 'overdue_bill',
        ledger_id: b.LedgerID,
        ref_no: b.RefNo,
        voucher_no: b.VoucherNo,
        due_date: b.Due_Date,
        amount: Number(b.DebitAmount ?? 0) + Number(b.CreditAmount ?? 0),
      })),
    };
  },
};

// ── Task 62: Global Search ────────────────────────────────────────────────────
export const GlobalSearchService = {
  async search(query: string) {
    if (!query || query.trim().length < 2)
      return { ledgers: [], items: [], contacts: [], vouchers: [] };

    const q = query.trim();
    const [ledgers, items, contacts, vouchers] = await Promise.all([
      prisma.ledger_master.findMany({
        where: {
          is_active: true,
          OR: [{ Ledger_Name: { contains: q } }, { ledger_code: { contains: q } }],
        },
        select: { id: true, Ledger_Name: true, Ledger_Type: true, ledger_code: true },
        take: 10,
      }),
      prisma.sales_inventory_items.findMany({
        where: {
          is_active: true,
          OR: [{ Item_Name: { contains: q } }, { Item_Code: { contains: q } }],
        },
        select: { id: true, Item_Name: true, Item_Code: true },
        take: 10,
      }),
      prisma.address_book.findMany({
        where: {
          OR: [
            { Name: { contains: q } },
            { Phone_Number: { contains: q } },
            { Email: { contains: q } },
          ],
        },
        select: { id: true, Name: true, Phone_Number: true, Email: true, contact_type: true },
        take: 10,
      }),
      prisma.voucher_headers.findMany({
        where: { voucher_no: { contains: q } },
        select: {
          id: true,
          voucher_no: true,
          voucher_type: true,
          voucher_prefix: true,
          voucher_date: true,
        },
        orderBy: { voucher_date: 'desc' },
        take: 10,
      }),
    ]);

    return { ledgers, items, contacts, vouchers };
  },
};

// ── Task 63: VAT/Tax Return Report ───────────────────────────────────────────
export const VatReturnService = {
  async getReport(period: string) {
    let start: Date, end: Date;
    if (period.includes('-Q')) {
      const [year, q] = period.split('-Q');
      const yearN = parseInt(year, 10);
      const qN = parseInt(q, 10);
      const startMonth = (qN - 1) * 3;
      start = new Date(yearN, startMonth, 1);
      end = new Date(yearN, startMonth + 3, 0);
    } else {
      const [year, mon] = period.split('-').map(Number);
      start = new Date(year, mon - 1, 1);
      end = new Date(year, mon, 0);
    }
    const dateFilter = { gte: start, lte: end };

    const [salesMains, purchaseMains] = await Promise.all([
      prisma.sales_invoice_main.findMany({
        where: { voucher_headers: { voucher_date: dateFilter } },
        select: { id: true, Vat_Amount: true, Total: true, Gross_Total: true },
      }),
      prisma.purchase_invoice_main.findMany({
        where: { voucher_headers: { voucher_date: dateFilter } },
        select: { id: true, Vat_Amount: true, Total: true },
      }),
    ]);

    const outputTax = salesMains.reduce((s, h) => s + Number(h.Vat_Amount ?? 0), 0);
    const inputTax = purchaseMains.reduce((s, h) => s + Number(h.Vat_Amount ?? 0), 0);
    const salesValue = salesMains.reduce((s, h) => s + Number(h.Total ?? 0), 0);
    const purchaseValue = purchaseMains.reduce((s, h) => s + Number(h.Total ?? 0), 0);

    return {
      period,
      start_date: start,
      end_date: end,
      sales_invoices: salesMains.length,
      purchase_invoices: purchaseMains.length,
      total_sales_value: salesValue,
      total_purchase_value: purchaseValue,
      output_tax: outputTax,
      input_tax: inputTax,
      net_vat_payable: outputTax - inputTax,
    };
  },
};
