import { prisma } from '../../core/db/prisma';
import { TransactionHelperService } from './transactionHelper.service';
import { ConfigSettingService } from '../../core/services/ConfigSettingService';
import { ValidationError, NotFoundError } from '../../core/errors/AppError';
import { toDecimal, add, sub, mul, round, sum } from '../../core/utils/decimal';
import { auditService } from '../../core/audit/auditService';
import { Prisma } from '@prisma/client';
import { StockLedgerService } from '../inventory/inventory.service';

export interface SalesInvoiceLineInput {
  item_id: number;
  sku_id?: number | null;
  batch_id?: number | null;
  quantity: number;
  price: number;
  discount_percent?: number;
  tax_rate?: number;
}

export interface SalesInvoiceInput {
  voucher_prefix: string;
  voucher_date: string;
  financial_year: string; // e.g. "2025-26"
  customer_ledger_id: number;
  godown_id: number;
  salesperson_employee_id?: number | null;
  voucher_project_id?: number | null;
  billing_name?: string | null;
  narration?: string | null;
  credit_days?: number;
  lines: SalesInvoiceLineInput[];
  source_voucher_id?: number | null;
  source_voucher_type?: string | null;
}

export interface PurchaseInvoiceInput {
  voucher_prefix: string;
  voucher_date: string;
  financial_year: string;
  supplier_ledger_id: number;
  godown_id: number;
  salesperson_employee_id?: number | null;
  voucher_project_id?: number | null;
  billing_name?: string | null;
  narration?: string | null;
  credit_days?: number;
  lines: SalesInvoiceLineInput[];
}

export interface CashBankVoucherLineInput {
  ledger_id: number;
  amount: number;
  narration?: string | null;
}

export interface CashBankVoucherInput {
  voucher_prefix: string;
  voucher_date: string;
  financial_year: string;
  cash_bank_ledger_id: number;
  narration?: string | null;
  lines: CashBankVoucherLineInput[];
}

export interface ContraVoucherLineInput {
  ledger_id: number;
  amount: number;
  type: 'DR' | 'CR';
  narration?: string | null;
}

export interface ContraVoucherInput {
  voucher_prefix: string;
  voucher_date: string;
  financial_year: string;
  narration?: string | null;
  lines: ContraVoucherLineInput[];
}

export interface JournalVoucherLineInput {
  ledger_id: number;
  debit_amount?: number;
  credit_amount?: number;
  narration?: string | null;
}

export interface JournalVoucherInput {
  voucher_prefix: string;
  voucher_date: string;
  financial_year: string;
  narration?: string | null;
  lines: JournalVoucherLineInput[];
}

export interface NoteVoucherInput {
  voucher_prefix: string;
  voucher_date: string;
  financial_year: string;
  ledger_id: number;
  godown_id: number;
  billing_name?: string | null;
  narration?: string | null;
  lines: SalesInvoiceLineInput[];
  return_against_id?: number | null;
}

// Helper: check if a financial year is Closed or Locked
export async function assertFyNotLocked(fyCode: string) {
  const fy = await prisma.financialyear.findFirst({
    where: { fy_code: fyCode },
  });
  if (fy && (fy.status === 'Locked' || fy.status === 'Closed')) {
    throw new ValidationError(`Period locked: ${fyCode} (status: ${fy.status})`);
  }
}

// Helper: check FY lock by date (for cancel/edit where we only have the date)
export async function assertDateNotInLockedFY(voucherDate: Date) {
  const fy = await prisma.financialyear.findFirst({
    where: {
      start_date: { lte: voucherDate },
      end_date: { gte: voucherDate },
    },
  });
  if (fy && (fy.status === 'Locked' || fy.status === 'Closed')) {
    throw new ValidationError(`Period locked: ${fy.fy_code} (status: ${fy.status})`);
  }
}

// Helper: assert credit limit not exceeded for a ledger (task 22)
export async function assertCreditLimitOk(ledgerId: number, newAmount: number, tx?: any) {
  const bypass = await ConfigSettingService.get('SKIP_CREDIT_LIMIT_CHECK', false);
  if (bypass) return;

  const settings = await (tx || prisma).ledger_credit_settings.findUnique({
    where: { ledger_id: ledgerId },
  });
  if (!settings?.credit_limit) return; // no limit set

  const limit = Number(settings.credit_limit);

  // Outstanding = Σ DebitAmount - Σ CreditAmount for this ledger
  const rows = await (tx || prisma).billwise_records.findMany({
    where: { LedgerID: String(ledgerId) },
    select: { DebitAmount: true, CreditAmount: true },
  });

  const outstanding = rows.reduce(
    (s: number, r: { DebitAmount: number | null; CreditAmount: number | null }) =>
      s + (r.DebitAmount || 0) - (r.CreditAmount || 0),
    0,
  );

  if (outstanding + newAmount > limit) {
    throw new ValidationError(
      `Credit limit exceeded for ledger ${ledgerId}: outstanding ${outstanding.toFixed(2)} + new ${newAmount.toFixed(2)} > limit ${limit.toFixed(2)}`,
    );
  }
}

