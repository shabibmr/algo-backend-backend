import { Request, Response, NextFunction } from 'express';
import { TermsAndConditionsService, TransportationService } from './ancillary.service';
import { ApiResponse } from '../../core/types';

export const AncillaryController = {
  // ── Terms & Conditions ──────────────────────────────────────────────────────

  async listTermsAndConditions(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const result = await TermsAndConditionsService.list({ page, limit });
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

  async getTermsAndConditions(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const result = await TermsAndConditionsService.get(id);
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

  async createTermsAndConditions(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const result = await TermsAndConditionsService.create(req.body, user);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Terms and Conditions created successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateTermsAndConditions(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = req.user?.username;
      const result = await TermsAndConditionsService.update(id, req.body, user);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Terms and Conditions updated successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteTermsAndConditions(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = req.user?.username;
      await TermsAndConditionsService.delete(id, user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Terms and Conditions deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Transportation Details ───────────────────────────────────────────────────

  async listTransportationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const result = await TransportationService.list({ page, limit });
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

  async getTransportationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const result = await TransportationService.get(id);
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

  async createTransportationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const result = await TransportationService.create(req.body, user);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Transportation details created successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateTransportationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = req.user?.username;
      const result = await TransportationService.update(id, req.body, user);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Transportation details updated successfully',
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteTransportationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = req.user?.username;
      await TransportationService.delete(id, user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Transportation details deleted successfully',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },
};
