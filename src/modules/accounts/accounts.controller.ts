import { Request, Response, NextFunction } from 'express';
import { AccountsService, LedgerBalanceService, OutstandingService } from './accounts.service';
import { ApiResponse } from '../../core/types';

function getQueryOptions(req: Request) {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;
  const sortBy = req.query.sortBy ? String(req.query.sortBy) : undefined;
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  const filters: Record<string, any> = {};
  const reservedKeys = ['page', 'limit', 'search', 'sortBy', 'sortOrder'];
  for (const [key, val] of Object.entries(req.query)) {
    if (!reservedKeys.includes(key) && val !== undefined && val !== '') {
      filters[key] = val;
    }
  }

  return {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    filters: Object.keys(filters).length ? filters : undefined,
  };
}

export const AccountsController = {
  // ── Account Group ────────────────────────────────────────────
  async listAccountGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await AccountsService.listAccountGroups();
      const response: ApiResponse<typeof groups> = {
        success: true,
        data: groups,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getAccountGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const group = await AccountsService.getAccountGroup(Number(id));
      const response: ApiResponse<typeof group> = {
        success: true,
        data: group,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createAccountGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await AccountsService.createAccountGroup(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Account group created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateAccountGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await AccountsService.updateAccountGroup(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Account group updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Ledger Master ────────────────────────────────────────────
  async listLedgers(req: Request, res: Response, next: NextFunction) {
    try {
      const ledgers = await AccountsService.listLedgers(getQueryOptions(req));
      const response: ApiResponse<typeof ledgers> = {
        success: true,
        data: ledgers,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ledger = await AccountsService.getLedger(Number(id));
      const response: ApiResponse<typeof ledger> = {
        success: true,
        data: ledger,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await AccountsService.createLedger(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Ledger created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await AccountsService.updateLedger(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Ledger updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await AccountsService.deleteLedger(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Ledger deleted successfully (soft delete)',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Ledger Balance ───────────────────────────────────────────
  async getLedgerBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const balance = await LedgerBalanceService.getEffectiveBalance(Number(id));
      const response: ApiResponse<{ ledgerId: number; balance: string }> = {
        success: true,
        data: {
          ledgerId: Number(id),
          balance: balance.toString(),
        },
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Billwise Record ──────────────────────────────────────────
  async createBillwise(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await AccountsService.createBillwise(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Billwise record created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getBillwise(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await AccountsService.getBillwise(Number(id));
      const response: ApiResponse<typeof record> = {
        success: true,
        data: record,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Cheque Details ───────────────────────────────────────────
  async createCheque(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await AccountsService.createCheque(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Cheque details created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getCheque(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cheque = await AccountsService.getCheque(Number(id));
      const response: ApiResponse<typeof cheque> = {
        success: true,
        data: cheque,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 41: AccountGroup delete ─────────────────────────────
  async deleteAccountGroup(req: Request, res: Response, next: NextFunction) {
    try {
      await AccountsService.deleteAccountGroup(Number(req.params.id), req.user?.username);
      return res
        .status(200)
        .json({ success: true, message: 'Account group deleted', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 38: LedgerBankDetails GET/PUT ───────────────────────
  async getLedgerBankDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.getLedgerBankDetails(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async upsertLedgerBankDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.upsertLedgerBankDetails(
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

  // ── Task 39: LedgerCreditSettings GET/PUT ────────────────────
  async getLedgerCreditSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.getLedgerCreditSettings(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async upsertLedgerCreditSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.upsertLedgerCreditSettings(
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

  // ── Task 40: LedgerTaxSettings GET/PUT ───────────────────────
  async getLedgerTaxSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.getLedgerTaxSettings(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async upsertLedgerTaxSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.upsertLedgerTaxSettings(
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

  // ── Task 42: Billwise list + update ──────────────────────────
  async listBillwiseByLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.listBillwiseByLedger(
        req.params.ledgerId,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 50,
      );
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async updateBillwise(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.updateBillwise(
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

  // ── Task 43: Cheque list + update ────────────────────────────
  async listChequesByLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.listChequesByLedger(
        req.params.ledgerId,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 50,
      );
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async updateCheque(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AccountsService.updateCheque(
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

  // ── Tasks 50-52: Outstanding & Aging ─────────────────────────
  async getOutstanding(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OutstandingService.getOutstanding(Number(req.params.ledgerId));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  async getAging(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.query.type as 'AR' | 'AP') || 'AR';
      const as_of_date = req.query.as_of_date ? new Date(String(req.query.as_of_date)) : new Date();
      const data = await OutstandingService.getAging({ type, as_of_date });
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
};
export default AccountsController;
