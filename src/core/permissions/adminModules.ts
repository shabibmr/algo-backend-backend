/**
 * Modules granted full CRUD to the Administrator role when a company is
 * bootstrapped. Shared by OrganizationService and local seed scripts so the
 * lists cannot drift.
 */
export const ADMIN_ROLE_NAME = 'Administrator';

export const ADMIN_BOOTSTRAP_MODULES = [
  'CompanyProfile',
  'FinancialYear',
  'Branch',
  'Currency',
  'CurrencyRate',
  'VoucherSeries',
  'AddressBook',
  'ExtraValues',
  'AuditLog',
  'UserRole',
  'UserAccessPermission',
  'UserCredentials',
  'ConfigSetting',
  'ProjectMaster',
  'ErrorReporting',
  'Accounts',
  'Transactions',
  'Inventory',
  'Employee',
] as const;

export type AdminBootstrapModule = (typeof ADMIN_BOOTSTRAP_MODULES)[number];
