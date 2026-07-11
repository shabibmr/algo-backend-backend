import { Request, Response, NextFunction } from 'express';
import { SalesRegisterService, PurchaseRegisterService } from './reports.service';
import { StockSummaryService, StockValuationService } from './reports.service';
import { VatReturnService } from './dashboard.service';
import { ExportService, ExcelColumn } from '../../core/services/export.service';

function parseDate(v: unknown): Date | undefined {
  return v ? new Date(String(v)) : undefined;
}

export const ReportsExportController = {
  // ── Sales Register Excel ──────────────────────────────────────
  async salesRegisterExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, string>;
      const { items } = await SalesRegisterService.get({
        start_date: parseDate(q.start_date),
        end_date: parseDate(q.end_date),
        financial_year: q.financial_year,
        prefix: q.prefix,
        customer_ledger_id: q.customer_ledger_id ? Number(q.customer_ledger_id) : undefined,
        page: 1,
        limit: 100000,
      });

      const columns: ExcelColumn[] = [
        { header: 'Voucher Date', key: 'voucher_date', width: 15 },
        { header: 'Voucher Prefix', key: 'voucher_prefix', width: 15 },
        { header: 'Voucher No', key: 'voucher_no', width: 15 },
        { header: 'Customer Ledger ID', key: 'ledger_id', width: 20 },
        { header: 'Gross Total', key: 'gross_total', width: 15 },
        { header: 'VAT Amount', key: 'vat_amount', width: 15 },
        { header: 'Total Amount', key: 'total', width: 18 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      const data = items.map(item => ({
        voucher_date: item.voucher_date ? new Date(item.voucher_date).toLocaleDateString() : '',
        voucher_prefix: item.voucher_prefix || '',
        voucher_no: item.voucher_no || '',
        ledger_id: item.sales_invoice_main?.voucher_ledger_id || '',
        gross_total: Number(item.sales_invoice_main?.Gross_Total || 0),
        vat_amount: Number(item.sales_invoice_main?.Vat_Amount || 0),
        total: Number(item.sales_invoice_main?.Total || 0),
        status: item.sales_invoice_main?.VoucherStatus || '',
      }));

      const buffer = await ExportService.generateExcel('Sales Register', columns, data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="sales_register.xlsx"');
      return res.status(200).send(buffer);
    } catch (err) {
      return next(err);
    }
  },

  // ── Purchase Register Excel ───────────────────────────────────
  async purchaseRegisterExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, string>;
      const { items } = await PurchaseRegisterService.get({
        start_date: parseDate(q.start_date),
        end_date: parseDate(q.end_date),
        financial_year: q.financial_year,
        prefix: q.prefix,
        vendor_ledger_id: q.vendor_ledger_id ? Number(q.vendor_ledger_id) : undefined,
        page: 1,
        limit: 100000,
      });

      const columns: ExcelColumn[] = [
        { header: 'Voucher Date', key: 'voucher_date', width: 15 },
        { header: 'Voucher Prefix', key: 'voucher_prefix', width: 15 },
        { header: 'Voucher No', key: 'voucher_no', width: 15 },
        { header: 'Vendor Ledger ID', key: 'ledger_id', width: 20 },
        { header: 'Gross Total', key: 'gross_total', width: 15 },
        { header: 'VAT Amount', key: 'vat_amount', width: 15 },
        { header: 'Total Amount', key: 'total', width: 18 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      const data = items.map(item => ({
        voucher_date: item.voucher_date ? new Date(item.voucher_date).toLocaleDateString() : '',
        voucher_prefix: item.voucher_prefix || '',
        voucher_no: item.voucher_no || '',
        ledger_id: item.purchase_invoice_main?.voucher_ledger_id || '',
        gross_total: Number(item.purchase_invoice_main?.Gross_Total || 0),
        vat_amount: Number(item.purchase_invoice_main?.Vat_Amount || 0),
        total: Number(item.purchase_invoice_main?.Total || 0),
        status: item.purchase_invoice_main?.VoucherStatus || '',
      }));

      const buffer = await ExportService.generateExcel('Purchase Register', columns, data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="purchase_register.xlsx"');
      return res.status(200).send(buffer);
    } catch (err) {
      return next(err);
    }
  },

  // ── Stock Summary Excel ───────────────────────────────────────
  async stockSummaryExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, string>;
      const summary = await StockSummaryService.get({
        as_of_date: parseDate(q.as_of_date),
        godown_id: q.godown_id ? Number(q.godown_id) : undefined,
        category_id: q.category_id ? Number(q.category_id) : undefined,
      });

      const columns: ExcelColumn[] = [
        { header: 'Item ID', key: 'item_id', width: 12 },
        { header: 'Item Name', key: 'item_name', width: 25 },
        { header: 'Godown ID', key: 'godown_id', width: 12 },
        { header: 'Qty In', key: 'quantity_in', width: 15 },
        { header: 'Qty Out', key: 'quantity_out', width: 15 },
        { header: 'Closing Qty', key: 'closing_qty', width: 15 },
      ];

      const buffer = await ExportService.generateExcel('Stock Summary', columns, summary);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="stock_summary.xlsx"');
      return res.status(200).send(buffer);
    } catch (err) {
      return next(err);
    }
  },

  // ── Stock Valuation Excel ─────────────────────────────────────
  async stockValuationExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query as Record<string, string>;
      const valuation = await StockValuationService.get({
        as_of_date: parseDate(q.as_of_date),
        godown_id: q.godown_id ? Number(q.godown_id) : undefined,
      });

      const columns: ExcelColumn[] = [
        { header: 'Item ID', key: 'item_id', width: 12 },
        { header: 'Item Name', key: 'item_name', width: 25 },
        { header: 'Godown ID', key: 'godown_id', width: 12 },
        { header: 'Closing Qty', key: 'closing_qty', width: 15 },
        { header: 'Average Cost', key: 'avg_cost', width: 15 },
        { header: 'Total Value', key: 'total_value', width: 18 },
      ];

      const buffer = await ExportService.generateExcel('Stock Valuation', columns, valuation);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="stock_valuation.xlsx"');
      return res.status(200).send(buffer);
    } catch (err) {
      return next(err);
    }
  },

  // ── VAT Return Excel ──────────────────────────────────────────
  async vatReturnExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const period = String(req.query.period || new Date().toISOString().slice(0, 7));
      const vatReport = await VatReturnService.getReport(period);

      const columns: ExcelColumn[] = [
        { header: 'Report Parameter', key: 'parameter', width: 30 },
        { header: 'Value', key: 'value', width: 25 },
      ];

      const data = [
        { parameter: 'Period', value: vatReport.period },
        { parameter: 'Start Date', value: new Date(vatReport.start_date).toLocaleDateString() },
        { parameter: 'End Date', value: new Date(vatReport.end_date).toLocaleDateString() },
        { parameter: 'Sales Invoice Count', value: vatReport.sales_invoices },
        { parameter: 'Purchase Invoice Count', value: vatReport.purchase_invoices },
        { parameter: 'Total Sales Value (excluding VAT)', value: vatReport.total_sales_value },
        { parameter: 'Total Purchase Value (excluding VAT)', value: vatReport.total_purchase_value },
        { parameter: 'Output Tax (VAT on Sales)', value: vatReport.output_tax },
        { parameter: 'Input Tax (VAT on Purchases)', value: vatReport.input_tax },
        { parameter: 'Net VAT Payable / Refundable', value: vatReport.net_vat_payable },
      ];

      const buffer = await ExportService.generateExcel('VAT Return', columns, data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="vat_return.xlsx"');
      return res.status(200).send(buffer);
    } catch (err) {
      return next(err);
    }
  },
};
