import { Router } from 'express';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { VoucherLifecycleController } from './voucherLifecycle.controller';

const router = Router();
router.use(authenticate);

// Task 23 — edit Draft voucher
router.put('/:type/:id', authorize('Transactions', 'update'), VoucherLifecycleController.edit);

// Task 24 — cancel/void
router.post(
  '/:type/:id/cancel',
  authorize('Transactions', 'update'),
  VoucherLifecycleController.cancel,
);

// Task 25 — approve / reject (mapped to 'update' since 'approve' is not in PermissionAction)
router.post(
  '/:type/:id/approve',
  authorize('Transactions', 'update'),
  VoucherLifecycleController.approve,
);
router.post(
  '/:type/:id/reject',
  authorize('Transactions', 'update'),
  VoucherLifecycleController.reject,
);

export const voucherLifecycleRoutes = router;
export default router;
