import { prisma } from '../../core/db/prisma';
import auditService from '../../core/audit/auditService';
import {
  CompanyProfileRepository,
  FinancialYearRepository,
  BranchRepository,
  CurrencyRepository,
  CurrencyRateRepository,
  VoucherSeriesRepository,
  AddressBookRepository,
  ExtraValuesRepository,
  AuditLogRepository,
  UserRoleRepository,
  UserCredentialsRepository,
  UserAccessPermissionRepository,
  ProjectMasterRepository,
  ErrorReportingRepository,
} from './organization.repository';
import { ConfigSettingService } from '../../core/services/ConfigSettingService';
import { ConflictError, NotFoundError, ValidationError } from '../../core/errors/AppError';
import { hashPassword } from '../../core/auth/password';
import { clearPermissionCache } from '../../core/middleware/authorize';
import {
  ADMIN_BOOTSTRAP_MODULES,
  ADMIN_ROLE_NAME,
} from '../../core/permissions/adminModules';
import { ListQueryOptions } from '../../core/utils/listQuery';

const companyRepo = new CompanyProfileRepository();
const fyRepo = new FinancialYearRepository();
const branchRepo = new BranchRepository();
const currencyRepo = new CurrencyRepository();
const rateRepo = new CurrencyRateRepository();
const seriesRepo = new VoucherSeriesRepository();
const addressRepo = new AddressBookRepository();
const extraRepo = new ExtraValuesRepository();
const auditRepo = new AuditLogRepository();
const roleRepo = new UserRoleRepository();
const credsRepo = new UserCredentialsRepository();
const permRepo = new UserAccessPermissionRepository();
const projectRepo = new ProjectMasterRepository();
const errorRepo = new ErrorReportingRepository();

