import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requestIdMiddleware } from './core/middleware/requestId';
import { tenantContextMiddleware } from './core/middleware/tenantContext';
import { idempotency } from './core/middleware/idempotency';
import { errorHandler } from './core/middleware/errorHandler';
import { authRoutes } from './core/auth/auth.routes';
import { organizationRoutes } from './modules/organization/organization.routes';
import { accountsRoutes } from './modules/accounts/accounts.routes';
import { transactionsRoutes } from './modules/transactions/transactions.routes';
import { phase4Routes } from './modules/transactions/phase4.routes';
import { ancillaryRoutes } from './modules/transactions/ancillary.routes';
import { voucherReadRoutes } from './modules/transactions/voucherRead.routes';
import { voucherLifecycleRoutes } from './modules/transactions/voucherLifecycle.routes';
import { reportsRoutes } from './modules/transactions/reports.routes';
import { dashboardRoutes } from './modules/transactions/dashboard.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { employeeRoutes } from './modules/employee/employee.routes';
import { analyticsRoutes } from './modules/reports/analytics.routes';
import { prisma } from './core/db/prisma';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './core/docs/openapi';

const app = express();

// Task 68: Security headers
app.use(helmet());

// Task 68: CORS — configure allowlist via env
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'];
app.use(cors({ origin: CORS_ORIGINS.includes('*') ? '*' : CORS_ORIGINS }));

// Task 68: Body size limit
app.use(express.json({ limit: '2mb' }));

// Task 68: Rate limiting — auth routes (strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Task 68: General write route limiter
const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: Number(process.env.RATE_LIMIT_WRITES ?? 120),
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Request tracer and tenant scope injectors
app.use(requestIdMiddleware);
app.use(tenantContextMiddleware);
app.use(idempotency);

// Task 69: Health check endpoint
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    requestId: req.requestId,
  });
});

// Task 69: Readiness probe (DB + schema version check)
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({ status: 'not_ready', error: err.message });
  }
});

// Task 70: Swagger UI at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Mount routes
app.use('/auth', authLimiter, authRoutes);
app.use('/organization', writeLimiter, organizationRoutes);
app.use('/accounts', writeLimiter, accountsRoutes);
app.use('/transactions', writeLimiter, transactionsRoutes);
app.use('/transactions', phase4Routes);
app.use('/transactions', ancillaryRoutes);
app.use('/transactions', voucherReadRoutes);
app.use('/transactions', voucherLifecycleRoutes);
app.use('/transactions/reports', reportsRoutes);
app.use('/reports', dashboardRoutes);
app.use('/reports', analyticsRoutes);
app.use('/inventory', writeLimiter, inventoryRoutes);
app.use('/employee', writeLimiter, employeeRoutes);

// Global centralized error handling (must be last!)
app.use(errorHandler);

export { app };
export default app;
