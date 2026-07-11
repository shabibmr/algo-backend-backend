/**
 * Voucher lifecycle: edit (Draft only), cancel/void, approve, reject.
 * Tasks 23-26 — Phase 7.
 *
 * Rules:
 *  - Edit   : only Draft vouchers; no GL/stock because Draft hasn't posted them.
 *  - Cancel : only Posted vouchers; reverses GL + Stock, records Amendment linkage.
 *  - Approve: Draft → Posted (checks VoucherSeries.require_approval).
 *  - Reject : Draft or Approved → Rejected (sets reason + audit).
 */
import { prisma } from '../../core/db/prisma';
import { NotFoundError, ValidationError, ConflictError } from '../../core/errors/AppError';
import { auditService } from '../../core/audit/auditService';
import { assertDateNotInLockedFY } from './voucherPosting.service';
import { Prisma } from '@prisma/client';

// ─── Type → model mapping ────────────────────────────────────────────────────

type VoucherMeta = {
  mainModel: string;
  detailModel: string;
  glAffecting: boolean;
  stockAffecting: boolean;
};

const VOUCHER_META: Record<string, VoucherMeta> = {
  SalesInvoice: {
    mainModel: 'sales_invoice_main',
    detailModel: 'sales_invoice_details',
    glAffecting: true,
    stockAffecting: true,
  },
  PurchaseInvoice: {
    mainModel: 'purchase_invoice_main',
    detailModel: 'purchase_invoice_details',
    glAffecting: true,
    stockAffecting: true,
  },
  Payment: {
    mainModel: 'payment_voucher_main',
    detailModel: 'payment_voucher_details',
    glAffecting: true,
    stockAffecting: false,
  },
  Receipt: {
    mainModel: 'receipt_voucher_main',
    detailModel: 'receipt_voucher_details',
    glAffecting: true,
    stockAffecting: false,
  },
  Contra: {
    mainModel: 'contra_voucher_main',
    detailModel: 'contra_voucher_details',
    glAffecting: true,
    stockAffecting: false,
  },
  Journal: {
    mainModel: 'journal_voucher_main',
    detailModel: 'journal_voucher_details',
    glAffecting: true,
    stockAffecting: false,
  },
  CreditNote: {
    mainModel: 'credit_note_main',
    detailModel: 'credit_note_details',
    glAffecting: true,
    stockAffecting: true,
  },
  DebitNote: {
    mainModel: 'debit_note_main',
    detailModel: 'debit_note_details',
    glAffecting: true,
    stockAffecting: true,
  },
  Quotation: {
    mainModel: 'quotation_main',
    detailModel: 'quotation_details',
    glAffecting: false,
    stockAffecting: false,
  },
  SalesOrder: {
    mainModel: 'sales_order_main',
    detailModel: 'sales_order_details',
    glAffecting: false,
    stockAffecting: false,
  },
  PurchaseOrder: {
    mainModel: 'purchase_order_main',
    detailModel: 'purchase_order_details',
    glAffecting: false,
    stockAffecting: false,
  },
  DeliveryNote: {
    mainModel: 'delivery_note_main',
    detailModel: 'delivery_note_details',
    glAffecting: false,
    stockAffecting: true,
  },
  ReceiptNote: {
    mainModel: 'receipt_note_main',
    detailModel: 'receipt_note_details',
    glAffecting: false,
    stockAffecting: true,
  },
  GodownTransfer: {
    mainModel: 'godown_tranfer_main',
    detailModel: 'godown_transfer_details',
    glAffecting: false,
    stockAffecting: true,
  },
  MaterialIn: {
    mainModel: 'material_in_main',
    detailModel: 'material_in_details',
    glAffecting: false,
    stockAffecting: true,
  },
  Requirement: {
    mainModel: 'requirement_main',
    detailModel: 'requirement_details',
    glAffecting: false,
    stockAffecting: false,
  },
  StockRequest: {
    mainModel: 'stock_request_main',
    detailModel: 'stock_request_details',
    glAffecting: false,
    stockAffecting: false,
  },
};

