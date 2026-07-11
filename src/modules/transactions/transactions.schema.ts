import { z } from 'zod';

export const salesInvoiceLineSchema = z.object({
  item_id: z.number().int().positive('item_id must be a positive integer'),
  sku_id: z.number().int().optional().nullable(),
  batch_id: z.number().int().optional().nullable(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  price: z.number().nonnegative('Price cannot be negative'),
  discount_percent: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
});

export const salesInvoicePostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1, 'Voucher prefix is required').max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    customer_ledger_id: z.number().int().positive(),
    godown_id: z.number().int().positive(),
    salesperson_employee_id: z.number().int().optional().nullable(),
    voucher_project_id: z.number().int().optional().nullable(),
    billing_name: z.string().max(100).optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    credit_days: z.number().int().nonnegative().default(30),
    lines: z.array(salesInvoiceLineSchema).min(1, 'At least one item line is required'),
    source_voucher_id: z.number().int().optional().nullable(),
    source_voucher_type: z.string().max(50).optional().nullable(),
  }),
});

// Purchase Invoice Input Schema
export const purchaseInvoicePostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1, 'Voucher prefix is required').max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    supplier_ledger_id: z.number().int().positive(),
    godown_id: z.number().int().positive(),
    salesperson_employee_id: z.number().int().optional().nullable(),
    voucher_project_id: z.number().int().optional().nullable(),
    billing_name: z.string().max(100).optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    credit_days: z.number().int().nonnegative().default(30),
    lines: z.array(salesInvoiceLineSchema).min(1, 'At least one item line is required'),
  }),
});

// Payment & Receipt Voucher Line Schema
export const cashBankVoucherLineSchema = z.object({
  ledger_id: z.number().int().positive(),
  amount: z.number().positive('Amount must be positive'),
  narration: z.string().max(2000).optional().nullable(),
});

// Payment & Receipt Voucher Input Schema
export const cashBankVoucherPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1, 'Voucher prefix is required').max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    cash_bank_ledger_id: z.number().int().positive(),
    narration: z.string().max(2000).optional().nullable(),
    lines: z.array(cashBankVoucherLineSchema).min(1, 'At least one line is required'),
  }),
});

// Contra Voucher Line Schema
export const contraVoucherLineSchema = z.object({
  ledger_id: z.number().int().positive(),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['DR', 'CR']),
  narration: z.string().max(2000).optional().nullable(),
});

// Contra Voucher Input Schema
export const contraVoucherPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1, 'Voucher prefix is required').max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    narration: z.string().max(2000).optional().nullable(),
    lines: z.array(contraVoucherLineSchema).min(2, 'Contra requires at least two lines'),
  }),
});

// Journal Voucher Line Schema
export const journalVoucherLineSchema = z.object({
  ledger_id: z.number().int().positive(),
  debit_amount: z.number().nonnegative().default(0),
  credit_amount: z.number().nonnegative().default(0),
  narration: z.string().max(2000).optional().nullable(),
});

// Journal Voucher Input Schema
export const journalVoucherPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1, 'Voucher prefix is required').max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    narration: z.string().max(2000).optional().nullable(),
    lines: z.array(journalVoucherLineSchema).min(2, 'Journal requires at least two lines'),
  }),
});

// Credit/Debit Note Input Schema
export const noteVoucherPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1, 'Voucher prefix is required').max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    ledger_id: z.number().int().positive(),
    godown_id: z.number().int().positive(),
    billing_name: z.string().max(100).optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    lines: z.array(salesInvoiceLineSchema).min(1, 'At least one line is required'),
    return_against_id: z.number().int().optional().nullable(),
  }),
});
