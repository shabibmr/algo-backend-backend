import { Request, Response, NextFunction } from 'express';
import {
  QuotationService,
  SalesOrderService,
  PurchaseOrderService,
  GodownTransferService,
  DeliveryReceiptNoteService,
  MaterialStockService,
  JournalLedgerReportService,
  ShipmentQueryService,
  ItemPhysicalSpecQueryService,
  VoucherLineAllocationQueryService,
} from './phase4.service';
import { ApiResponse } from '../../core/types';

export const Phase4Controller = {
  // Quotation
  async postQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await QuotationService.createQuotation(req.body, username, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Quotation created successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateQuotationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { status, reason } = req.body;
      const username = req.user?.username || 'system';
      const result = await QuotationService.updateQuotationStatus(id, status, reason, username);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Quotation status updated successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // Sales Order
  async postSalesOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await SalesOrderService.createSalesOrder(req.body, username, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Sales Order created successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // Purchase Order
  async postPurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await PurchaseOrderService.createPurchaseOrder(req.body, username, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Purchase Order created successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // Godown Transfer
  async postGodownTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await GodownTransferService.createGodownTransfer(req.body, username, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Godown Transfer posted successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // Delivery Note & Receipt Note
  async postDeliveryNote(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await DeliveryReceiptNoteService.createDeliveryNote(
        req.body,
        username,
        userId,
      );
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Delivery Note posted successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async postReceiptNote(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await DeliveryReceiptNoteService.createReceiptNote(req.body, username, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Receipt Note posted successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getPendingQuantities(req: Request, res: Response, next: NextFunction) {
    try {
      const sourceVoucherId = parseInt(req.params.id);
      const result = await DeliveryReceiptNoteService.getPendingQuantities(sourceVoucherId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Pending quantities retrieved successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // Material In
  async postMaterialIn(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await MaterialStockService.createMaterialIn(req.body, username, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Material In posted successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // Requirement
  async postRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await MaterialStockService.createRequirement(req.body, username, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Requirement created successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // Stock Request
  async postStockRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await MaterialStockService.createStockRequest(req.body, username, userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Stock Request created successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async fulfillStockRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { issueQuantities } = req.body;
      const username = req.user?.username || 'system';
      const result = await MaterialStockService.fulfillStockRequest(id, issueQuantities, username);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Stock request fulfilled successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // Journal Ledger Reports
  async getLedgerStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const ledgerId = parseInt(req.query.ledger_id as string);
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;
      const result = await JournalLedgerReportService.getLedgerStatement(
        ledgerId,
        startDate,
        endDate,
      );
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Ledger statement retrieved successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getTrialBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const asOfDate = req.query.as_of_date as string | undefined;
      const result = await JournalLedgerReportService.getTrialBalance(asOfDate);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Trial balance retrieved successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getProfitAndLoss(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;
      const result = await JournalLedgerReportService.getProfitAndLoss(startDate, endDate);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Profit & Loss statement retrieved successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getBalanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const endDate = req.query.end_date as string;
      const result = await JournalLedgerReportService.getBalanceSheet(endDate);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Balance sheet retrieved successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getDayBook(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string;
      const result = await JournalLedgerReportService.getDayBook(date);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Day Book retrieved successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Posting-owned entity read endpoints ──────────────────────────────────────

  async getShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const voucherHeaderId = parseInt(req.params.voucherHeaderId);
      const result = await ShipmentQueryService.getByVoucherHeader(voucherHeaderId);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async listPhysicalSpecs(req: Request, res: Response, next: NextFunction) {
    try {
      const detailLineId = parseInt(req.params.detailLineId);
      const detailLineType = req.query.type as string | undefined;
      const result = await ItemPhysicalSpecQueryService.listByDetailLine(
        detailLineId,
        detailLineType,
      );
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async listLineAllocations(req: Request, res: Response, next: NextFunction) {
    try {
      const detailLineId = parseInt(req.params.detailLineId);
      const result = await VoucherLineAllocationQueryService.listByDetailLine(detailLineId);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },
};
export default Phase4Controller;
