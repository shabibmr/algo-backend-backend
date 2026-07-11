import { Request, Response, NextFunction } from 'express';
import { SalesRegisterService, PurchaseRegisterService } from './reports.service';
import { StockSummaryService, StockValuationService } from './reports.service';
import { VatReturnService } from './dashboard.service';

function parseDate(v: unknown): Date | undefined {
  return v ? new Date(String(v)) : undefined;
}

export const ReportsController = {
  // ── Task 53: Sales Register ───────────────────────────────────
  async salesRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, string>;
      const data = await SalesRegisterService.get({
        start_date: parseDate(q.start_date),
        end_date: parseDate(q.end_date),
        financial_year: q.financial_year,
        prefix: q.prefix,
        customer_ledger_id: q.customer_ledger_id ? Number(q.customer_ledger_id) : undefined,
        page: Number(q.page) || 1,
        limit: Number(q.limit) || 50,
      });
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 54: Purchase Register ────────────────────────────────
  async purchaseRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, string>;
      const data = await PurchaseRegisterService.get({
        start_date: parseDate(q.start_date),
        end_date: parseDate(q.end_date),
        financial_year: q.financial_year,
        prefix: q.prefix,
        vendor_ledger_id: q.vendor_ledger_id ? Number(q.vendor_ledger_id) : undefined,
        page: Number(q.page) || 1,
        limit: Number(q.limit) || 50,
      });
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 55: Stock Summary ────────────────────────────────────
  async stockSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, string>;
      const data = await StockSummaryService.get({
        as_of_date: parseDate(q.as_of_date),
        godown_id: q.godown_id ? Number(q.godown_id) : undefined,
        category_id: q.category_id ? Number(q.category_id) : undefined,
      });
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 56: Stock Valuation ──────────────────────────────────
  async stockValuation(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, string>;
      const data = await StockValuationService.get({
        as_of_date: parseDate(q.as_of_date),
        godown_id: q.godown_id ? Number(q.godown_id) : undefined,
      });
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 63: VAT Return Report ────────────────────────────────
  async vatReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const period = String(req.query.period || new Date().toISOString().slice(0, 7));
      const data = await VatReturnService.getReport(period);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
};