export const OrganizationService = {
  // ── Company Profile ──────────────────────────────────────────
  async getCompanyProfile(id: number) {
    const company = await companyRepo.findById(id);
    if (!company) throw new NotFoundError('Company profile not found');
    return company;
  },

  async updateCompanyProfile(id: number, data: any, user?: string) {
    await this.getCompanyProfile(id);
    return companyRepo.update(id, data, { user });
  },

  // ── Financial Year ───────────────────────────────────────────
  async listFinancialYears(companyId: number) {
    return fyRepo.findMany({
      where: { company_id: companyId },
      orderBy: { start_date: 'desc' },
      limit: 100,
    });
  },

  async getFinancialYear(id: number) {
    const fy = await fyRepo.findById(id);
    if (!fy) throw new NotFoundError('Financial year not found');
    return fy;
  },

  async getActiveFinancialYear(companyId: number) {
    return (
      (await prisma.financialyear.findFirst({
        where: { company_id: companyId, is_default: true },
      })) ||
      (await prisma.financialyear.findFirst({
        where: { company_id: companyId },
        orderBy: { start_date: 'desc' },
      }))
    );
  },

  async createFinancialYear(data: any, user?: string) {
    // Check unique fy_code + company_id
    const existing = await fyRepo.findFirst({
      where: { fy_code: data.fy_code, company_id: data.company_id },
    });
    if (existing) {
      throw new ConflictError(
        `Financial year code ${data.fy_code} already exists for this company`,
      );
    }

    return prisma.$transaction(async (tx) => {
      // If setting as default, clear others
      if (data.is_default) {
        await tx.financialyear.updateMany({
          where: { company_id: data.company_id },
          data: { is_default: false },
        });
      }

      return fyRepo.create(data, { user, tx });
    });
  },

  async updateFinancialYear(id: number, data: any, user?: string) {
    const fy = await fyRepo.findById(id);
    if (!fy) throw new NotFoundError('Financial year not found');

    if (data.fy_code && data.fy_code !== fy.fy_code) {
      const existing = await fyRepo.findFirst({
        where: { fy_code: data.fy_code, company_id: fy.company_id },
      });
      if (existing && existing.id !== id) {
        throw new ConflictError(`Financial year code ${data.fy_code} already exists`);
      }
    }

    return prisma.$transaction(async (tx) => {
      if (data.is_default) {
        await tx.financialyear.updateMany({
          where: { company_id: fy.company_id },
          data: { is_default: false },
        });
      }

      return fyRepo.update(id, data, { user, tx });
    });
  },

  // ── Branch ───────────────────────────────────────────────────
  async listBranches(companyId: number) {
    // Reference data — always return the full list, not a paginated page.
    return branchRepo.findMany({
      where: { company_id: companyId },
      orderBy: { branch_name: 'asc' },
      limit: 1000,
    });
  },

  async getBranch(id: number) {
    const branch = await branchRepo.findById(id);
    if (!branch) throw new NotFoundError('Branch not found');
    return branch;
  },

  async createBranch(data: any, user?: string) {
    const existing = await branchRepo.findFirst({
      where: { branch_code: data.branch_code },
    });
    if (existing) {
      throw new ConflictError(`Branch code ${data.branch_code} already exists`);
    }
    const created = await branchRepo.create(data, { user });
    await auditService.log('Branch:CREATE', 'SUCCESS', { id: (created as any).id, user });
    return created;
  },

  async updateBranch(id: number, data: any, user?: string) {
    const branch = await branchRepo.findById(id);
    if (!branch) throw new NotFoundError('Branch not found');

    if (data.branch_code && data.branch_code !== branch.branch_code) {
      const existing = await branchRepo.findFirst({
        where: { branch_code: data.branch_code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictError(`Branch code ${data.branch_code} already exists`);
      }
    }
    const updated = await branchRepo.update(id, data, { user });
    await auditService.log('Branch:UPDATE', 'SUCCESS', { id, user });
    return updated;
  },

  // ── Currency ─────────────────────────────────────────────────
  async listCurrencies() {
    // Reference data — always return the full list, not a paginated page.
    return currencyRepo.findMany({
      orderBy: { iso_code: 'asc' },
      limit: 1000,
    });
  },

  async getCurrency(id: number) {
    const currency = await currencyRepo.findById(id);
    if (!currency) throw new NotFoundError('Currency not found');
    return currency;
  },

  async createCurrency(data: any, user?: string) {
    const existing = await currencyRepo.findFirst({
      where: { iso_code: data.iso_code },
    });
    if (existing) throw new ConflictError(`Currency ISO code ${data.iso_code} already exists`);

    const created = await prisma.$transaction(async (tx) => {
      if (data.is_base_currency) {
        await tx.currencymaster.updateMany({ data: { is_base_currency: false } });
      }
      return currencyRepo.create(data, { user, tx });
    });
    await auditService.log('Currency:CREATE', 'SUCCESS', { id: (created as any).id, user });
    return created;
  },

  async updateCurrency(id: number, data: any, user?: string) {
    const curr = await currencyRepo.findById(id);
    if (!curr) throw new NotFoundError('Currency not found');

    return prisma.$transaction(async (tx) => {
      if (data.is_base_currency) {
        await tx.currencymaster.updateMany({
          data: { is_base_currency: false },
        });
      }
      return currencyRepo.update(id, data, { user, tx });
    });
  },

  // ── Currency Exchange Rates ──────────────────────────────────
  async getExchangeRate(currencyId: number, dateStr: string) {
    const date = new Date(dateStr);
    return rateRepo.findFirst({
      where: {
        currency_id: currencyId,
        rate_date: date,
      },
    });
  },

  async createExchangeRate(data: any, user?: string) {
    const date = new Date(data.rate_date);
    const existing = await rateRepo.findFirst({
      where: { currency_id: data.currency_id, rate_date: date },
    });
    if (existing) {
      throw new ConflictError('Exchange rate already exists for this currency and date');
    }
    return rateRepo.create(
      {
        ...data,
        rate_date: date,
        buy_rate: new (require('@prisma/client').Prisma.Decimal)(String(data.buy_rate)),
        sell_rate: new (require('@prisma/client').Prisma.Decimal)(String(data.sell_rate)),
        mid_rate:
          data.mid_rate != null
            ? new (require('@prisma/client').Prisma.Decimal)(String(data.mid_rate))
            : undefined,
      },
      { user },
    );
  },

  // ── Voucher Series ───────────────────────────────────────────
  async listVoucherSeries(companyId: number, branchId?: number | null) {
    const where: any = { company_id: companyId };
    if (branchId !== undefined) {
      where.branch_id = branchId;
    }
    // Reference data — always return the full list, not a paginated page.
    return seriesRepo.findMany({ where, orderBy: { voucher_type: 'asc' }, limit: 1000 });
  },

  async createVoucherSeries(data: any, user?: string) {
    const existing = await seriesRepo.findFirst({
      where: {
        voucher_type: data.voucher_type,
        prefix: data.prefix,
        company_id: data.company_id,
      },
    });
    if (existing) {
      throw new ConflictError(
        `Voucher series with prefix ${data.prefix} already exists for this type and company`,
      );
    }
    const series = await seriesRepo.create(data, { user });
    await auditService.log('VoucherSeries:CREATE', 'SUCCESS', {
      id: (series as any).id,
      type: data.voucher_type,
      user,
    });
    return series;
  },

  // ── Address Book ─────────────────────────────────────────────
  async searchContacts(query: string, limit = 20) {
    return addressRepo.findMany({
      where: {
        OR: [
          { Name: { contains: query } },
          { Email: { contains: query } },
          { Phone_Number: { contains: query } },
          { Company_Name: { contains: query } },
        ],
      },
      limit,
    });
  },

  async createContact(data: any, user?: string) {
    return addressRepo.create(data, { user });
  },

  async updateContact(id: number, data: any, user?: string) {
    return addressRepo.update(id, data, { user });
  },

  // ── Extra Values Table ───────────────────────────────────────
  async getExtras(type: string, objectId: number) {
    return extraRepo.findFirst({
      where: {
        Value_Type: type,
        id: objectId, // polymorphic lookup matching target objectId
      },
    });
  },

  async updateExtras(type: string, objectId: number, extrasJson: string, user?: string) {
    const existing = await extraRepo.findFirst({
      where: { Value_Type: type, id: objectId },
    });

    if (existing) {
      return extraRepo.update(existing.id, { Possible_Values: extrasJson }, { user });
    } else {
      return extraRepo.create(
        {
          Value_Type: type,
          Possible_Values: extrasJson,
          // Since it maps PK id to _id, we write to target PK
        },
        { user },
      );
    }
  },

  // ── Audit Logs (Read Only) ───────────────────────────────────
  async getAuditLogs(options: ListQueryOptions) {
    return auditRepo.findMany({
      orderBy: options.sortBy ? undefined : { timestamp: 'desc' },
      ...options,
    });
  },

  // ── RBAC Admin: User Roles ───────────────────────────────────
  async createRole(data: any, user?: string) {
    const existing = await roleRepo.findFirst({
      where: { role_name: data.role_name },
    });
    if (existing) throw new ConflictError(`Role name ${data.role_name} already exists`);
    const role = await roleRepo.create(data, { user });
    await auditService.log('Role:CREATE', 'SUCCESS', {
      id: (role as any).id,
      role_name: data.role_name,
      user,
    });
    return role;
  },

  async listRoles() {
    // Reference data — always return the full list, not a paginated page.
    return roleRepo.findMany({ orderBy: { role_name: 'asc' }, limit: 1000 });
  },

  // ── RBAC Admin: User Access Permissions ─────────────────────
  async updateRolePermissions(roleId: number, permissions: any[], user?: string) {
    const result = await prisma.$transaction(async (tx) => {
      await tx.user_access_permissions.deleteMany({ where: { role_id: roleId } });
      const created = [];
      for (const perm of permissions) {
        const row = await permRepo.create(
          {
            role_id: roleId,
            module_name: perm.module_name,
            Allow_Create: perm.Allow_Create ? 1 : 0,
            Allow_Read: perm.Allow_Read ? 1 : 0,
            Allow_Update: perm.Allow_Update ? 1 : 0,
            Allow_Delete: perm.Allow_Delete ? 1 : 0,
            Allow_Share: perm.Allow_Share ? 1 : 0,
          },
          { user, tx },
        );
        created.push(row);
      }
      clearPermissionCache(roleId);
      return created;
    });
    await auditService.log('RolePermissions:UPDATE', 'SUCCESS', { roleId, user });
    return result;
  },

  // ── RBAC Admin: User Credentials ─────────────────────────────
  async createUser(data: any, user?: string) {
    const existing = await credsRepo.findFirst({
      where: { username: data.username },
    });
    if (existing) throw new ConflictError(`Username ${data.username} already exists`);

    // Ensure contact exists
    const contact = await addressRepo.findById(data.contact_id);
    if (!contact) throw new ValidationError('Invalid contact_id: Contact does not exist');

    const hashedPassword = await hashPassword(data.password);

    return credsRepo.create(
      {
        contact_id: data.contact_id,
        username: data.username,
        password_hash: hashedPassword,
        role_id: data.role_id,
        branch_id: data.branch_id || null,
        employee_id: data.employee_id || null,
      },
      { user },
    );
  },

  async updateUser(id: number, data: any, user?: string) {
    const creds = await credsRepo.findById(id);
    if (!creds) throw new NotFoundError('User not found');

    const updateData: any = { ...data };

    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
      delete updateData.password;
    }

    const updated = await credsRepo.update(id, updateData, { user });

    // Clear permission cache if role changed
    if (data.role_id) {
      clearPermissionCache(creds.role_id);
      clearPermissionCache(data.role_id);
    }

    return updated;
  },

  // ── Task 27: VoucherSeries full CRUD ─────────────────────────
  async getVoucherSeries(id: number) {
    const s = await seriesRepo.findById(id);
    if (!s) throw new NotFoundError('VoucherSeries not found');
    return s;
  },

  async updateVoucherSeries(id: number, data: any, user?: string) {
    await this.getVoucherSeries(id);
    return seriesRepo.update(id, data, { user });
  },

  async deleteVoucherSeries(id: number) {
    await this.getVoucherSeries(id);
    return seriesRepo.delete(id);
  },

  // ── Task 28: AddressBook full CRUD ───────────────────────────
  async listContacts(query?: string, page = 1, limit = 20) {
    const where: any = {};
    if (query) {
      where.OR = [
        { Name: { contains: query } },
        { Email: { contains: query } },
        { Phone_Number: { contains: query } },
        { Company_Name: { contains: query } },
      ];
    }
    return addressRepo.findMany({ where, page, limit, orderBy: { TimeStamp: 'desc' } });
  },

  async getContact(id: number) {
    const c = await addressRepo.findById(id);
    if (!c) throw new NotFoundError('Contact not found');
    return c;
  },

  async deleteContact(id: number) {
    await this.getContact(id);
    return addressRepo.delete(id);
  },

  // ── Task 29: Currency delete ──────────────────────────────────
  async deleteCurrency(id: number) {
    const curr = await currencyRepo.findById(id);
    if (!curr) throw new NotFoundError('Currency not found');
    if (curr.is_base_currency) throw new ValidationError('Cannot delete the base currency');
    return currencyRepo.delete(id);
  },

  // ── Task 30: Branch delete ────────────────────────────────────
  async deleteBranch(id: number) {
    const branch = await branchRepo.findById(id);
    if (!branch) throw new NotFoundError('Branch not found');
    return branchRepo.delete(id);
  },

  // ── Task 31: ConfigSetting routes ────────────────────────────
  async listConfigSettings() {
    return prisma.config_settings.findMany({ orderBy: { gm_key: 'asc' } });
  },

  async getConfigSetting(key: string) {
    const row = await prisma.config_settings.findUnique({ where: { gm_key: key } });
    if (!row) throw new NotFoundError(`Config key '${key}' not found`);
    return row;
  },

  async updateConfigSetting(key: string, value: string, user?: string) {
    const row = await prisma.config_settings.findUnique({ where: { gm_key: key } });
    if (!row) throw new NotFoundError(`Config key '${key}' not found`);
    ConfigSettingService.clearCache(key);
    return prisma.config_settings.update({
      where: { gm_key: key },
      data: { gm_value: value, updated_at: new Date() },
    });
  },

  // ── Task 32: UserRole get/update/delete ───────────────────────
  async getRole(id: number) {
    const r = await roleRepo.findById(id);
    if (!r) throw new NotFoundError('Role not found');
    return r;
  },

  async updateRole(id: number, data: any, user?: string) {
    await this.getRole(id);
    const updated = await roleRepo.update(id, data, { user });
    clearPermissionCache(id);
    return updated;
  },

  async deleteRole(id: number) {
    await this.getRole(id);
    const users = await credsRepo.findMany({ where: { role_id: id }, limit: 1 });
    if (users.items?.length)
      throw new ValidationError('Cannot delete role: users are assigned to it');
    return roleRepo.delete(id);
  },

  // ── Task 33: UserCredentials list/get/delete ─────────────────
  async listUsers(options: ListQueryOptions) {
    return credsRepo.findMany({ orderBy: options.sortBy ? undefined : { username: 'asc' }, ...options });
  },

  async getUser(id: number) {
    const u = await credsRepo.findById(id);
    if (!u) throw new NotFoundError('User not found');
    const { password_hash, ...safe } = u as any;
    return safe;
  },

  async deactivateUser(id: number, user?: string) {
    await this.getUser(id);
    return credsRepo.update(id, { is_active: false }, { user });
  },

  // ── Task 35: CompanyProfile list ─────────────────────────────
  async listCompanyProfiles() {
    // Reference data — always return the full list, not a paginated page.
    return companyRepo.findMany({ orderBy: { id: 'asc' }, limit: 1000 });
  },

  // ── Task 36: ProjectMaster CRUD ──────────────────────────────
  async listProjects(parentId?: number, options: ListQueryOptions = { sortOrder: 'asc' }) {
    const where: any = {};
    if (parentId !== undefined) where.parent_project_master_id = parentId;
    return projectRepo.findMany({
      where,
      orderBy: options.sortBy ? undefined : { Project_Name: 'asc' },
      limit: 1000,
      ...options,
    });
  },

  async getProject(id: number) {
    const p = await projectRepo.findById(id);
    if (!p) throw new NotFoundError('Project not found');
    return p;
  },

  async createProject(data: any, user?: string) {
    if (data.project_code) {
      const existing = await projectRepo.findFirst({ where: { project_code: data.project_code } });
      if (existing) throw new ConflictError(`Project code ${data.project_code} already exists`);
    }
    // Circular reference guard
    if (data.parent_project_master_id) {
      const parent = await projectRepo.findById(data.parent_project_master_id);
      if (!parent) throw new ValidationError('Parent project not found');
    }
    return projectRepo.create(data, { user });
  },

  async updateProject(id: number, data: any, user?: string) {
    await this.getProject(id);
    // Guard: prevent assigning self as parent
    if (data.parent_project_master_id === id) {
      throw new ValidationError('A project cannot be its own parent');
    }
    // Walk ancestors to prevent circular reference
    if (data.parent_project_master_id) {
      let current = data.parent_project_master_id;
      while (current) {
        if (current === id)
          throw new ValidationError('Circular reference detected in project hierarchy');
        const ancestor = await projectRepo.findById(current);
        current = ancestor?.parent_project_master_id ?? null;
      }
    }
    return projectRepo.update(id, data, { user });
  },

  async deleteProject(id: number) {
    await this.getProject(id);
    const children = await projectRepo.findMany({
      where: { parent_project_master_id: id },
      limit: 1,
    });
    if (children.items?.length)
      throw new ValidationError('Cannot delete project with sub-projects');
    return projectRepo.delete(id);
  },

  // ── Task 37: ErrorReporting capture + list ───────────────────
  async logError(data: any) {
    return errorRepo.create({
      error: data.error || 'Unknown error',
      tablename: data.tablename || '',
      query: data.query || '',
      client_id: data.client_id || null,
    });
  },

  async listErrors(resolved?: boolean, page = 1, limit = 50) {
    return errorRepo.findMany({ page, limit, orderBy: { time_stamp: 'desc' } } as any);
  },

  // ── Task 47: Company provisioning (multi-tenant onboarding) ──
  async provisionCompany(payload: any, adminUser?: string) {
    const {
      company_name,
      currency = 'AED',
      admin_username,
      admin_password,
      fy_code,
      fy_start,
      fy_end,
    } = payload;

    return prisma.$transaction(async (tx) => {
      // 1. Create CompanyProfile
      const company = await tx.companyprofile.create({
        data: { Company_Name: company_name, Currency: currency, Currency_Decimal: 2 },
      });

      // 2. Create default Branch
      const branch = await tx.branch.create({
        data: { branch_code: 'HQ', branch_name: 'Head Office', company_id: company.id },
      });

      // 3. Create Financial Year
      const fy = await tx.financialyear.create({
        data: {
          fy_code: fy_code || '2025-26',
          display_name: fy_code || '2025-26',
          start_date: new Date(fy_start || '2025-04-01'),
          end_date: new Date(fy_end || '2026-03-31'),
          status: 'Open',
          is_default: true,
          company_id: company.id,
        },
      });

      // 4. Create root AccountGroup tree
      const rootGroups = [
        { Group_Name: 'Capital Account', group_code: 'CA', is_system_defined: true },
        { Group_Name: 'Loans (Liability)', group_code: 'LL', is_system_defined: true },
        { Group_Name: 'Current Liabilities', group_code: 'CL', is_system_defined: true },
        { Group_Name: 'Fixed Assets', group_code: 'FA', is_system_defined: true },
        { Group_Name: 'Current Assets', group_code: 'CAS', is_system_defined: true },
        { Group_Name: 'Direct Income', group_code: 'DI', is_system_defined: true },
        { Group_Name: 'Indirect Income', group_code: 'II', is_system_defined: true },
        { Group_Name: 'Direct Expenses', group_code: 'DE', is_system_defined: true },
        { Group_Name: 'Indirect Expenses', group_code: 'IE', is_system_defined: true },
      ];
      const createdGroups: Record<string, number> = {};
      for (const g of rootGroups) {
        const grp = await tx.account_groups.create({ data: { ...g, parent_group_id: null } });
        createdGroups[g.group_code] = grp.id;
      }

      // 5. System LedgerMasters
      await tx.ledger_master.createMany({
        data: [
          {
            Ledger_Name: 'Cash',
            Ledger_Type: 'Cash',
            account_group_id: createdGroups['CAS'],
            is_system_defined: true,
            Opening_Balance: '0',
            currency_code: currency,
          },
          {
            Ledger_Name: 'Bank',
            Ledger_Type: 'Bank',
            account_group_id: createdGroups['CAS'],
            is_system_defined: true,
            Opening_Balance: '0',
            currency_code: currency,
          },
          {
            Ledger_Name: 'Sales',
            Ledger_Type: 'Income',
            account_group_id: createdGroups['DI'],
            is_system_defined: true,
            Opening_Balance: '0',
            currency_code: currency,
          },
          {
            Ledger_Name: 'Purchase',
            Ledger_Type: 'Expense',
            account_group_id: createdGroups['DE'],
            is_system_defined: true,
            Opening_Balance: '0',
            currency_code: currency,
          },
          {
            Ledger_Name: 'Duties & Taxes',
            Ledger_Type: 'DutyTax',
            account_group_id: createdGroups['CL'],
            is_system_defined: true,
            Opening_Balance: '0',
            currency_code: currency,
          },
        ],
      });

      // 6. Default VoucherSeries
      const VOUCHER_TYPES = [
        'SalesInvoice',
        'PurchaseInvoice',
        'SalesOrder',
        'PurchaseOrder',
        'Payment',
        'Receipt',
        'JournalVoucher',
        'Quotation',
        'DeliveryNote',
        'ReceiptNote',
        'CreditNote',
        'DebitNote',
        'GodownTransfer',
        'MaterialIn',
        'Requirement',
        'StockRequest',
      ];
      for (const vt of VOUCHER_TYPES) {
        const prefix = vt.slice(0, 2).toUpperCase();
        await tx.voucherseries.create({
          data: {
            voucher_type: vt,
            prefix,
            display_name: `Default ${vt}`,
            company_id: company.id,
            branch_id: branch.id,
            financial_year_id: fy.id,
            number_length: 5,
            prefix_separator: '/',
            starting_number: 1,
            is_default: true,
            require_approval: false,
          },
        });
      }

      // 7. Baseline ConfigSettings
      const configKeys = [
        {
          gm_key: 'DEFAULT_CURRENCY',
          gm_value: currency,
          Value_Type: 'string',
          display_text: 'Base currency code',
        },
        {
          gm_key: 'MULTI_CURRENCY_ENABLED',
          gm_value: 'false',
          Value_Type: 'boolean',
          display_text: 'Enable multi-currency',
        },
        {
          gm_key: 'STOCK_NEGATIVE_ALLOWED',
          gm_value: 'false',
          Value_Type: 'boolean',
          display_text: 'Allow negative stock',
        },
        {
          gm_key: 'SKIP_CREDIT_LIMIT_CHECK',
          gm_value: 'false',
          Value_Type: 'boolean',
          display_text: 'Skip credit limit validation',
        },
      ];
      await tx.config_settings.createMany({ data: configKeys, skipDuplicates: true });

      // 8. Admin Role + User
      const adminRole = await tx.user_roles.create({
        data: { role_name: ADMIN_ROLE_NAME, description: 'Full system access' },
      });

      for (const mod of ADMIN_BOOTSTRAP_MODULES) {
        await tx.user_access_permissions.create({
          data: {
            role_id: adminRole.id,
            module_name: mod,
            Allow_Create: true,
            Allow_Read: true,
            Allow_Update: true,
            Allow_Delete: true,
            Allow_Share: true,
          },
        });
      }

      const passwordHash = await hashPassword(admin_password || 'Admin@123');
      // user_credentials requires a contact_id FK into address_book
      const adminContact = await tx.address_book.create({
        data: {
          Address_Id: `ADMIN-${company.id}`,
          Name: admin_username || 'Administrator',
          contact_type: 'INDIVIDUAL',
        },
      });
      await tx.user_credentials.create({
        data: {
          contact_id: adminContact.id,
          username: admin_username || 'admin',
          password_hash: passwordHash,
          role_id: adminRole.id,
          branch_id: branch.id,
        },
      });

      return {
        company_id: company.id,
        branch_id: branch.id,
        financial_year_id: fy.id,
        admin_role_id: adminRole.id,
        admin_username: admin_username || 'admin',
      };
    });
  },
};

export default OrganizationService;
