import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { ReportsExportController } from './reportsExport.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/sales-register', authorize('Transactions', 'read'), ReportsController.salesRegister);
router.get('/sales-register/excel', authorize('Transactions', 'read'), ReportsExportController.salesRegisterExcel);

router.get(
  '/purchase-register',
  authorize('Transactions', 'read'),
  ReportsController.purchaseRegister,
);
router.get(
  '/purchase-register/excel',
  authorize('Transactions', 'read'),
  ReportsExportController.purchaseRegisterExcel,
);

router.get('/stock-summary', authorize('Inventory', 'read'), ReportsController.stockSummary);
router.get('/stock-summary/excel', authorize('Inventory', 'read'), ReportsExportController.stockSummaryExcel);

router.get('/stock-valuation', authorize('Inventory', 'read'), ReportsController.stockValuation);
router.get('/stock-valuation/excel', authorize('Inventory', 'read'), ReportsExportController.stockValuationExcel);

router.get('/vat-return', authorize('Transactions', 'read'), ReportsController.vatReturn);
router.get('/vat-return/excel', authorize('Transactions', 'read'), ReportsExportController.vatReturnExcel);

export const reportsRoutes = router;
export default router;
