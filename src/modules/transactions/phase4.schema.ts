import { z } from 'zod';

// Reusable specs schema (for ItemPhysicalSpec)
export const itemPhysicalSpecSchema = z.object({
  length: z.number().optional().nullable(),
  dimension: z.string().max(500).optional().nullable(),
  spec_notes: z.string().optional().nullable(),
});

// Reusable detail line allocation schema (for VoucherLineAllocation)
export const voucherLineAllocationSchema = z.object({
  ledger_id: z.number().int().positive(),
  allocation_type: z.enum(['EXPENSE', 'DISCOUNT', 'TAX', 'CHARGE', 'REBATE']),
  allocated_amount: z.number().positive(),
  allocation_method: z
    .enum(['BYVALUE', 'BYQUANTITY', 'BYWEIGHT', 'BYVOLUME', 'MANUAL'])
    .default('BYVALUE'),
});

// Quotation Schema
export const quotationLineSchema = z.object({
  item_id: z.number().int().positive(),
  sku_id: z.number().int().optional().nullable(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  price: z.number().nonnegative('Price cannot be negative'),
  discount_percent: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
  narration: z.string().max(2000).optional().nullable(),
  spec: itemPhysicalSpecSchema.optional().nullable(),
  allocations: z.array(voucherLineAllocationSchema).optional().nullable(),
});

export const quotationPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    customer_ledger_id: z.number().int().positive(),
    salesperson_employee_id: z.number().int().optional().nullable(),
    voucher_project_id: z.number().int().optional().nullable(),
    billing_name: z.string().max(100).optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    completion_probability: z.number().min(0).max(100).optional().default(50),
    revision_number: z.string().max(100).optional().nullable(),
    lines: z.array(quotationLineSchema).min(1, 'At least one line is required'),
  }),
});

// Sales Order Schema
export const salesOrderLineSchema = quotationLineSchema;

export const salesOrderPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    customer_ledger_id: z.number().int().positive(),
    godown_id: z.number().int().positive(),
    salesperson_employee_id: z.number().int().optional().nullable(),
    voucher_project_id: z.number().int().optional().nullable(),
    billing_name: z.string().max(100).optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    requirement_voucher_list: z.array(z.string()).optional().nullable(),
    lines: z.array(salesOrderLineSchema).min(1, 'At least one line is required'),
    carrier_name: z.string().max(150).optional().nullable(), // Shipment field
    lr_no: z.string().max(50).optional().nullable(), // Shipment field
    boxes_count: z.number().int().nonnegative().optional().default(0), // Shipment field
    total_weight: z.number().nonnegative().optional().default(0.0), // Shipment field
  }),
});

// Purchase Order Schema
export const purchaseOrderLineSchema = quotationLineSchema.extend({
  container_count: z.number().int().nonnegative().optional().default(0),
});

export const purchaseOrderPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    supplier_ledger_id: z.number().int().positive(),
    godown_id: z.number().int().positive(),
    salesperson_employee_id: z.number().int().optional().nullable(),
    voucher_project_id: z.number().int().optional().nullable(),
    billing_name: z.string().max(100).optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    lines: z.array(purchaseOrderLineSchema).min(1, 'At least one line is required'),
    carrier_name: z.string().max(150).optional().nullable(),
    lr_no: z.string().max(50).optional().nullable(),
    boxes_count: z.number().int().nonnegative().optional().default(0),
    total_weight: z.number().nonnegative().optional().default(0.0),
  }),
});

// Godown Transfer Schema
export const godownTransferLineSchema = z.object({
  item_id: z.number().int().positive(),
  sku_id: z.number().int().optional().nullable(),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  adj_value: z.number().nonnegative().optional().default(0.0),
  narration: z.string().max(2000).optional().nullable(),
});

export const godownTransferPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    from_godown_id: z.number().int().positive(),
    to_godown_id: z.number().int().positive(),
    narration: z.string().max(2000).optional().nullable(),
    lines: z.array(godownTransferLineSchema).min(1, 'At least one line is required'),
  }),
});

