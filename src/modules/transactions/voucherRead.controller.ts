import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../core/types';
import {
  SalesInvoiceReadService,
  PurchaseInvoiceReadService,
  PaymentVoucherReadService,
  ReceiptVoucherReadService,
  ContraVoucherReadService,
  JournalVoucherReadService,
  CreditNoteReadService,
  DebitNoteReadService,
  QuotationReadService,
  SalesOrderReadService,
  PurchaseOrderReadService,
  DeliveryNoteReadService,
  ReceiptNoteReadService,
  GodownTransferReadService,
  MaterialInReadService,
  RequirementReadService,
  StockRequestReadService,
  VoucherHeaderReadService,
  VoucherLinkageReadService,
  VoucherLineRelationReadService,
  ListFilters,
} from './voucherRead.service';

function extractFilters(req: Request): ListFilters {
  const q = req.query as Record<string, string>;
  return {
    start_date: q.start_date,
    end_date: q.end_date,
    prefix: q.prefix,
    financial_year: q.financial_year,
    ledger_id: q.ledger_id ? parseInt(q.ledger_id) : undefined,
    status: q.status,
    page: q.page ? parseInt(q.page) : undefined,
    limit: q.limit ? parseInt(q.limit) : undefined,
  };
}

function ok<T>(res: Response, req: Request, data: T, message?: string) {
  const body: ApiResponse<T> = { success: true, message, data, requestId: req.requestId };
  return res.status(200).json(body);
}

export const VoucherReadController = {
  // ── 1. SalesInvoice ────────────────────────────────────────────────────────
  async listSalesInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SalesInvoiceReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getSalesInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SalesInvoiceReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 2. PurchaseInvoice ──────────────────────────────────────────────────────
  async listPurchaseInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PurchaseInvoiceReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getPurchaseInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PurchaseInvoiceReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 3. Payment ──────────────────────────────────────────────────────────────
  async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentVoucherReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentVoucherReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 4. Receipt ──────────────────────────────────────────────────────────────
  async listReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReceiptVoucherReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReceiptVoucherReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 5. Contra ───────────────────────────────────────────────────────────────
  async listContra(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ContraVoucherReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getContra(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ContraVoucherReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 6. Journal ──────────────────────────────────────────────────────────────
  async listJournals(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await JournalVoucherReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getJournal(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await JournalVoucherReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 7. CreditNote ───────────────────────────────────────────────────────────
  async listCreditNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CreditNoteReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getCreditNote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CreditNoteReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 8. DebitNote ────────────────────────────────────────────────────────────
  async listDebitNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DebitNoteReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getDebitNote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DebitNoteReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 9. Quotation ────────────────────────────────────────────────────────────
  async listQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await QuotationReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await QuotationReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 10. SalesOrder ──────────────────────────────────────────────────────────
  async listSalesOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SalesOrderReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getSalesOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SalesOrderReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 11. PurchaseOrder ───────────────────────────────────────────────────────
  async listPurchaseOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PurchaseOrderReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getPurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PurchaseOrderReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 12. DeliveryNote ────────────────────────────────────────────────────────
  async listDeliveryNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DeliveryNoteReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getDeliveryNote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DeliveryNoteReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 13. ReceiptNote ─────────────────────────────────────────────────────────
  async listReceiptNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReceiptNoteReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getReceiptNote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReceiptNoteReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 14. GodownTransfer ──────────────────────────────────────────────────────
  async listGodownTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await GodownTransferReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getGodownTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await GodownTransferReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 15. MaterialIn ──────────────────────────────────────────────────────────
  async listMaterialIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MaterialInReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getMaterialIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MaterialInReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 16. Requirement ─────────────────────────────────────────────────────────
  async listRequirements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RequirementReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RequirementReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 17. StockRequest ────────────────────────────────────────────────────────
  async listStockRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await StockRequestReadService.list(extractFilters(req));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  async getStockRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await StockRequestReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 18. VoucherHeader generic ───────────────────────────────────────────────
  async getVoucherHeader(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await VoucherHeaderReadService.getById(parseInt(req.params.id));
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 19. VoucherLinkage ──────────────────────────────────────────────────────
  async getVoucherLinkages(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await VoucherLinkageReadService.getByVoucher(
        parseInt(req.params.voucherHeaderId),
      );
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // ── 20. VoucherLineRelation ─────────────────────────────────────────────────
  async getLineRelations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await VoucherLineRelationReadService.getBySourceLine(
        parseInt(req.params.detailLineId),
      );
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },
};
