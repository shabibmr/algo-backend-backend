import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service';
import { ApiResponse } from '../../core/types';
import { getQueryOptions } from '../../core/utils/listQuery';

export const OrganizationController = {
  // ── Company Profile ──────────────────────────────────────────
  async getCompanyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const company = await OrganizationService.getCompanyProfile(Number(id));
      const response: ApiResponse<typeof company> = {
        success: true,
        data: company,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateCompanyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await OrganizationService.updateCompanyProfile(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Company profile updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Financial Year ───────────────────────────────────────────
  async listFinancialYears(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.query;
      const company_id = companyId ? Number(companyId) : req.user?.companyId;
      if (!company_id) {
        return res.status(400).json({ success: false, message: 'companyId is required' });
      }
      const pageResult = await OrganizationService.listFinancialYears(company_id);
      const response: ApiResponse<typeof pageResult> = {
        success: true,
        data: pageResult,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getActiveFinancialYear(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.query.companyId ? Number(req.query.companyId) : req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ success: false, message: 'companyId is required' });
      }
      const activeFY = await OrganizationService.getActiveFinancialYear(companyId);
      const response: ApiResponse<typeof activeFY> = {
        success: true,
        data: activeFY,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createFinancialYear(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await OrganizationService.createFinancialYear(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Financial year created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateFinancialYear(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await OrganizationService.updateFinancialYear(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Financial year updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Branch ───────────────────────────────────────────────────
  async listBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const company_id = req.user?.companyId || 1; // default company profile id
      const branches = await OrganizationService.listBranches(company_id);
      const response: ApiResponse<typeof branches> = {
        success: true,
        data: branches,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.getBranch(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await OrganizationService.createBranch(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Branch created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await OrganizationService.updateBranch(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Branch updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Currency ─────────────────────────────────────────────────
  async listCurrencies(req: Request, res: Response, next: NextFunction) {
    try {
      const currencies = await OrganizationService.listCurrencies();
      const response: ApiResponse<typeof currencies> = {
        success: true,
        data: currencies,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getCurrency(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.getCurrency(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async createCurrency(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await OrganizationService.createCurrency(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Currency created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Currency Rates ───────────────────────────────────────────
  async getExchangeRate(req: Request, res: Response, next: NextFunction) {
    try {
      const { currencyId, date } = req.query;
      if (!currencyId || !date) {
        return res
          .status(400)
          .json({ success: false, message: 'currencyId and date are required' });
      }
      const rate = await OrganizationService.getExchangeRate(Number(currencyId), String(date));
      const response: ApiResponse<typeof rate> = {
        success: true,
        data: rate,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createExchangeRate(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await OrganizationService.createExchangeRate(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Exchange rate created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Address Book ─────────────────────────────────────────────
  async searchContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const queryStr = q ? String(q) : '';
      const contacts = await OrganizationService.searchContacts(queryStr);
      const response: ApiResponse<typeof contacts> = {
        success: true,
        data: contacts,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createContact(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await OrganizationService.createContact(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Contact created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Extra Values Table ───────────────────────────────────────
  async getExtras(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, objectId } = req.params;
      const extras = await OrganizationService.getExtras(type, Number(objectId));
      const response: ApiResponse<typeof extras> = {
        success: true,
        data: extras,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateExtras(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, objectId } = req.params;
      const user = req.user?.username;
      const { possibleValues } = req.body;
      const updated = await OrganizationService.updateExtras(
        type,
        Number(objectId),
        JSON.stringify(possibleValues),
        user,
      );
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Extra values updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Audit Logs ───────────────────────────────────────────────
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await OrganizationService.getAuditLogs(getQueryOptions(req));
      const response: ApiResponse<typeof logs> = {
        success: true,
        data: logs,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── RBAC Admin: Roles ────────────────────────────────────────
  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await OrganizationService.createRole(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Role created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async listRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await OrganizationService.listRoles();
      const response: ApiResponse<typeof roles> = {
        success: true,
        data: roles,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── RBAC Admin: Permissions ──────────────────────────────────
  async updateRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      const user = req.user?.username;
      const { permissions } = req.body;
      const updated = await OrganizationService.updateRolePermissions(
        Number(roleId),
        permissions,
        user,
      );
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Role permissions updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── RBAC Admin: Users ────────────────────────────────────────
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await OrganizationService.createUser(req.body, user);
      const response: ApiResponse<any> = {
        success: true,
        message: 'User created successfully',
        data: {
          id: created.id,
          username: created.username,
          roleId: created.role_id,
          branchId: created.branch_id,
        },
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await OrganizationService.updateUser(Number(id), req.body, user);
      const response: ApiResponse<any> = {
        success: true,
        message: 'User updated successfully',
        data: {
          id: updated.id,
          username: updated.username,
          roleId: updated.role_id,
          branchId: updated.branch_id,
          is_active: updated.is_active,
        },
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 27: VoucherSeries full CRUD ─────────────────────────
  async getVoucherSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.getVoucherSeries(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async listVoucherSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = Number(req.query.company_id || req.user?.companyId);
      const data = await OrganizationService.listVoucherSeries(companyId);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async createVoucherSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.createVoucherSeries(req.body, req.user?.username);
      return res
        .status(201)
        .json({ success: true, message: 'Created', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async updateVoucherSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.updateVoucherSeries(
        Number(req.params.id),
        req.body,
        req.user?.username,
      );
      return res
        .status(200)
        .json({ success: true, message: 'Updated', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async deleteVoucherSeries(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.deleteVoucherSeries(Number(req.params.id));
      return res.status(200).json({ success: true, message: 'Deleted', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 28: AddressBook full CRUD ───────────────────────────
  async listContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, page, limit } = req.query as Record<string, string>;
      const data = await OrganizationService.listContacts(
        q,
        Number(page) || 1,
        Number(limit) || 20,
      );
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async getContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.getContact(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.updateContact(
        Number(req.params.id),
        req.body,
        req.user?.username,
      );
      return res
        .status(200)
        .json({ success: true, message: 'Updated', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.deleteContact(Number(req.params.id));
      return res.status(200).json({ success: true, message: 'Deleted', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 29: Currency delete ──────────────────────────────────
  async updateCurrency(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.updateCurrency(
        Number(req.params.id),
        req.body,
        req.user?.username,
      );
      return res
        .status(200)
        .json({ success: true, message: 'Updated', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async deleteCurrency(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.deleteCurrency(Number(req.params.id));
      return res.status(200).json({ success: true, message: 'Deleted', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 30: Branch delete ────────────────────────────────────
  async deleteBranch(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.deleteBranch(Number(req.params.id));
      return res.status(200).json({ success: true, message: 'Deleted', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 31: ConfigSetting routes ────────────────────────────
  async listConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.listConfigSettings();
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.getConfigSetting(req.params.key);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.updateConfigSetting(
        req.params.key,
        req.body.value,
        req.user?.username,
      );
      return res
        .status(200)
        .json({ success: true, message: 'Updated', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 32: UserRole get/update/delete ───────────────────────
  async getRole(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.getRole(Number(req.params.roleId));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.updateRole(
        Number(req.params.roleId),
        req.body,
        req.user?.username,
      );
      return res
        .status(200)
        .json({ success: true, message: 'Updated', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.deleteRole(Number(req.params.roleId));
      return res.status(200).json({ success: true, message: 'Deleted', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 33: UserCredentials list/get/delete ─────────────────
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.listUsers(getQueryOptions(req));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.getUser(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.deactivateUser(Number(req.params.id), req.user?.username);
      return res
        .status(200)
        .json({ success: true, message: 'User deactivated', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 35: CompanyProfile list ─────────────────────────────
  async listCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.listCompanyProfiles();
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 36: ProjectMaster CRUD ──────────────────────────────
  async listProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = req.query.parent_id ? Number(req.query.parent_id) : undefined;
      const data = await OrganizationService.listProjects(parentId, getQueryOptions(req));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.getProject(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.createProject(req.body, req.user?.username);
      return res
        .status(201)
        .json({ success: true, message: 'Created', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.updateProject(
        Number(req.params.id),
        req.body,
        req.user?.username,
      );
      return res
        .status(200)
        .json({ success: true, message: 'Updated', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganizationService.deleteProject(Number(req.params.id));
      return res.status(200).json({ success: true, message: 'Deleted', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 37: ErrorReporting ───────────────────────────────────
  async createErrorReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.logError(req.body);
      return res.status(201).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async listErrorReports(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.listErrors(
        undefined,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 50,
      );
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 47: Company provisioning ────────────────────────────
  async provisionCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrganizationService.provisionCompany(req.body, req.user?.username);
      return res
        .status(201)
        .json({ success: true, message: 'Company provisioned', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
};
