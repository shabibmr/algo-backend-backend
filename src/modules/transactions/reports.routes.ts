import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/sales-register', authorize('Transactions', 'read'), ReportsController.salesRegister);
router.get(
  '/purchase-register',
  authorize('Transactions', 'read'),
  ReportsController.purchaseRegister,
);
router.get('/stock-summary', authorize('Inventory', 'read'), ReportsController.stockSummary);
router.get('/stock-valuation', authorize('Inventory', 'read'), ReportsController.stockValuation);
router.get('/vat-return', authorize('Transactions', 'read'), ReportsController.vatReturn);

export const reportsRoutes = router;
export default router;