function normalizeVoucherType(type: string): string {
  const lower = type.toLowerCase().replace(/[-_]/g, '');
  const mapping: Record<string, string> = {
    salesinvoice: 'SalesInvoice',
    salesinvoices: 'SalesInvoice',
    purchaseinvoice: 'PurchaseInvoice',
    purchaseinvoices: 'PurchaseInvoice',
    payment: 'Payment',
    payments: 'Payment',
    receipt: 'Receipt',
    receipts: 'Receipt',
    contra: 'Contra',
    journal: 'Journal',
    journals: 'Journal',
    creditnote: 'CreditNote',
    creditnotes: 'CreditNote',
    debitnote: 'DebitNote',
    debitnotes: 'DebitNote',
    quotation: 'Quotation',
    quotations: 'Quotation',
    salesorder: 'SalesOrder',
    salesorders: 'SalesOrder',
    purchaseorder: 'PurchaseOrder',
    purchaseorders: 'PurchaseOrder',
    deliverynote: 'DeliveryNote',
    deliverynotes: 'DeliveryNote',
    receiptnote: 'ReceiptNote',
    receiptnotes: 'ReceiptNote',
    godowntransfer: 'GodownTransfer',
    godowntransfers: 'GodownTransfer',
    materialin: 'MaterialIn',
    requirement: 'Requirement',
    requirements: 'Requirement',
    stockrequest: 'StockRequest',
    stockrequests: 'StockRequest'
  };
  return mapping[lower] || type;
}

function getMeta(type: string): VoucherMeta {
  const normalized = normalizeVoucherType(type);
  const meta = VOUCHER_META[normalized];
  if (!meta) throw new ValidationError(`Unknown voucher type: ${type}`);
  return meta;
}

function delegate(modelName: string, tx?: any) {
  const client = tx || prisma;
  const d = (client as any)[modelName];
  if (!d) throw new Error(`Prisma model ${modelName} not found`);
  return d;
}

async function getMainOrThrow(type: string, id: number, tx?: any) {
  const normalized = normalizeVoucherType(type);
  const meta = getMeta(normalized);
  const row = await delegate(meta.mainModel, tx).findUnique({ where: { id } });
  if (!row) throw new NotFoundError(`${normalized} #${id} not found`);
  return { meta, row, normalizedType: normalized };
}

// ─── Task 23: Edit (Draft only) ──────────────────────────────────────────────

export interface EditPayload {
  header?: Record<string, unknown>;
  lines?: Record<string, unknown>[];
}

export const VoucherEditService = {
  async edit(type: string, id: number, payload: EditPayload, username: string, userId?: number) {
    const { meta, row, normalizedType } = await getMainOrThrow(type, id);

    if (row.VoucherStatus !== 'Draft') {
      throw new ConflictError(
        `Cannot edit ${normalizedType} #${id}: status is '${row.VoucherStatus}'. Only Draft vouchers are editable.`,
      );
    }

    return prisma.$transaction(async (tx) => {
      // Update header fields (caller supplies only the fields to change)
      if (payload.header && Object.keys(payload.header).length) {
        await delegate(meta.mainModel, tx).update({
          where: { id },
          data: payload.header,
        });
      }

      // Replace detail lines if supplied
      if (payload.lines !== undefined) {
        await delegate(meta.detailModel, tx).deleteMany({ where: { voucher_id: id } });
        if (payload.lines.length) {
          await delegate(meta.detailModel, tx).createMany({
            data: payload.lines.map((l) => ({ ...l, voucher_id: id })),
          });
        }
      }

      await auditService.log(
        'UPDATE',
        'SUCCESS',
        { type: normalizedType, id, message: 'Draft voucher edited' },
        userId || username,
        tx,
      );

      return { id, type: normalizedType, status: 'Draft', message: 'Voucher updated' };
    });
  },
};

// ─── Task 24: Cancel / void ───────────────────────────────────────────────────