// Delivery Note & Receipt Note Schema
export const noteLineSchema = quotationLineSchema.extend({
  source_line_id: z.number().int().optional().nullable(),
});

export const deliveryNotePostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    customer_ledger_id: z.number().int().positive(),
    godown_id: z.number().int().positive(),
    salesperson_employee_id: z.number().int().optional().nullable(),
    voucher_project_id: z.number().int().optional().nullable(),
    billing_name: z.string().max(100).optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    source_voucher_id: z.number().int().optional().nullable(), // convert from SalesOrder
    lines: z.array(noteLineSchema).min(1, 'At least one line is required'),
    carrier_name: z.string().max(150).optional().nullable(),
    lr_no: z.string().max(50).optional().nullable(),
    boxes_count: z.number().int().nonnegative().optional().default(0),
    total_weight: z.number().nonnegative().optional().default(0.0),
  }),
});

export const receiptNotePostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    supplier_ledger_id: z.number().int().positive(),
    godown_id: z.number().int().positive(),
    salesperson_employee_id: z.number().int().optional().nullable(),
    voucher_project_id: z.number().int().optional().nullable(),
    billing_name: z.string().max(100).optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    source_voucher_id: z.number().int().optional().nullable(), // convert from PurchaseOrder
    lines: z.array(noteLineSchema).min(1, 'At least one line is required'),
    carrier_name: z.string().max(150).optional().nullable(),
    lr_no: z.string().max(50).optional().nullable(),
    boxes_count: z.number().int().nonnegative().optional().default(0),
    total_weight: z.number().nonnegative().optional().default(0.0),
  }),
});

// Material In Schema
export const materialInLineSchema = z.object({
  item_id: z.number().int().positive(),
  sku_id: z.number().int().optional().nullable(),
  crQty: z.number().nonnegative().optional().default(0.0),
  drQty: z.number().nonnegative().optional().default(0.0),
  Price: z.number().nonnegative().optional().default(0.0),
  Item_Narration: z.string().max(2000).optional().nullable(),
});

export const materialInPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    godown_id: z.number().int().optional().nullable(),
    narration: z.string().max(2000).optional().nullable(),
    lines: z.array(materialInLineSchema).min(1, 'At least one line is required'),
  }),
});

// Requirement Schema
export const requirementLineSchema = z.object({
  item_id: z.number().int().positive(),
  sku_id: z.number().int().optional().nullable(),
  quantity: z.number().positive(),
  price: z.number().nonnegative().optional().default(0.0),
  narration: z.string().max(2000).optional().nullable(),
});

export const requirementPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    narration: z.string().max(2000).optional().nullable(),
    lines: z.array(requirementLineSchema).min(1, 'At least one line is required'),
  }),
});

// Stock Request Schema
export const stockRequestLineSchema = z.object({
  inventory_item_id: z.number().int().positive(),
  calculated_qty: z.number().nonnegative().optional().default(0.0),
  request_qty: z.number().positive(),
  issue_qty: z.number().nonnegative().optional().default(0.0),
  consumed_qty: z.number().nonnegative().optional().default(0.0),
  remarks: z.string().max(500).optional().nullable(),
});

export const stockRequestPostSchema = z.object({
  body: z.object({
    voucher_prefix: z.string().min(1).max(50),
    voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    financial_year: z.string().min(4).max(10),
    from_godown_id: z.number().int().positive(),
    to_godown_id: z.number().int().positive(),
    narration: z.string().max(2000).optional().nullable(),
    requirement_voucher_no: z.string().max(100).optional().nullable(),
    lines: z.array(stockRequestLineSchema).min(1, 'At least one line is required'),
  }),
});

// Reporting Schemas
export const ledgerStatementQuerySchema = z.object({
  query: z.object({
    ledger_id: z.string().regex(/^\d+$/, 'ledger_id must be a number string'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  }),
});

export const trialBalanceQuerySchema = z.object({
  query: z.object({
    as_of_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
      .optional(),
  }),
});

export const financialReportQuerySchema = z.object({
  query: z.object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  }),
});