export const VoucherPostingService = {
  /**
   * Transactional posting of a Sales Invoice.
   * Performs validation, numbering, header/detail insert, GL double-entry posting,
   * inventory stock posting, billwise record creation, and audit logging.
   */
  async postSalesInvoice(payload: SalesInvoiceInput, username: string, userId?: number) {
    const user = username || 'system';

    // ── Guard 1: Financial Year Lock Check ──────────────────────
    await assertFyNotLocked(payload.financial_year);

    // ── Guard 2: Credit Limit Check ────────────────────────────
    const invoiceTotal = payload.lines.reduce((s, l) => s + l.quantity * l.price, 0);
    await assertCreditLimitOk(payload.customer_ledger_id, invoiceTotal);

    // ── Guard 3: Discount Limits Check ─────────────────────────
    const maxDiscount = await ConfigSettingService.getMaxDiscountPercent();
    for (const line of payload.lines) {
      if (line.discount_percent && line.discount_percent > maxDiscount) {
        throw new ValidationError(
          `Discount percent (${line.discount_percent}%) exceeds maximum allowed discount (${maxDiscount}%)`,
        );
      }
    }

    // Execute in a single interactive transaction
    return prisma.$transaction(async (tx) => {
      // Resolve Customer Ledger
      const customerLedger = await tx.ledger_master.findUnique({
        where: { id: payload.customer_ledger_id },
      });
      if (!customerLedger) {
        throw new NotFoundError(`Customer ledger with ID ${payload.customer_ledger_id} not found`);
      }

      // Generate Voucher Number
      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'SalesInvoice',
        payload.voucher_prefix,
        payload.financial_year,
      );

      // Create VoucherHeader
      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'SalesInvoice',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      // Calculate line totals and grand totals
      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const linesToInsert = [];

      for (const line of payload.lines) {
        if (payload.status !== 'Draft') {
          await StockLedgerService.assertStockAvailable(line.item_id, payload.godown_id, line.quantity);
        }
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        linesToInsert.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      // Create SalesInvoiceMain
      await tx.sales_invoice_main.create({
        data: {
          id: header.id,
          godown_id: payload.godown_id,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          voucher_ledger_id: payload.customer_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || customerLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: payload.status === 'Draft' ? 'Draft' : 'Posted',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
          PaymentSplit: false,
        },
      });

      // Create Detail Lines
      await tx.sales_invoice_details.createMany({
        data: linesToInsert,
      });

      if (payload.status !== 'Draft') {
        // ── Double-Entry GL Posting ──────────────────────────────
        // Resolve Sales and Tax Ledgers
        const salesLedgerId = await ConfigSettingService.get('SALES_LEDGER_ID', 2); // standard sales account
        const taxLedgerId = await ConfigSettingService.get('TAX_LEDGER_ID', 3); // standard Output VAT account

        // Balanced ledger entries:
        // 1. Debit Customer (Gross Total)
        const customerLedgerEntry = {
          voucher_header_id: header.id,
          ledger_id: payload.customer_ledger_id,
          debit_amount: grossTotal,
          credit_amount: toDecimal(0),
          posting_date: new Date(payload.voucher_date),
          narration: payload.narration || `Sales Invoice ${voucherNo}`,
        };

        // 2. Credit Sales (Gross Total - VAT)
        const salesLedgerEntry = {
          voucher_header_id: header.id,
          ledger_id: salesLedgerId,
          debit_amount: toDecimal(0),
          credit_amount: sub(grossTotal, taxSum),
          posting_date: new Date(payload.voucher_date),
          narration: payload.narration || `Sales Sales Invoice ${voucherNo}`,
        };

        // Create transactions array
        const journalEntries = [customerLedgerEntry, salesLedgerEntry];

        // 3. Credit VAT (if VAT > 0)
        if (taxSum.greaterThan(0)) {
          journalEntries.push({
            voucher_header_id: header.id,
            ledger_id: taxLedgerId,
            debit_amount: toDecimal(0),
            credit_amount: taxSum,
            posting_date: new Date(payload.voucher_date),
            narration: `Output VAT @ ${payload.lines[0]?.tax_rate || 5}% for ${voucherNo}`,
          });
        }

        // Assert double entry balance (Σdebit == Σcredit)
        const sumDebits = sum(journalEntries.map((e) => e.debit_amount));
        const sumCredits = sum(journalEntries.map((e) => e.credit_amount));
        if (!sumDebits.equals(sumCredits)) {
          throw new ValidationError(
            `Double entry imbalance: Debits (${sumDebits}) != Credits (${sumCredits})`,
          );
        }

        // Insert Journal Entries
        await tx.journal_ledger.createMany({
          data: journalEntries.map((e) => ({
            voucher_header_id: e.voucher_header_id,
            ledger_id: e.ledger_id,
            debit_amount: e.debit_amount,
            credit_amount: e.credit_amount,
            posting_date: e.posting_date,
            narration: e.narration,
          })),
        });

        // ── Inventory Stock Posting ──────────────────────────────
        const stockLedgerEntries = [];
        for (const line of payload.lines) {
          stockLedgerEntries.push({
            voucher_header_id: header.id,
            item_id: line.item_id,
            sku_id: line.sku_id || null,
            batch_id: line.batch_id || null,
            godown_id: payload.godown_id,
            quantity_in: new Prisma.Decimal(0),
            quantity_out: new Prisma.Decimal(line.quantity),
            unit_cost: new Prisma.Decimal(line.price),
            total_cost: new Prisma.Decimal(line.quantity * line.price),
            posting_date: new Date(payload.voucher_date),
          });
        }

        await tx.stock_ledger.createMany({
          data: stockLedgerEntries,
        });

        // ── Billwise Record (New Ref) ─────────────────────────────
        await tx.billwise_records.create({
          data: {
            voucherPrefix: payload.voucher_prefix,
            VoucherType: 'SalesInvoice',
            VoucherNo: voucherNo,
            LedgerID: String(payload.customer_ledger_id),
            RefType: 'New Ref',
            RefNo: voucherNo,
            RefPrefix: payload.voucher_prefix,
            DebitAmount: grossTotal.toNumber(),
            CreditAmount: 0,
            VoucherDate: new Date(payload.voucher_date),
            Due_Date: new Date(
              new Date(payload.voucher_date).getTime() +
                (payload.credit_days || 30) * 24 * 60 * 60 * 1000,
            ),
          },
        });
      }

      if (payload.source_voucher_id) {
        await tx.voucherlinkage.create({
          data: {
            source_voucher_id: payload.source_voucher_id,
            target_voucher_id: header.id,
            link_type: 'Conversion',
            added_by: user,
            narration: `Converted from ${payload.source_voucher_type || 'Voucher'} ${payload.source_voucher_id}`,
          },
        });
      }

      // Audit row
      await auditService.log(
        'APPROVE',
        'SUCCESS',
        { voucherNo, total: grossTotal.toNumber(), message: 'Sales Invoice Posted successfully' },
        userId || user,
        tx,
      );

      return {
        id: header.id,
        voucherNo,
        total: grossTotal.toNumber(),
        subtotal: subtotalSum.toNumber(),
        discount: discountSum.toNumber(),
        vat: taxSum.toNumber(),
      };
    });
  },

  /**
   * Book GL + stock + billwise for an existing Sales Invoice that was saved as
   * Draft (or Approved without posting). Idempotent: no-ops if journal rows
   * already exist for this voucher_header_id.
   *
   * Used by VoucherApprovalService when advancing Draft/Approved → Posted.
   */
  async bookSalesInvoiceIfUnposted(
    tx: Prisma.TransactionClient,
    id: number,
    user: string,
  ): Promise<{ booked: boolean }> {
    const existingJl = await tx.journal_ledger.count({
      where: { voucher_header_id: id },
    });
    if (existingJl > 0) {
      return { booked: false };
    }

    const main = await tx.sales_invoice_main.findUnique({ where: { id } });
    if (!main) {
      throw new NotFoundError(`SalesInvoice #${id} not found`);
    }
    const header = await tx.voucher_headers.findUnique({ where: { id } });
    if (!header) {
      throw new NotFoundError(`Voucher header #${id} not found`);
    }
    const details = await tx.sales_invoice_details.findMany({
      where: { voucher_id: id },
    });
    if (!details.length) {
      throw new ValidationError('Cannot post Sales Invoice with no lines');
    }

    await assertDateNotInLockedFY(header.voucher_date);

    const godownId = main.godown_id;
    const customerLedgerId = main.voucher_ledger_id;
    if (!godownId || !customerLedgerId) {
      throw new ValidationError(
        'Sales Invoice is missing godown_id or voucher_ledger_id; cannot book',
      );
    }

    const grossTotal = toDecimal(main.Gross_Total ?? main.Total ?? 0);
    const taxSum = toDecimal(main.Vat_Amount ?? 0);
    const voucherNo =
      main.Voucher_No_Display ||
      `${header.voucher_prefix}${header.voucher_no}`;
    const voucherDate = header.voucher_date;
    const narration = main.Narration || `Sales Invoice ${voucherNo}`;

    // Stock availability
    for (const line of details) {
      if (line.item_id != null && line.Quantity != null) {
        await StockLedgerService.assertStockAvailable(
          line.item_id,
          godownId,
          Number(line.Quantity),
        );
      }
    }

    await assertCreditLimitOk(customerLedgerId, Number(grossTotal), tx);

    const salesLedgerId = await ConfigSettingService.get('SALES_LEDGER_ID', 2);
    const taxLedgerId = await ConfigSettingService.get('TAX_LEDGER_ID', 3);

    const journalEntries: Array<{
      voucher_header_id: number;
      ledger_id: number;
      debit_amount: Prisma.Decimal;
      credit_amount: Prisma.Decimal;
      posting_date: Date;
      narration: string;
    }> = [
      {
        voucher_header_id: id,
        ledger_id: customerLedgerId,
        debit_amount: grossTotal as any,
        credit_amount: toDecimal(0) as any,
        posting_date: voucherDate,
        narration,
      },
      {
        voucher_header_id: id,
        ledger_id: salesLedgerId,
        debit_amount: toDecimal(0) as any,
        credit_amount: sub(grossTotal, taxSum) as any,
        posting_date: voucherDate,
        narration: `Sales ${voucherNo}`,
      },
    ];

    if (taxSum.greaterThan(0)) {
      journalEntries.push({
        voucher_header_id: id,
        ledger_id: taxLedgerId,
        debit_amount: toDecimal(0) as any,
        credit_amount: taxSum as any,
        posting_date: voucherDate,
        narration: `Output VAT for ${voucherNo}`,
      });
    }

    const sumDebits = sum(journalEntries.map((e) => e.debit_amount));
    const sumCredits = sum(journalEntries.map((e) => e.credit_amount));
    if (!sumDebits.equals(sumCredits)) {
      throw new ValidationError(
        `Double entry imbalance: Debits (${sumDebits}) != Credits (${sumCredits})`,
      );
    }

    await tx.journal_ledger.createMany({
      data: journalEntries.map((e) => ({
        voucher_header_id: e.voucher_header_id,
        ledger_id: e.ledger_id,
        debit_amount: e.debit_amount,
        credit_amount: e.credit_amount,
        posting_date: e.posting_date,
        narration: e.narration,
      })),
    });

    await tx.stock_ledger.createMany({
      data: details
        .filter((line) => line.item_id != null)
        .map((line) => ({
          voucher_header_id: id,
          item_id: line.item_id!,
          sku_id: line.voucher_sku_id || null,
          godown_id: godownId,
          quantity_in: new Prisma.Decimal(0),
          quantity_out: new Prisma.Decimal(Number(line.Quantity) || 0),
          unit_cost: new Prisma.Decimal(Number(line.Price) || 0),
          total_cost: new Prisma.Decimal(
            (Number(line.Quantity) || 0) * (Number(line.Price) || 0),
          ),
          posting_date: voucherDate,
        })),
    });

    const existingBill = await tx.billwise_records.findFirst({
      where: {
        VoucherType: 'SalesInvoice',
        VoucherNo: header.voucher_no,
        voucherPrefix: header.voucher_prefix,
      },
    });
    if (!existingBill) {
      await tx.billwise_records.create({
        data: {
          voucherPrefix: header.voucher_prefix,
          VoucherType: 'SalesInvoice',
          VoucherNo: header.voucher_no,
          LedgerID: String(customerLedgerId),
          RefType: 'New Ref',
          RefNo: header.voucher_no,
          RefPrefix: header.voucher_prefix,
          DebitAmount: Number(grossTotal),
          CreditAmount: 0,
          VoucherDate: voucherDate,
          Due_Date: new Date(voucherDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    await auditService.log(
      'APPROVE',
      'SUCCESS',
      {
        voucherNo,
        total: Number(grossTotal),
        message: 'Sales Invoice booked on approve (Draft→Posted)',
        id,
        user,
      },
      user,
      tx,
    );

    return { booked: true };
  },

  /**
   * Transactional posting of a Purchase Invoice.
   */
  async postPurchaseInvoice(payload: PurchaseInvoiceInput, username: string, userId?: number) {
    const user = username || 'system';

    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      // Resolve Supplier Ledger
      const supplierLedger = await tx.ledger_master.findUnique({
        where: { id: payload.supplier_ledger_id },
      });
      if (!supplierLedger) {
        throw new NotFoundError(`Supplier ledger with ID ${payload.supplier_ledger_id} not found`);
      }

      // Generate Voucher Number
      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'PurchaseInvoice',
        payload.voucher_prefix,
        payload.financial_year,
      );

      // Create VoucherHeader
      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'PurchaseInvoice',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      // Calculate line totals and grand totals
      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const linesToInsert = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        linesToInsert.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      // Create PurchaseInvoiceMain
      await tx.purchase_invoice_main.create({
        data: {
          id: header.id,
          godown_id: payload.godown_id,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          voucher_ledger_id: payload.supplier_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || supplierLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: 'Posted',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
        },
      });

      // Create Detail Lines
      await tx.purchase_invoice_details.createMany({
        data: linesToInsert,
      });

      // Resolve Purchase and Input VAT Ledgers
      const purchaseLedgerId = await ConfigSettingService.get('PURCHASE_LEDGER_ID', 5); // default purchase account
      const inputTaxLedgerId = await ConfigSettingService.get('INPUT_TAX_LEDGER_ID', 6); // default Input VAT account

      // Balanced ledger entries:
      // 1. Credit Supplier (Gross Total)
      const supplierLedgerEntry = {
        voucher_header_id: header.id,
        ledger_id: payload.supplier_ledger_id,
        debit_amount: toDecimal(0),
        credit_amount: grossTotal,
        posting_date: new Date(payload.voucher_date),
        narration: payload.narration || `Purchase Invoice ${voucherNo}`,
      };

      // 2. Debit Purchase (Gross Total - VAT)
      const purchaseLedgerEntry = {
        voucher_header_id: header.id,
        ledger_id: purchaseLedgerId,
        debit_amount: sub(grossTotal, taxSum),
        credit_amount: toDecimal(0),
        posting_date: new Date(payload.voucher_date),
        narration: payload.narration || `Purchase Purchase Invoice ${voucherNo}`,
      };

      const journalEntries = [supplierLedgerEntry, purchaseLedgerEntry];

      // 3. Debit VAT (if VAT > 0)
      if (taxSum.greaterThan(0)) {
        journalEntries.push({
          voucher_header_id: header.id,
          ledger_id: inputTaxLedgerId,
          debit_amount: taxSum,
          credit_amount: toDecimal(0),
          posting_date: new Date(payload.voucher_date),
          narration: `Input VAT @ ${payload.lines[0]?.tax_rate || 5}% for ${voucherNo}`,
        });
      }

      // Assert double entry balance (Σdebit == Σcredit)
      const sumDebits = sum(journalEntries.map((e) => e.debit_amount));
      const sumCredits = sum(journalEntries.map((e) => e.credit_amount));
      if (!sumDebits.equals(sumCredits)) {
        throw new ValidationError(
          `Double entry imbalance: Debits (${sumDebits}) != Credits (${sumCredits})`,
        );
      }

      // Insert Journal Entries
      await tx.journal_ledger.createMany({
        data: journalEntries.map((e) => ({
          voucher_header_id: e.voucher_header_id,
          ledger_id: e.ledger_id,
          debit_amount: e.debit_amount,
          credit_amount: e.credit_amount,
          posting_date: e.posting_date,
          narration: e.narration,
        })),
      });

      // ── Inventory Stock Posting (Quantity In) ──────────────────
      const stockLedgerEntries = [];
      for (const line of payload.lines) {
        stockLedgerEntries.push({
          voucher_header_id: header.id,
          item_id: line.item_id,
          sku_id: line.sku_id || null,
          godown_id: payload.godown_id,
          quantity_in: new Prisma.Decimal(line.quantity),
          quantity_out: new Prisma.Decimal(0),
          unit_cost: new Prisma.Decimal(line.price),
          total_cost: new Prisma.Decimal(line.quantity * line.price),
          posting_date: new Date(payload.voucher_date),
        });
      }

      await tx.stock_ledger.createMany({
        data: stockLedgerEntries,
      });

      // ── Billwise Record (New Ref) ─────────────────────────────
      await tx.billwise_records.create({
        data: {
          voucherPrefix: payload.voucher_prefix,
          VoucherType: 'PurchaseInvoice',
          VoucherNo: voucherNo,
          LedgerID: String(payload.supplier_ledger_id),
          RefType: 'New Ref',
          RefNo: voucherNo,
          RefPrefix: payload.voucher_prefix,
          DebitAmount: 0,
          CreditAmount: grossTotal.toNumber(),
          VoucherDate: new Date(payload.voucher_date),
          Due_Date: new Date(
            new Date(payload.voucher_date).getTime() +
              (payload.credit_days || 30) * 24 * 60 * 60 * 1000,
          ),
        },
      });

      await auditService.log(
        'APPROVE',
        'SUCCESS',
        {
          voucherNo,
          total: grossTotal.toNumber(),
          message: 'Purchase Invoice Posted successfully',
        },
        userId || user,
        tx,
      );

      return {
        id: header.id,
        voucherNo,
        total: grossTotal.toNumber(),
      };
    });
  },

  /**
   * Transactional posting of a Payment Voucher.
   */
  async postPaymentVoucher(payload: CashBankVoucherInput, username: string, userId?: number) {
    const user = username || 'system';

    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const bankLedger = await tx.ledger_master.findUnique({
        where: { id: payload.cash_bank_ledger_id },
      });
      if (!bankLedger) {
        throw new NotFoundError(
          `Cash/Bank ledger with ID ${payload.cash_bank_ledger_id} not found`,
        );
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'Payment',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'Payment',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let totalAmount = toDecimal(0);
      const linesToInsert = [];
      const journalEntries = [];

      for (const line of payload.lines) {
        const amt = toDecimal(line.amount);
        totalAmount = add(totalAmount, amt);

        linesToInsert.push({
          voucher_id: header.id,
          voucher_ledger_id: line.ledger_id,
          Amount: line.amount,
          Dr_Amount: line.amount,
          Cr_Amount: 0,
          Narration: line.narration || '',
        });

        // GL Debit Line Ledger (paying supplier/expense)
        journalEntries.push({
          voucher_header_id: header.id,
          ledger_id: line.ledger_id,
          debit_amount: amt,
          credit_amount: toDecimal(0),
          posting_date: new Date(payload.voucher_date),
          narration: line.narration || payload.narration || `Payment to ledger ${line.ledger_id}`,
        });

        // Billwise Adjustment (Against Ref)
        await tx.billwise_records.create({
          data: {
            voucherPrefix: payload.voucher_prefix,
            VoucherType: 'Payment',
            VoucherNo: voucherNo,
            LedgerID: String(line.ledger_id),
            RefType: 'Against Ref',
            RefNo: voucherNo,
            RefPrefix: payload.voucher_prefix,
            DebitAmount: line.amount,
            CreditAmount: 0,
            VoucherDate: new Date(payload.voucher_date),
          },
        });
      }

      // GL Credit Cash/Bank Ledger (payment source)
      journalEntries.push({
        voucher_header_id: header.id,
        ledger_id: payload.cash_bank_ledger_id,
        debit_amount: toDecimal(0),
        credit_amount: totalAmount,
        posting_date: new Date(payload.voucher_date),
        narration: payload.narration || `Cash/Bank Payment ${voucherNo}`,
      });

      // Assert double entry balance (Σdebit == Σcredit)
      const sumDebits = sum(journalEntries.map((e) => e.debit_amount));
      const sumCredits = sum(journalEntries.map((e) => e.credit_amount));
      if (!sumDebits.equals(sumCredits)) {
        throw new ValidationError(
          `Double entry imbalance: Debits (${sumDebits}) != Credits (${sumCredits})`,
        );
      }

      await tx.payment_voucher_main.create({
        data: {
          id: header.id,
          voucher_ledger_id: payload.cash_bank_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Total: totalAmount.toNumber(),
          Narration: payload.narration || '',
          Added_By: user,
          VoucherStatus: 'Posted',
          Voucher_No_Display: voucherNo,
          Round_Off: 0,
          Gross_Total: totalAmount.toNumber(),
        },
      });

      await tx.payment_voucher_details.createMany({
        data: linesToInsert,
      });

      await tx.journal_ledger.createMany({
        data: journalEntries.map((e) => ({
          voucher_header_id: e.voucher_header_id,
          ledger_id: e.ledger_id,
          debit_amount: e.debit_amount,
          credit_amount: e.credit_amount,
          posting_date: e.posting_date,
          narration: e.narration,
        })),
      });

      await auditService.log(
        'APPROVE',
        'SUCCESS',
        {
          voucherNo,
          total: totalAmount.toNumber(),
          message: 'Payment Voucher Posted successfully',
        },
        userId || user,
        tx,
      );

      return {
        id: header.id,
        voucherNo,
        total: totalAmount.toNumber(),
      };
    });
  },

  /**
   * Transactional posting of a Receipt Voucher.
   */
  async postReceiptVoucher(payload: CashBankVoucherInput, username: string, userId?: number) {
    const user = username || 'system';

    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const bankLedger = await tx.ledger_master.findUnique({
        where: { id: payload.cash_bank_ledger_id },
      });
      if (!bankLedger) {
        throw new NotFoundError(
          `Cash/Bank ledger with ID ${payload.cash_bank_ledger_id} not found`,
        );
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'Receipt',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'Receipt',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let totalAmount = toDecimal(0);
      const linesToInsert = [];
      const journalEntries = [];

      for (const line of payload.lines) {
        const amt = toDecimal(line.amount);
        totalAmount = add(totalAmount, amt);

        linesToInsert.push({
          voucher_id: header.id,
          voucher_ledger_id: line.ledger_id,
          Amount: line.amount,
          Dr_Amount: 0,
          Cr_Amount: line.amount,
          narration: line.narration || '',
        });

        // GL Credit Line Ledger (received from debtor)
        journalEntries.push({
          voucher_header_id: header.id,
          ledger_id: line.ledger_id,
          debit_amount: toDecimal(0),
          credit_amount: amt,
          posting_date: new Date(payload.voucher_date),
          narration: line.narration || payload.narration || `Receipt from ledger ${line.ledger_id}`,
        });

        // Billwise Adjustment (Against Ref)
        await tx.billwise_records.create({
          data: {
            voucherPrefix: payload.voucher_prefix,
            VoucherType: 'Receipt',
            VoucherNo: voucherNo,
            LedgerID: String(line.ledger_id),
            RefType: 'Against Ref',
            RefNo: voucherNo,
            RefPrefix: payload.voucher_prefix,
            DebitAmount: 0,
            CreditAmount: line.amount,
            VoucherDate: new Date(payload.voucher_date),
          },
        });
      }

      // GL Debit Cash/Bank Ledger (receipt destination)
      journalEntries.push({
        voucher_header_id: header.id,
        ledger_id: payload.cash_bank_ledger_id,
        debit_amount: totalAmount,
        credit_amount: toDecimal(0),
        posting_date: new Date(payload.voucher_date),
        narration: payload.narration || `Cash/Bank Receipt ${voucherNo}`,
      });

      // Assert double entry balance (Σdebit == Σcredit)
      const sumDebits = sum(journalEntries.map((e) => e.debit_amount));
      const sumCredits = sum(journalEntries.map((e) => e.credit_amount));
      if (!sumDebits.equals(sumCredits)) {
        throw new ValidationError(
          `Double entry imbalance: Debits (${sumDebits}) != Credits (${sumCredits})`,
        );
      }

      await tx.receipt_voucher_main.create({
        data: {
          id: header.id,
          voucher_ledger_id: payload.cash_bank_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Total: totalAmount.toNumber(),
          narration: payload.narration || '',
          Added_By: user,
          VoucherStatus: 'Posted',
          Voucher_No_Display: voucherNo,
          Round_Off: 0,
          Gross_Total: totalAmount.toNumber(),
        },
      });

      await tx.receipt_voucher_details.createMany({
        data: linesToInsert,
      });

      await tx.journal_ledger.createMany({
        data: journalEntries.map((e) => ({
          voucher_header_id: e.voucher_header_id,
          ledger_id: e.ledger_id,
          debit_amount: e.debit_amount,
          credit_amount: e.credit_amount,
          posting_date: e.posting_date,
          narration: e.narration,
        })),
      });

      await auditService.log(
        'APPROVE',
        'SUCCESS',
        {
          voucherNo,
          total: totalAmount.toNumber(),
          message: 'Receipt Voucher Posted successfully',
        },
        userId || user,
        tx,
      );

      return {
        id: header.id,
        voucherNo,
        total: totalAmount.toNumber(),
      };
    });
  },

  /**
   * Transactional posting of a Contra Voucher.
   */
  async postContraVoucher(payload: ContraVoucherInput, username: string, userId?: number) {
    const user = username || 'system';

    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'Contra',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'Contra',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let totalDr = toDecimal(0);
      let totalCr = toDecimal(0);
      const linesToInsert = [];
      const journalEntries = [];

      for (const line of payload.lines) {
        const amt = toDecimal(line.amount);
        const isDr = line.type === 'DR';

        if (isDr) {
          totalDr = add(totalDr, amt);
        } else {
          totalCr = add(totalCr, amt);
        }

        linesToInsert.push({
          voucher_id: header.id,
          voucher_ledger_id: line.ledger_id,
          Amount: line.amount,
          Dr_Amount: isDr ? line.amount : 0,
          Cr_Amount: isDr ? 0 : line.amount,
          Narration: line.narration || '',
        });

        journalEntries.push({
          voucher_header_id: header.id,
          ledger_id: line.ledger_id,
          debit_amount: isDr ? amt : toDecimal(0),
          credit_amount: isDr ? toDecimal(0) : amt,
          posting_date: new Date(payload.voucher_date),
          narration: line.narration || payload.narration || `Contra ledger ${line.ledger_id}`,
        });
      }

      if (!totalDr.equals(totalCr)) {
        throw new ValidationError(
          `Contra entry imbalance: Debits (${totalDr}) != Credits (${totalCr})`,
        );
      }

      await tx.contra_voucher_main.create({
        data: {
          id: header.id,
          Date_Created: new Date(payload.voucher_date),
          Total: totalDr.toNumber(),
          Narration: payload.narration || '',
          Added_By: user,
          VoucherStatus: 'Posted',
          Voucher_No_Display: voucherNo,
          Round_Off: 0,
          Gross_Total: totalDr.toNumber(),
          delivery_date: new Date(payload.voucher_date),
        },
      });

      await tx.contra_voucher_details.createMany({
        data: linesToInsert,
      });

      await tx.journal_ledger.createMany({
        data: journalEntries.map((e) => ({
          voucher_header_id: e.voucher_header_id,
          ledger_id: e.ledger_id,
          debit_amount: e.debit_amount,
          credit_amount: e.credit_amount,
          posting_date: e.posting_date,
          narration: e.narration,
        })),
      });

      await auditService.log(
        'APPROVE',
        'SUCCESS',
        { voucherNo, total: totalDr.toNumber(), message: 'Contra Voucher Posted successfully' },
        userId || user,
        tx,
      );

      return {
        id: header.id,
        voucherNo,
        total: totalDr.toNumber(),
      };
    });
  },

  /**
   * Transactional posting of a Journal Voucher.
   */
  async postJournalVoucher(payload: JournalVoucherInput, username: string, userId?: number) {
    const user = username || 'system';

    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'Journal',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'Journal',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let totalDr = toDecimal(0);
      let totalCr = toDecimal(0);
      const linesToInsert = [];
      const journalEntries = [];

      for (const line of payload.lines) {
        const drAmt = toDecimal(line.debit_amount || 0);
        const crAmt = toDecimal(line.credit_amount || 0);

        totalDr = add(totalDr, drAmt);
        totalCr = add(totalCr, crAmt);

        linesToInsert.push({
          voucher_id: header.id,
          voucher_ledger_id: line.ledger_id,
          DR_Amount: line.debit_amount || 0,
          CR_Amount: line.credit_amount || 0,
          Narration: line.narration || '',
        });

        journalEntries.push({
          voucher_header_id: header.id,
          ledger_id: line.ledger_id,
          debit_amount: drAmt,
          credit_amount: crAmt,
          posting_date: new Date(payload.voucher_date),
          narration:
            line.narration || payload.narration || `Journal entry ledger ${line.ledger_id}`,
        });
      }

      if (!totalDr.equals(totalCr)) {
        throw new ValidationError(
          `Journal entry imbalance: Debits (${totalDr}) != Credits (${totalCr})`,
        );
      }

      await tx.journal_voucher_main.create({
        data: {
          id: header.id,
          Date_Created: new Date(payload.voucher_date),
          Total: totalDr.toNumber(),
          Narration: payload.narration || '',
          Added_By: user,
          VoucherStatus: 'Posted',
          Voucher_No_Display: voucherNo,
          Round_Off: 0,
          Gross_Total: totalDr.toNumber(),
        },
      });

      await tx.journal_voucher_details.createMany({
        data: linesToInsert,
      });

      await tx.journal_ledger.createMany({
        data: journalEntries.map((e) => ({
          voucher_header_id: e.voucher_header_id,
          ledger_id: e.ledger_id,
          debit_amount: e.debit_amount,
          credit_amount: e.credit_amount,
          posting_date: e.posting_date,
          narration: e.narration,
        })),
      });

      await auditService.log(
        'APPROVE',
        'SUCCESS',
        { voucherNo, total: totalDr.toNumber(), message: 'Journal Voucher Posted successfully' },
        userId || user,
        tx,
      );

      return {
        id: header.id,
        voucherNo,
        total: totalDr.toNumber(),
      };
    });
  },

  /**
   * Transactional posting of a Credit Note (Sales Return).
   */
  async postCreditNote(payload: NoteVoucherInput, username: string, userId?: number) {
    const user = username || 'system';

    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const customerLedger = await tx.ledger_master.findUnique({
        where: { id: payload.ledger_id },
      });
      if (!customerLedger) {
        throw new NotFoundError(`Customer ledger with ID ${payload.ledger_id} not found`);
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'CreditNote',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'CreditNote',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const linesToInsert = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        linesToInsert.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      await tx.credit_note_main.create({
        data: {
          id: header.id,
          godown_id: payload.godown_id,
          voucher_ledger_id: payload.ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || customerLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: 'Posted',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
        },
      });

      await tx.credit_note_details.createMany({
        data: linesToInsert,
      });

      // GL accounts (Sales Return Ledger and Output VAT ledger)
      const salesReturnLedgerId = await ConfigSettingService.get('SALES_RETURN_LEDGER_ID', 7); // sales return ledger
      const taxLedgerId = await ConfigSettingService.get('TAX_LEDGER_ID', 3);

      // Balanced ledger entries:
      // 1. Credit Customer (Gross Total)
      const customerLedgerEntry = {
        voucher_header_id: header.id,
        ledger_id: payload.ledger_id,
        debit_amount: toDecimal(0),
        credit_amount: grossTotal,
        posting_date: new Date(payload.voucher_date),
        narration: payload.narration || `Credit Note (Sales Return) ${voucherNo}`,
      };

      // 2. Debit Sales Return (Gross Total - VAT)
      const salesReturnLedgerEntry = {
        voucher_header_id: header.id,
        ledger_id: salesReturnLedgerId,
        debit_amount: sub(grossTotal, taxSum),
        credit_amount: toDecimal(0),
        posting_date: new Date(payload.voucher_date),
        narration: payload.narration || `Sales Return ${voucherNo}`,
      };

      const journalEntries = [customerLedgerEntry, salesReturnLedgerEntry];

      // 3. Debit VAT (if VAT > 0)
      if (taxSum.greaterThan(0)) {
        journalEntries.push({
          voucher_header_id: header.id,
          ledger_id: taxLedgerId,
          debit_amount: taxSum,
          credit_amount: toDecimal(0),
          posting_date: new Date(payload.voucher_date),
          narration: `VAT reversal for Credit Note ${voucherNo}`,
        });
      }

      // Assert double entry balance (Σdebit == Σcredit)
      const sumDebits = sum(journalEntries.map((e) => e.debit_amount));
      const sumCredits = sum(journalEntries.map((e) => e.credit_amount));
      if (!sumDebits.equals(sumCredits)) {
        throw new ValidationError(
          `Double entry imbalance: Debits (${sumDebits}) != Credits (${sumCredits})`,
        );
      }

      await tx.journal_ledger.createMany({
        data: journalEntries.map((e) => ({
          voucher_header_id: e.voucher_header_id,
          ledger_id: e.ledger_id,
          debit_amount: e.debit_amount,
          credit_amount: e.credit_amount,
          posting_date: e.posting_date,
          narration: e.narration,
        })),
      });

      // Inventory Stock Posting (Quantity In - return to stock)
      const stockLedgerEntries = [];
      for (const line of payload.lines) {
        stockLedgerEntries.push({
          voucher_header_id: header.id,
          item_id: line.item_id,
          sku_id: line.sku_id || null,
          godown_id: payload.godown_id,
          quantity_in: new Prisma.Decimal(line.quantity),
          quantity_out: new Prisma.Decimal(0),
          unit_cost: new Prisma.Decimal(line.price),
          total_cost: new Prisma.Decimal(line.quantity * line.price),
          posting_date: new Date(payload.voucher_date),
        });
      }

      await tx.stock_ledger.createMany({
        data: stockLedgerEntries,
      });

      // Billwise Record (Against Ref allocation or credit note adjustment)
      await tx.billwise_records.create({
        data: {
          voucherPrefix: payload.voucher_prefix,
          VoucherType: 'CreditNote',
          VoucherNo: voucherNo,
          LedgerID: String(payload.ledger_id),
          RefType: 'Against Ref',
          RefNo: voucherNo,
          RefPrefix: payload.voucher_prefix,
          DebitAmount: 0,
          CreditAmount: grossTotal.toNumber(),
          VoucherDate: new Date(payload.voucher_date),
        },
      });

      if (payload.return_against_id) {
        await tx.voucherlinkage.create({
          data: {
            source_voucher_id: payload.return_against_id,
            target_voucher_id: header.id,
            link_type: 'Return',
            added_by: user,
            narration: `Credit Note return against Sales Invoice ${payload.return_against_id}`,
          },
        });
      }

      await auditService.log(
        'APPROVE',
        'SUCCESS',
        { voucherNo, total: grossTotal.toNumber(), message: 'Credit Note Posted successfully' },
        userId || user,
        tx,
      );

      return {
        id: header.id,
        voucherNo,
        total: grossTotal.toNumber(),
      };
    });
  },

  /**
   * Transactional posting of a Debit Note (Purchase Return).
   */
  async postDebitNote(payload: NoteVoucherInput, username: string, userId?: number) {
    const user = username || 'system';

    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const supplierLedger = await tx.ledger_master.findUnique({
        where: { id: payload.ledger_id },
      });
      if (!supplierLedger) {
        throw new NotFoundError(`Supplier ledger with ID ${payload.ledger_id} not found`);
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'DebitNote',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'DebitNote',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const linesToInsert = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        linesToInsert.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      await tx.debit_note_main.create({
        data: {
          id: header.id,
          godown_id: payload.godown_id,
          voucher_ledger_id: payload.ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || supplierLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: 'Posted',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
        },
      });

      await tx.debit_note_details.createMany({
        data: linesToInsert,
      });

      // GL accounts (Purchase Return Ledger and Input VAT ledger)
      const purchaseReturnLedgerId = await ConfigSettingService.get('PURCHASE_RETURN_LEDGER_ID', 8); // purchase return ledger
      const inputTaxLedgerId = await ConfigSettingService.get('INPUT_TAX_LEDGER_ID', 6);

      // Balanced ledger entries:
      // 1. Debit Supplier (Gross Total)
      const supplierLedgerEntry = {
        voucher_header_id: header.id,
        ledger_id: payload.ledger_id,
        debit_amount: grossTotal,
        credit_amount: toDecimal(0),
        posting_date: new Date(payload.voucher_date),
        narration: payload.narration || `Debit Note (Purchase Return) ${voucherNo}`,
      };

      // 2. Credit Purchase Return (Gross Total - VAT)
      const purchaseReturnLedgerEntry = {
        voucher_header_id: header.id,
        ledger_id: purchaseReturnLedgerId,
        debit_amount: toDecimal(0),
        credit_amount: sub(grossTotal, taxSum),
        posting_date: new Date(payload.voucher_date),
        narration: payload.narration || `Purchase Return ${voucherNo}`,
      };

      const journalEntries = [supplierLedgerEntry, purchaseReturnLedgerEntry];

      // 3. Credit VAT (if VAT > 0)
      if (taxSum.greaterThan(0)) {
        journalEntries.push({
          voucher_header_id: header.id,
          ledger_id: inputTaxLedgerId,
          debit_amount: toDecimal(0),
          credit_amount: taxSum,
          posting_date: new Date(payload.voucher_date),
          narration: `VAT reversal for Debit Note ${voucherNo}`,
        });
      }

      // Assert double entry balance (Σdebit == Σcredit)
      const sumDebits = sum(journalEntries.map((e) => e.debit_amount));
      const sumCredits = sum(journalEntries.map((e) => e.credit_amount));
      if (!sumDebits.equals(sumCredits)) {
        throw new ValidationError(
          `Double entry imbalance: Debits (${sumDebits}) != Credits (${sumCredits})`,
        );
      }

      await tx.journal_ledger.createMany({
        data: journalEntries.map((e) => ({
          voucher_header_id: e.voucher_header_id,
          ledger_id: e.ledger_id,
          debit_amount: e.debit_amount,
          credit_amount: e.credit_amount,
          posting_date: e.posting_date,
          narration: e.narration,
        })),
      });

      // Inventory Stock Posting (Quantity Out - return stock to supplier)
      const stockLedgerEntries = [];
      for (const line of payload.lines) {
        stockLedgerEntries.push({
          voucher_header_id: header.id,
          item_id: line.item_id,
          sku_id: line.sku_id || null,
          godown_id: payload.godown_id,
          quantity_in: new Prisma.Decimal(0),
          quantity_out: new Prisma.Decimal(line.quantity),
          unit_cost: new Prisma.Decimal(line.price),
          total_cost: new Prisma.Decimal(line.quantity * line.price),
          posting_date: new Date(payload.voucher_date),
        });
      }

      await tx.stock_ledger.createMany({
        data: stockLedgerEntries,
      });

      // Billwise Record (Against Ref allocation or debit note adjustment)
      await tx.billwise_records.create({
        data: {
          voucherPrefix: payload.voucher_prefix,
          VoucherType: 'DebitNote',
          VoucherNo: voucherNo,
          LedgerID: String(payload.ledger_id),
          RefType: 'Against Ref',
          RefNo: voucherNo,
          RefPrefix: payload.voucher_prefix,
          DebitAmount: grossTotal.toNumber(),
          CreditAmount: 0,
          VoucherDate: new Date(payload.voucher_date),
        },
      });

      if (payload.return_against_id) {
        await tx.voucherlinkage.create({
          data: {
            source_voucher_id: payload.return_against_id,
            target_voucher_id: header.id,
            link_type: 'Return',
            added_by: user,
            narration: `Debit Note return against Purchase Invoice ${payload.return_against_id}`,
          },
        });
      }

      await auditService.log(
        'APPROVE',
        'SUCCESS',
        { voucherNo, total: grossTotal.toNumber(), message: 'Debit Note Posted successfully' },
        userId || user,
        tx,
      );

      return {
        id: header.id,
        voucherNo,
        total: grossTotal.toNumber(),
      };
    });
  },
};

/** Named export for lifecycle approve → Posted booking. */
export async function bookSalesInvoiceIfUnposted(
  tx: Prisma.TransactionClient,
  id: number,
  user: string,
) {
  return VoucherPostingService.bookSalesInvoiceIfUnposted(tx, id, user);
}

export default VoucherPostingService;
