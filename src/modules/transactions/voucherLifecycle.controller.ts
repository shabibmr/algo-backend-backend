import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../core/types';
import {
  VoucherEditService,
  VoucherCancelService,
  VoucherApprovalService,
} from './voucherLifecycle.service';

function ok<T>(res: Response, req: Request, data: T) {
  const body: ApiResponse<T> = { success: true, data, requestId: req.requestId };
  return res.status(200).json(body);
}

export const VoucherLifecycleController = {
  // PUT /transactions/:type/:id  — edit Draft voucher (task 23)
  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, id } = req.params;
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherEditService.edit(type, parseInt(id), req.body, username, userId);
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // POST /transactions/:type/:id/cancel  — cancel + void (task 24)
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, id } = req.params;
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherCancelService.cancel(type, parseInt(id), username, userId);
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // POST /transactions/:type/:id/approve  — approve (task 25)
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, id } = req.params;
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherApprovalService.approve(type, parseInt(id), username, userId);
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },

  // POST /transactions/:type/:id/reject  — reject (task 25)
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, id } = req.params;
      const { reason } = req.body;
      const username = req.user?.username || 'system';
      const userId = req.user?.userId;
      const result = await VoucherApprovalService.reject(
        type,
        parseInt(id),
        reason,
        username,
        userId,
      );
      return ok(res, req, result);
    } catch (err) {
      return next(err);
    }
  },
};
