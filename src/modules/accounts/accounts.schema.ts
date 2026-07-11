import { z } from 'zod';

export const accountGroupSchema = z.object({
  body: z.object({
    group_code: z.string().min(1).max(50).optional(),
    Group_Name: z.string().min(1).max(50),
    parent_group_id: z.number().int().optional().nullable(),
    is_system_defined: z.boolean().default(false),
  }),
});

export const ledgerMasterSchema = z.object({
  body: z.object({
    ledger_code: z.string().min(1).max(100).optional(),
    Ledger_Name: z.string().min(1).max(150),
    Ledger_Type: z
      .enum([
        'SundryDebtor',
        'SundryCreditor',
        'Bank',
        'Cash',
        'Expense',
        'Income',
        'Tax',
        'FixedAsset',
        'Capital',
        'DutyTax',
        'Stock',
        'Other',
      ])
      .default('Other'),
    account_group_id: z.number().int().optional().nullable(),
    contact_id: z.number().int().optional().nullable(),
    parent_ledger_id: z.number().int().optional().nullable(),
    currency_code: z.string().max(3).default('AED'),
    is_system_defined: z.boolean().default(false),
    Opening_Balance: z.string().default('0'),
    Opening_Balance_Date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
      .optional()
      .nullable(),
    Narration: z.string().optional().nullable(),

    // Extensions
    bankDetails: z
      .object({
        bank_account_number: z.string(),
        iban: z.string().optional().nullable(),
        swift_code: z.string().optional().nullable(),
        bank_branch_name: z.string().optional().nullable(),
      })
      .optional(),

    creditSettings: z
      .object({
        credit_limit: z.number().nonnegative().optional().nullable(),
        credit_period_days: z.number().int().nonnegative().default(0),
        payment_terms: z.string().optional().nullable(),
        caution_deposit: z.number().nonnegative().optional().nullable(),
      })
      .optional(),

    taxSettings: z
      .object({
        trn: z.string().optional().nullable(),
        tax_category_id: z.number().int().optional().nullable(),
        type_of_supply: z.string().optional().nullable(),
      })
      .optional(),
  }),
});

export const billwiseSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().optional(),
    voucher_type: z.string().optional(),
    voucher_no: z.string().optional(),
    ledger_id: z.string(), // legacy varchar FK
    ref_type: z.enum(['New Ref', 'Agst Ref', 'Advance', 'On Account']),
    ref_no: z.string(),
    ref_prefix: z.string().optional(),
    debit_amount: z.number().nonnegative().optional(),
    credit_amount: z.number().nonnegative().optional(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
      .optional(),
  }),
});

export const chequeSchema = z.object({
  body: z.object({
    ledger_id: z.string(),
    bank_name: z.string(),
    branch_name: z.string().optional(),
    instrument_no: z.string(),
    instrument_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    instrument_type: z.enum(['Cheque', 'DD', 'NEFT', 'RTGS', 'Other']).default('Cheque'),
    amount: z.number().positive(),
  }),
});
