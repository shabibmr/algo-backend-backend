import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { validate } from '../../core/middleware/validate';
import {
  companyProfileSchema,
  financialYearSchema,
  branchSchema,
  currencySchema,
  currencyRateSchema,
  addressBookSchema,
  userRoleSchema,
  userCredentialsSchema,
  userUpdateCredentialsSchema,
  permissionsSchema,
  voucherSeriesSchema,
  projectMasterSchema,
  errorReportSchema,
  configUpdateSchema,
} from './organization.schema';

const router = Router();
router.use(authenticate);

// ── Company Profile ──────────────────────────────────────────
router.get('/companies', authorize('CompanyProfile', 'read'), OrganizationController.listCompanies);
router.get(
  '/company/:id',
  authorize('CompanyProfile', 'read'),
  OrganizationController.getCompanyProfile,
);
router.put(
  '/company/:id',
  authorize('CompanyProfile', 'update'),
  validate(companyProfileSchema),
  OrganizationController.updateCompanyProfile,
);

// ── Financial Year ───────────────────────────────────────────
router.get('/fy', authorize('FinancialYear', 'read'), OrganizationController.listFinancialYears);
router.get('/fy/active', authorize('FinancialYear', 'read'), OrganizationController.getActiveFinancialYear);
router.get('/fy/:id', authorize('FinancialYear', 'read'), OrganizationController.getFinancialYear);
router.post(
  '/fy',
  authorize('FinancialYear', 'create'),
  validate(financialYearSchema),
  OrganizationController.createFinancialYear,
);
router.put(
  '/fy/:id',
  authorize('FinancialYear', 'update'),
  OrganizationController.updateFinancialYear,
);

// ── Branch ───────────────────────────────────────────────────
router.get('/branches', authorize('Branch', 'read'), OrganizationController.listBranches);
router.get('/branches/:id', authorize('Branch', 'read'), OrganizationController.getBranch);
router.post(
  '/branches',
  authorize('Branch', 'create'),
  validate(branchSchema),
  OrganizationController.createBranch,
);
router.put(
  '/branches/:id',
  authorize('Branch', 'update'),
  validate(branchSchema),
  OrganizationController.updateBranch,
);
router.delete('/branches/:id', authorize('Branch', 'delete'), OrganizationController.deleteBranch); // task 30

// ── Currency ─────────────────────────────────────────────────
router.get('/currencies', authorize('Currency', 'read'), OrganizationController.listCurrencies);
router.get('/currencies/:id', authorize('Currency', 'read'), OrganizationController.getCurrency);
router.post(
  '/currencies',
  authorize('Currency', 'create'),
  validate(currencySchema),
  OrganizationController.createCurrency,
);
router.put(
  '/currencies/:id',
  authorize('Currency', 'update'),
  OrganizationController.updateCurrency,
); // task 29
router.delete(
  '/currencies/:id',
  authorize('Currency', 'delete'),
  OrganizationController.deleteCurrency,
); // task 29

// ── Currency Rates ───────────────────────────────────────────
// Lookup by currency+date (query). List/history must be registered before /:id.
router.get('/rates', authorize('CurrencyRate', 'read'), OrganizationController.getExchangeRate);
router.get(
  '/rates/history',
  authorize('CurrencyRate', 'read'),
  OrganizationController.listExchangeRates,
);
router.get(
  '/rates/:id',
  authorize('CurrencyRate', 'read'),
  OrganizationController.getExchangeRateById,
);
router.post(
  '/rates',
  authorize('CurrencyRate', 'create'),
  validate(currencyRateSchema),
  OrganizationController.createExchangeRate,
);

// ── VoucherSeries CRUD (task 27) ─────────────────────────────
router.get(
  '/voucher-series',
  authorize('VoucherSeries', 'read'),
  OrganizationController.listVoucherSeries,
);
router.get(
  '/voucher-series/:id',
  authorize('VoucherSeries', 'read'),
  OrganizationController.getVoucherSeries,
);
router.post(
  '/voucher-series',
  authorize('VoucherSeries', 'create'),
  validate(voucherSeriesSchema),
  OrganizationController.createVoucherSeries,
);
router.put(
  '/voucher-series/:id',
  authorize('VoucherSeries', 'update'),
  OrganizationController.updateVoucherSeries,
);
router.delete(
  '/voucher-series/:id',
  authorize('VoucherSeries', 'delete'),
  OrganizationController.deleteVoucherSeries,
);

