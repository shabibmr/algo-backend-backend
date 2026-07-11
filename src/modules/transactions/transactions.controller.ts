import { Request, Response, NextFunction } from 'express';
import { VoucherPostingService } from './voucherPosting.service';
import { ApiResponse } from '../../core/types';

export const TransactionsController = {
  /**
   * POST /transactions/sales-invoice
   */
  async postSalesInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherPostingService.postSalesInvoice(req.body, username, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Sales invoice posted successfully',
        data: result,
        requestId: req.requestId,
      };

      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /transactions/purchase-invoice
   */
  async postPurchaseInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherPostingService.postPurchaseInvoice(req.body, username, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Purchase invoice posted successfully',
        data: result,
        requestId: req.requestId,
      };

      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /transactions/payment
   */
  async postPaymentVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherPostingService.postPaymentVoucher(req.body, username, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Payment voucher posted successfully',
        data: result,
        requestId: req.requestId,
      };

      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /transactions/receipt
   */
  async postReceiptVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherPostingService.postReceiptVoucher(req.body, username, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Receipt voucher posted successfully',
        data: result,
        requestId: req.requestId,
      };

      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /transactions/contra
   */
  async postContraVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherPostingService.postContraVoucher(req.body, username, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Contra voucher posted successfully',
        data: result,
        requestId: req.requestId,
      };

      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /transactions/journal
   */
  async postJournalVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherPostingService.postJournalVoucher(req.body, username, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Journal voucher posted successfully',
        data: result,
        requestId: req.requestId,
      };

      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /transactions/credit-note
   */
  async postCreditNote(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherPostingService.postCreditNote(req.body, username, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Credit note posted successfully',
        data: result,
        requestId: req.requestId,
      };

      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /transactions/debit-note
   */
  async postDebitNote(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherPostingService.postDebitNote(req.body, username, userId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Debit note posted successfully',
        data: result,
        requestId: req.requestId,
      };

      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },
};

export default TransactionsController;