export const VoucherCancelService = {
  async cancel(type: string, id: number, username: string, userId?: number) {
    const { meta, row, normalizedType } = await getMainOrThrow(type, id);

    if (row.VoucherStatus === 'Cancelled') {
      throw new ConflictError(`${normalizedType} #${id} is already Cancelled.`);
    }
    if (row.VoucherStatus !== 'Posted' && row.VoucherStatus !== 'Approved') {
      throw new ConflictError(
        `Cannot cancel ${normalizedType} #${id} with status '${row.VoucherStatus}'. Only Posted or Approved vouchers can be cancelled.`,
      );
    }

    // Check period lock using the voucher's own date
    const header = await prisma.voucher_headers.findUnique({ where: { id } });
    if (header) await assertDateNotInLockedFY(header.voucher_date);

    // Block if downstream linkages exist (target of another source)
    const downstreamLinks = await prisma.voucherlinkage.findMany({
      where: { source_voucher_id: id },
    });
    if (downstreamLinks.length) {
      throw new ConflictError(
        `Cannot cancel ${normalizedType} #${id}: it has ${downstreamLinks.length} downstream linked document(s). Cancel those first.`,
      );
    }

    return prisma.$transaction(async (tx) => {
      // Reverse GL entries
      if (meta.glAffecting) {
        const glEntries = await tx.journal_ledger.findMany({ where: { voucher_header_id: id } });
        if (glEntries.length) {
          await tx.journal_ledger.createMany({
            data: glEntries.map((e) => ({
              voucher_header_id: id,
              ledger_id: e.ledger_id,
              debit_amount: e.credit_amount, // swap
              credit_amount: e.debit_amount, // swap
              posting_date: e.posting_date,
              narration: `REVERSAL: ${e.narration || ''}`,
            })),
          });
        }
      }

      // Reverse stock entries
      if (meta.stockAffecting) {
        const stockEntries = await tx.stock_ledger.findMany({ where: { voucher_header_id: id } });
        if (stockEntries.length) {
          await tx.stock_ledger.createMany({
            data: stockEntries.map((e) => ({
              voucher_header_id: id,
              item_id: e.item_id,
              sku_id: e.sku_id,
              batch_id: e.batch_id,
              godown_id: e.godown_id,
              quantity_in: e.quantity_out, // swap
              quantity_out: e.quantity_in, // swap
              unit_cost: e.unit_cost,
              total_cost: e.total_cost,
              posting_date: e.posting_date,
            })),
          });
        }
      }

      // Mark main as Cancelled
      await delegate(meta.mainModel, tx).update({
        where: { id },
        data: { VoucherStatus: 'Cancelled' },
      });

      // Record Amendment linkage pointing to itself (self-amendment tombstone)
      await tx.voucherlinkage.upsert({
        where: {
          source_voucher_id_target_voucher_id: {
            source_voucher_id: id,
            target_voucher_id: id,
          },
        },
        create: {
          source_voucher_id: id,
          target_voucher_id: id,
          link_type: 'Cancellation',
          narration: `Cancelled by ${username}`,
          added_by: username,
        },
        update: {
          link_type: 'Cancellation',
          narration: `Cancelled by ${username}`,
          last_modified: new Date(),
          last_modified_by: username,
        },
      });

      await auditService.log(
        'DELETE',
        'SUCCESS',
        { type: normalizedType, id, message: `${normalizedType} #${id} cancelled with GL/stock reversal` },
        userId || username,
        tx,
      );

      return { id, type: normalizedType, status: 'Cancelled', message: 'Voucher cancelled and reversed' };
    });
  },
};

// ─── Task 25: Approve / Reject ────────────────────────────────────────────────