// ── Address Book (task 28) ───────────────────────────────────
router.get('/contacts', authorize('AddressBook', 'read'), OrganizationController.listContacts);
router.get(
  '/contacts/search',
  authorize('AddressBook', 'read'),
  OrganizationController.searchContacts,
);
router.get('/contacts/:id', authorize('AddressBook', 'read'), OrganizationController.getContact);
router.post(
  '/contacts',
  authorize('AddressBook', 'create'),
  validate(addressBookSchema),
  OrganizationController.createContact,
);
router.put(
  '/contacts/:id',
  authorize('AddressBook', 'update'),
  OrganizationController.updateContact,
);
router.delete(
  '/contacts/:id',
  authorize('AddressBook', 'delete'),
  OrganizationController.deleteContact,
);

// ── ConfigSetting (task 31) ──────────────────────────────────
router.get('/config', authorize('ConfigSetting', 'read'), OrganizationController.listConfig);
router.get('/config/:key', authorize('ConfigSetting', 'read'), OrganizationController.getConfig);
router.put(
  '/config/:key',
  authorize('ConfigSetting', 'update'),
  validate(configUpdateSchema),
  OrganizationController.updateConfig,
);

// ── Extra Values Table (task 34: add authorize) ──────────────
router.get(
  '/extras/:type/:objectId',
  authorize('ExtraValues', 'read'),
  OrganizationController.getExtras,
);
router.put(
  '/extras/:type/:objectId',
  authorize('ExtraValues', 'update'),
  OrganizationController.updateExtras,
);

// ── Audit Logs ───────────────────────────────────────────────
router.get('/audit-logs', authorize('AuditLog', 'read'), OrganizationController.getAuditLogs);

// ── RBAC Admin: Roles & Permissions ──────────────────────────
router.get('/roles', authorize('UserRole', 'read'), OrganizationController.listRoles);
router.get('/roles/:roleId', authorize('UserRole', 'read'), OrganizationController.getRole); // task 32
router.post(
  '/roles',
  authorize('UserRole', 'create'),
  validate(userRoleSchema),
  OrganizationController.createRole,
);
router.put('/roles/:roleId', authorize('UserRole', 'update'), OrganizationController.updateRole); // task 32
router.delete('/roles/:roleId', authorize('UserRole', 'delete'), OrganizationController.deleteRole); // task 32
router.get(
  '/roles/:roleId/permissions',
  authorize('UserAccessPermission', 'read'),
  OrganizationController.getRolePermissions,
);
router.put(
  '/roles/:roleId/permissions',
  authorize('UserAccessPermission', 'update'),
  validate(permissionsSchema),
  OrganizationController.updateRolePermissions,
);

// ── RBAC Admin: Users (task 33) ──────────────────────────────
router.get('/users', authorize('UserCredentials', 'read'), OrganizationController.listUsers);
router.get('/users/:id', authorize('UserCredentials', 'read'), OrganizationController.getUser);
router.post(
  '/users',
  authorize('UserCredentials', 'create'),
  validate(userCredentialsSchema),
  OrganizationController.createUser,
);
router.put(
  '/users/:id',
  authorize('UserCredentials', 'update'),
  validate(userUpdateCredentialsSchema),
  OrganizationController.updateUser,
);
router.delete(
  '/users/:id',
  authorize('UserCredentials', 'delete'),
  OrganizationController.deactivateUser,
);

// ── ProjectMaster CRUD (task 36) ─────────────────────────────
router.get('/projects', authorize('ProjectMaster', 'read'), OrganizationController.listProjects);
router.get('/projects/:id', authorize('ProjectMaster', 'read'), OrganizationController.getProject);
router.post(
  '/projects',
  authorize('ProjectMaster', 'create'),
  validate(projectMasterSchema),
  OrganizationController.createProject,
);
router.put(
  '/projects/:id',
  authorize('ProjectMaster', 'update'),
  OrganizationController.updateProject,
);
router.delete(
  '/projects/:id',
  authorize('ProjectMaster', 'delete'),
  OrganizationController.deleteProject,
);

// ── ErrorReporting (task 37) ─────────────────────────────────
router.post('/error-reports', OrganizationController.createErrorReport); // no auth beyond authenticate (client errors)
router.get(
  '/error-reports',
  authorize('ErrorReporting', 'read'),
  OrganizationController.listErrorReports,
);

// ── Company provisioning (task 47) ───────────────────────────
router.post(
  '/companies',
  authorize('CompanyProfile', 'create'),
  OrganizationController.provisionCompany,
);

export const organizationRoutes = router;
export default router;
