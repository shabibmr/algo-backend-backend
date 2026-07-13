import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

function parseDates(req: Request) {
  const q = req.query as Record<string, string>;
  const start_date = q.start_date ? new Date(q.start_date) : undefined;
  const end_date = q.end_date ? new Date(q.end_date) : undefined;
  const as_of_date = q.as_of_date ? new Date(q.as_of_date) : undefined;
  return { start_date, end_date, as_of_date };
}

export const AnalyticsController = {
  async getCashFlowStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getCashFlowStatement(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getBudgetVariance(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getBudgetVariance(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getBankReconciliation(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getBankReconciliation(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getFixedAssetsDepreciation(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getFixedAssetsDepreciation(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getApCashForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getApCashForecast(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getSalesAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getSalesAnalytics(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getSalesMargin(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getSalesMargin(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getQuotationConversionRatio(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getQuotationConversionRatio(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getSalespersonCommission(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getSalespersonCommission(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getVendorExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getVendorExpenses(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getPriceVariance(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getPriceVariance(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getPpvAudit(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getPpvAudit(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getVendorLeadtimeCompliance(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getVendorLeadtimeCompliance(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getStockMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getStockMovement(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getBomProductionCosting(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getBomProductionCosting();
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getBinLocationStock(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getBinLocationStock();
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getDeadStockAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getDeadStockAnalysis(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getCollectionEfficiency(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getCollectionEfficiency(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getStatutoryPayrollCompliance(req: Request, res: Response, next: NextFunction) {
    try {
      const dates = parseDates(req);
      const data = await AnalyticsService.getStatutoryPayrollCompliance(dates);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
};