export const VoucherApprovalService = {
  async approve(type: string, id: number, username: string, userId?: number) {
    const { meta, row, normalizedType } = await getMainOrThrow(type, id);

    if (row.VoucherStatus === 'Posted') {
      throw new ConflictError(`${normalizedType} #${id} is already Posted.`);
    }
    if (row.VoucherStatus === 'Cancelled') {
      throw new ConflictError(`Cannot approve a Cancelled voucher.`);
    }
    if (row.VoucherStatus !== 'Draft' && row.VoucherStatus !== 'Approved') {
      throw new ConflictError(`${normalizedType} #${id} has unexpected status '${row.VoucherStatus}'.`);
    }

    const header = await prisma.voucher_headers.findUnique({ where: { id } });

    // Check series require_approval flag
    const series = header
      ? await prisma.voucherseries.findFirst({
          where: { voucher_type: normalizedType, prefix: header.voucher_prefix },
        })
      : null;

    const requireApproval = series?.require_approval ?? false;

    // Determine next status
    let nextStatus: string;
    if (!requireApproval) {
      nextStatus = 'Posted';
    } else if (row.VoucherStatus === 'Draft') {
      nextStatus = 'Approved';
    } else {
      nextStatus = 'Posted';
    }

    return prisma.$transaction(async (tx) => {
      await delegate(meta.mainModel, tx).update({
        where: { id },
        data: { VoucherStatus: nextStatus },
      });

      await auditService.log(
        'APPROVE',
        'SUCCESS',
        { type: normalizedType, id, previousStatus: row.VoucherStatus, newStatus: nextStatus },
        userId || username,
        tx,
      );

      return { id, type: normalizedType, status: nextStatus, message: `Voucher status updated to ${nextStatus}` };
    });
  },

  async reject(type: string, id: number, reason: string, username: string, userId?: number) {
    const { meta, row, normalizedType } = await getMainOrThrow(type, id);

    if (row.VoucherStatus === 'Posted') {
      throw new ConflictError(`Cannot reject a Posted voucher — use cancel instead.`);
    }
    if (row.VoucherStatus === 'Cancelled') {
      throw new ConflictError(`Cannot reject a Cancelled voucher.`);
    }

    return prisma.$transaction(async (tx) => {
      // Store rejection reason in Quotation_Dropped_Reason (the generic notes field available on all mains)
      await delegate(meta.mainModel, tx).update({
        where: { id },
        data: {
          VoucherStatus: 'Rejected',
          Quotation_Dropped_Reason: reason || 'Rejected',
          Quotation_Dropped: true,
        },
      });

      await auditService.log(
        'UPDATE',
        'SUCCESS',
        { type: normalizedType, id, message: `Rejected: ${reason}` },
        userId || username,
        tx,
      );

      return { id, type: normalizedType, status: 'Rejected', reason };
    });
  },
};

// ─── Task 26: Billwise allocation on Payment/Receipt ─────────────────────────

export interface BillAllocation {
  ref_no: string;
  ref_prefix: string;
  ledger_id: number;
  amount: number;
}

/**
 * Create `Against Ref` billwise records explicitly linked to specific bills.
 * Called after the payment/receipt voucher is created.
 */
export const BillwiseAllocationService = {
  async allocate(
    voucherType: 'Payment' | 'Receipt',
    voucherNo: string,
    voucherPrefix: string,
    voucherDate: Date,
    allocations: BillAllocation[],
    tx: any,
  ) {
    for (const alloc of allocations) {
      // Verify the original bill exists
      const originalBill = await tx.billwise_records.findFirst({
        where: {
          VoucherNo: alloc.ref_no,
          voucherPrefix: alloc.ref_prefix,
          LedgerID: String(alloc.ledger_id),
          RefType: 'New Ref',
        },
      });
      if (!originalBill) {
        throw new NotFoundError(
          `Bill not found: prefix=${alloc.ref_prefix} no=${alloc.ref_no} ledger=${alloc.ledger_id}`,
        );
      }

      // Compute pending amount
      const credits = await tx.billwise_records.aggregate({
        where: {
          RefNo: alloc.ref_no,
          RefPrefix: alloc.ref_prefix,
          LedgerID: String(alloc.ledger_id),
          RefType: 'Against Ref',
        },
        _sum: { CreditAmount: true, DebitAmount: true },
      });
      const totalCredited = (credits._sum.CreditAmount || 0) - (credits._sum.DebitAmount || 0);
      const originalAmount =
        voucherType === 'Payment' ? originalBill.CreditAmount || 0 : originalBill.DebitAmount || 0;
      const pending = originalAmount - totalCredited;

      if (alloc.amount > pending + 0.001) {
        throw new ValidationError(
          `Allocation amount ${alloc.amount} exceeds pending ${pending.toFixed(2)} on bill ${alloc.ref_no}`,
        );
      }

      await tx.billwise_records.create({
        data: {
          voucherPrefix,
          VoucherType: voucherType,
          VoucherNo: voucherNo,
          LedgerID: String(alloc.ledger_id),
          RefType: 'Against Ref',
          RefNo: alloc.ref_no,
          RefPrefix: alloc.ref_prefix,
          DebitAmount: voucherType === 'Payment' ? alloc.amount : 0,
          CreditAmount: voucherType === 'Receipt' ? alloc.amount : 0,
          VoucherDate: voucherDate,
          Method_of_adj: 'Agst Ref',
        },
      });
    }
  },
};
