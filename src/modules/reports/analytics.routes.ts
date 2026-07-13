import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';

const router = Router();
router.use(authenticate);

router.get(
  '/cash-flow-statement',
  authorize('JournalLedger', 'read'),
  AnalyticsController.getCashFlowStatement,
);

router.get(
  '/budget-variance',
  authorize('JournalLedger', 'read'),
  AnalyticsController.getBudgetVariance,
);

router.get(
  '/bank-reconciliation',
  authorize('JournalLedger', 'read'),
  AnalyticsController.getBankReconciliation,
);

router.get(
  '/fixed-assets-depreciation',
  authorize('JournalLedger', 'read'),
  AnalyticsController.getFixedAssetsDepreciation,
);

router.get(
  '/ap-forecast',
  authorize('Transactions', 'read'),
  AnalyticsController.getApCashForecast,
);

router.get(
  '/sales-analytics',
  authorize('Transactions', 'read'),
  AnalyticsController.getSalesAnalytics,
);

router.get(
  '/sales-margin',
  authorize('Transactions', 'read'),
  AnalyticsController.getSalesMargin,
);

router.get(
  '/quotation-conversion-ratio',
  authorize('Transactions', 'read'),
  AnalyticsController.getQuotationConversionRatio,
);

router.get(
  '/salesperson-commission',
  authorize('Transactions', 'read'),
  AnalyticsController.getSalespersonCommission,
);

router.get(
  '/vendor-expenses',
  authorize('Transactions', 'read'),
  AnalyticsController.getVendorExpenses,
);

router.get(
  '/price-variance',
  authorize('Transactions', 'read'),
  AnalyticsController.getPriceVariance,
);

router.get(
  '/ppv-audit',
  authorize('Transactions', 'read'),
  AnalyticsController.getPpvAudit,
);

router.get(
  '/vendor-leadtime-compliance',
  authorize('Transactions', 'read'),
  AnalyticsController.getVendorLeadtimeCompliance,
);

router.get(
  '/stock-movement',
  authorize('Inventory', 'read'),
  AnalyticsController.getStockMovement,
);

router.get(
  '/bom-production-costing',
  authorize('Inventory', 'read'),
  AnalyticsController.getBomProductionCosting,
);

router.get(
  '/bin-location-stock',
  authorize('Inventory', 'read'),
  AnalyticsController.getBinLocationStock,
);

router.get(
  '/dead-stock-analysis',
  authorize('Inventory', 'read'),
  AnalyticsController.getDeadStockAnalysis,
);

router.get(
  '/collection-efficiency',
  authorize('Transactions', 'read'),
  AnalyticsController.getCollectionEfficiency,
);

router.get(
  '/statutory-payroll-compliance',
  authorize('Employee', 'read'),
  AnalyticsController.getStatutoryPayrollCompliance,
);

export const analyticsRoutes = router;
export default router;
