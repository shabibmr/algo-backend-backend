import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import {
  DashboardService,
  AlertsService,
  GlobalSearchService,
} from './dashboard.service';

const router = Router();
router.use(authenticate);

// ── Task 60: Dashboard ────────────────────────────────────────
router.get(
  '/dashboard',
  authorize('Transactions', 'read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query as Record<string, string>;
      const end_date = q.end_date ? new Date(q.end_date) : new Date();
      const start_date = q.start_date
        ? new Date(q.start_date)
        : new Date(end_date.getFullYear(), end_date.getMonth(), 1);
      const data = await DashboardService.getSummary({
        company_id: q.company_id ? Number(q.company_id) : undefined,
        branch_id: q.branch_id ? Number(q.branch_id) : undefined,
        start_date,
        end_date,
      });
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/dashboard/trend',
  authorize('Transactions', 'read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query as Record<string, string>;
      const months = Math.min(24, Math.max(1, Number(q.months) || 6));
      const data = await DashboardService.getTrend({
        company_id: q.company_id ? Number(q.company_id) : undefined,
        branch_id: q.branch_id ? Number(q.branch_id) : undefined,
        months,
      });
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
);

// ── Task 61: Alerts ───────────────────────────────────────────
router.get(
  '/alerts',
  authorize('Transactions', 'read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AlertsService.getAlerts();
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
);

// ── Task 62: Global Search ────────────────────────────────────
router.get(
  '/search',
  authorize('Transactions', 'read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = String(req.query.q || '');
      const data = await GlobalSearchService.search(q);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
);

export const dashboardRoutes = router;
export default router;
