import { prisma } from '../../core/db/prisma';
import {
  AccountGroupRepository,
  LedgerMasterRepository,
  BillwiseRecordRepository,
  ChequeDetailsRepository,
} from './accounts.repository';
import { ForbiddenError, NotFoundError, ValidationError } from '../../core/errors/AppError';
import { toDecimal } from '../../core/utils/decimal';
import { Prisma } from '@prisma/client';

const groupRepo = new AccountGroupRepository();
const ledgerRepo = new LedgerMasterRepository();
const billwiseRepo = new BillwiseRecordRepository();
const chequeRepo = new ChequeDetailsRepository();

export const AccountsService = {
  // ── Account Group self-referential hierarchy ──────────────────
  async listAccountGroups() {
    const result = await groupRepo.findMany({ limit: 1000 });
    const items = [];

    for (const group of result.items) {
      const { fullPath, depth } = await this.computeGroupPathAndDepth(group.id);
      items.push({
        ...group,
        full_path: fullPath,
        depth,
      });
    }

    return { items, meta: result.meta };
  },

  async getAccountGroup(id: number) {
    const group = await groupRepo.findById(id);
    if (!group) throw new NotFoundError('Account group not found');

    const { fullPath, depth } = await this.computeGroupPathAndDepth(id);
    return {
      ...group,
      full_path: fullPath,
      depth,
    };
  },

  async createAccountGroup(data: any, user?: string) {
    if (data.parent_group_id) {
      const parent = await groupRepo.findById(data.parent_group_id);
      if (!parent) throw new ValidationError('Parent group does not exist');
    }
    return groupRepo.create(data, { user });
  },

  async updateAccountGroup(id: number, data: any, user?: string) {
    const group = await groupRepo.findById(id);
    if (!group) throw new NotFoundError('Account group not found');

    if (data.parent_group_id) {
      if (data.parent_group_id === id) {
        throw new ValidationError('A group cannot be its own parent');
      }
      await this.assertNoCycle(data.parent_group_id, id);
    }

    return groupRepo.update(id, data, { user });
  },

  async assertNoCycle(parentId: number, selfId: number): Promise<void> {
    let currentId: number | null = parentId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (currentId === selfId) {
        throw new ValidationError('Circular dependency detected in Account Groups');
      }
      if (visited.has(currentId)) {
        break; // Guard against existing cycles in the DB
      }
      visited.add(currentId);

      const parent = await groupRepo.findById(currentId);
      currentId = parent ? parent.parent_group_id : null;
    }
  },

  async computeGroupPathAndDepth(groupId: number): Promise<{ fullPath: string; depth: number }> {
    const path: string[] = [];
    let currentId: number | null = groupId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (visited.has(currentId)) {
        break; // Guard against circular loops
      }
      visited.add(currentId);

      const group = await groupRepo.findById(currentId);
      if (!group) break;

      path.unshift(group.Group_Name);
      currentId = group.parent_group_id;
    }

    return {
      fullPath: path.join(' / '),
      depth: path.length - 1,
    };
  },

  // ── Ledger Master + 1:1 Extensions ──────────────────────────
  async getLedger(id: number) {
    const ledger = await ledgerRepo.findById(id, {
      include: {
        ledger_bank_details: true,
        ledger_credit_settings: true,
        ledger_tax_settings: true,
      },
    });
    if (!ledger) throw new NotFoundError('Ledger not found');

    // Soft-FK join to address_book
    let contact = null;
    if (ledger.contact_id) {
      contact = await prisma.address_book.findUnique({
        where: { id: ledger.contact_id },
      });
    }

    return {
      ...ledger,
      contact,
    };
  },

  async listLedgers() {
    return ledgerRepo.findMany({
      include: {
        ledger_bank_details: true,
        ledger_credit_settings: true,
        ledger_tax_settings: true,
      },
      limit: 100,
    });
  },

  async createLedger(payload: any, user?: string) {
    const { bankDetails, creditSettings, taxSettings, ...masterData } = payload;

    if (masterData.contact_id) {
      const contact = await prisma.address_book.findUnique({
        where: { id: masterData.contact_id },
      });
      if (!contact) throw new ValidationError('Invalid contact_id: Contact does not exist');
    }

    return prisma.$transaction(async (tx) => {
      // Create Master
      const ledger = await ledgerRepo.create(masterData, { user, tx });
      const ledgerId = (ledger as any).id;

      // Create Extensions
      if (bankDetails) {
        await tx.ledger_bank_details.create({
          data: {
            ledger_id: ledgerId,
            bank_account_number: bankDetails.bank_account_number,
            iban: bankDetails.iban || null,
            swift_code: bankDetails.swift_code || null,
            bank_branch_name: bankDetails.bank_branch_name || null,
          },
        });
      }

      if (creditSettings) {
        await tx.ledger_credit_settings.create({
          data: {
            ledger_id: ledgerId,
            credit_limit: creditSettings.credit_limit || null,
            credit_period_days: creditSettings.credit_period_days || 0,
            payment_terms: creditSettings.payment_terms || null,
            caution_deposit: creditSettings.caution_deposit || null,
          },
        });
      }

      if (taxSettings) {
        await tx.ledger_tax_settings.create({
          data: {
            ledger_id: ledgerId,
            trn: taxSettings.trn || null,
            tax_category_id: taxSettings.tax_category_id || null,
            type_of_supply: taxSettings.type_of_supply || null,
          },
        });
      }

      return this.getLedger(ledgerId);
    });
  },

  async updateLedger(id: number, payload: any, user?: string) {
    const ledger = await ledgerRepo.findById(id);
    if (!ledger) throw new NotFoundError('Ledger not found');

    const { bankDetails, creditSettings, taxSettings, ...masterData } = payload;

    if (masterData.contact_id) {
      const contact = await prisma.address_book.findUnique({
        where: { id: masterData.contact_id },
      });
      if (!contact) throw new ValidationError('Invalid contact_id: Contact does not exist');
    }

    return prisma.$transaction(async (tx) => {
      // Update Master
      await ledgerRepo.update(id, masterData, { user, tx });

      // Upsert Extensions
      if (bankDetails) {
        await tx.ledger_bank_details.upsert({
          where: { ledger_id: id },
          create: {
            ledger_id: id,
            bank_account_number: bankDetails.bank_account_number,
            iban: bankDetails.iban || null,
            swift_code: bankDetails.swift_code || null,
            bank_branch_name: bankDetails.bank_branch_name || null,
          },
          update: {
            bank_account_number: bankDetails.bank_account_number,
            iban: bankDetails.iban || null,
            swift_code: bankDetails.swift_code || null,
            bank_branch_name: bankDetails.bank_branch_name || null,
          },
        });
      }

      if (creditSettings) {
        await tx.ledger_credit_settings.upsert({
          where: { ledger_id: id },
          create: {
            ledger_id: id,
            credit_limit: creditSettings.credit_limit || null,
            credit_period_days: creditSettings.credit_period_days || 0,
            payment_terms: creditSettings.payment_terms || null,
            caution_deposit: creditSettings.caution_deposit || null,
          },
          update: {
            credit_limit: creditSettings.credit_limit,
            credit_period_days: creditSettings.credit_period_days,
            payment_terms: creditSettings.payment_terms,
            caution_deposit: creditSettings.caution_deposit,
          },
        });
      }

      if (taxSettings) {
        await tx.ledger_tax_settings.upsert({
          where: { ledger_id: id },
          create: {
            ledger_id: id,
            trn: taxSettings.trn || null,
            tax_category_id: taxSettings.tax_category_id || null,
            type_of_supply: taxSettings.type_of_supply || null,
          },
          update: {
            trn: taxSettings.trn,
            tax_category_id: taxSettings.tax_category_id,
            type_of_supply: taxSettings.type_of_supply,
          },
        });
      }

      return this.getLedger(id);
    });
  },

  async deleteLedger(id: number, user?: string) {
    const ledger = await ledgerRepo.findById(id);
    if (!ledger) throw new NotFoundError('Ledger not found');

    if (ledger.is_system_defined) {
      throw new ForbiddenError('System-defined ledgers cannot be deleted');
    }

    return ledgerRepo.delete(id, { user });
  },

  // ── Task 41: AccountGroup delete ─────────────────────────────
  async deleteAccountGroup(id: number, user?: string) {
    const group = await groupRepo.findById(id);
    if (!group) throw new NotFoundError('Account group not found');
    if (group.is_system_defined)
      throw new ForbiddenError('System-defined groups cannot be deleted');
    const children = await prisma.account_groups.count({ where: { parent_group_id: id } });
    if (children > 0) throw new ValidationError('Cannot delete group with child groups');
    const ledgers = await prisma.ledger_master.count({
      where: { account_group_id: id, is_active: true },
    });
    if (ledgers > 0) throw new ValidationError('Cannot delete group with linked ledgers');
    return groupRepo.delete(id, { user, hardDelete: true });
  },

  // ── Task 38-40: Ledger extension GET/PUT ─────────────────────
  async getLedgerBankDetails(ledgerId: number) {
    const row = await prisma.ledger_bank_details.findUnique({ where: { ledger_id: ledgerId } });
    if (!row) throw new NotFoundError('Bank details not found for this ledger');
    return row;
  },
  async upsertLedgerBankDetails(ledgerId: number, data: any, user?: string) {
    const ledger = await ledgerRepo.findById(ledgerId);
    if (!ledger) throw new NotFoundError('Ledger not found');
    return prisma.ledger_bank_details.upsert({
      where: { ledger_id: ledgerId },
      create: { ledger_id: ledgerId, ...data },
      update: data,
    });
  },

  async getLedgerCreditSettings(ledgerId: number) {
    const row = await prisma.ledger_credit_settings.findUnique({ where: { ledger_id: ledgerId } });
    if (!row) throw new NotFoundError('Credit settings not found for this ledger');
    return row;
  },
  async upsertLedgerCreditSettings(ledgerId: number, data: any, user?: string) {
    const ledger = await ledgerRepo.findById(ledgerId);
    if (!ledger) throw new NotFoundError('Ledger not found');
    return prisma.ledger_credit_settings.upsert({
      where: { ledger_id: ledgerId },
      create: { ledger_id: ledgerId, ...data },
      update: data,
    });
  },

  async getLedgerTaxSettings(ledgerId: number) {
    const row = await prisma.ledger_tax_settings.findUnique({ where: { ledger_id: ledgerId } });
    if (!row) throw new NotFoundError('Tax settings not found for this ledger');
    return row;
  },
  async upsertLedgerTaxSettings(ledgerId: number, data: any, user?: string) {
    const ledger = await ledgerRepo.findById(ledgerId);
    if (!ledger) throw new NotFoundError('Ledger not found');
    return prisma.ledger_tax_settings.upsert({
      where: { ledger_id: ledgerId },
      create: { ledger_id: ledgerId, ...data },
      update: data,
    });
  },

  // ── Task 42: Billwise Record list + update ────────────────────
  async createBillwise(data: any, user?: string) {
    return billwiseRepo.create(data, { user });
  },

  async getBillwise(id: number) {
    const record = await billwiseRepo.findById(id);
    if (!record) throw new NotFoundError('Billwise record not found');
    return record;
  },

  async listBillwiseByLedger(ledgerId: string, page = 1, limit = 50) {
    return billwiseRepo.findMany({ where: { LedgerID: ledgerId }, page, limit });
  },

  async updateBillwise(id: number, data: any, user?: string) {
    const record = await billwiseRepo.findById(id);
    if (!record) throw new NotFoundError('Billwise record not found');
    return billwiseRepo.update(id, data, { user });
  },

  // ── Task 43: Cheque Details list + update ────────────────────
  async createCheque(data: any, user?: string) {
    return chequeRepo.create(data, { user });
  },

  async getCheque(id: number) {
    const cheque = await chequeRepo.findById(id);
    if (!cheque) throw new NotFoundError('Cheque details not found');
    return cheque;
  },

  async listChequesByLedger(ledgerId: string, page = 1, limit = 50) {
    return chequeRepo.findMany({ where: { ledger_id: ledgerId }, page, limit });
  },

  async updateCheque(id: number, data: any, user?: string) {
    const cheque = await chequeRepo.findById(id);
    if (!cheque) throw new NotFoundError('Cheque details not found');
    return chequeRepo.update(id, data, { user });
  },
};

// ── Tasks 50-52: Outstanding & Aging ─────────────────────────────────────────
export const OutstandingService = {
  async getOutstanding(ledgerId: number) {
    const rows = await prisma.billwise_records.findMany({
      where: { LedgerID: String(ledgerId) },
      orderBy: { Due_Date: 'asc' },
    });

    const grouped: Record<string, any> = {};
    for (const r of rows) {
      const key = r.RefNo ?? String(r.id);
      if (!grouped[key]) {
        grouped[key] = {
          ref_no: r.RefNo,
          ref_prefix: r.RefPrefix,
          voucher_type: r.VoucherType,
          voucher_no: r.VoucherNo,
          voucher_prefix: r.voucherPrefix,
          due_date: r.Due_Date,
          original_amount: 0,
          paid_amount: 0,
        };
      }
      if (r.RefType === 'New Ref') {
        grouped[key].original_amount += Number(r.DebitAmount ?? 0) + Number(r.CreditAmount ?? 0);
      } else if (r.RefType === 'Agst Ref') {
        grouped[key].paid_amount += Number(r.DebitAmount ?? 0) + Number(r.CreditAmount ?? 0);
      }
    }

    const result = Object.values(grouped).map((g: any) => ({
      ...g,
      pending_amount: Math.max(0, g.original_amount - g.paid_amount),
    }));

    return result.filter((r: any) => r.pending_amount > 0);
  },

  async getAging(opts: { type: 'AR' | 'AP'; as_of_date: Date }) {
    const { as_of_date } = opts;

    const outstanding = await prisma.billwise_records.findMany({ where: { RefType: 'New Ref' } });
    const paid = await prisma.billwise_records.findMany({ where: { RefType: 'Agst Ref' } });

    const refAmounts: Record<string, number> = {};
    const agstAmounts: Record<string, number> = {};
    const dueDates: Record<string, Date | null> = {};

    for (const r of outstanding) {
      const key = r.RefNo ?? String(r.id);
      if (!refAmounts[key]) {
        refAmounts[key] = 0;
        dueDates[key] = r.Due_Date ? new Date(r.Due_Date) : null;
      }
      refAmounts[key] += Number(r.DebitAmount ?? 0) + Number(r.CreditAmount ?? 0);
    }
    for (const r of paid) {
      const key = r.RefNo ?? String(r.id);
      if (!agstAmounts[key]) agstAmounts[key] = 0;
      agstAmounts[key] += Number(r.DebitAmount ?? 0) + Number(r.CreditAmount ?? 0);
    }

    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '91-180': 0, '180+': 0 };
    for (const key of Object.keys(refAmounts)) {
      const pending = Math.max(0, refAmounts[key] - (agstAmounts[key] ?? 0));
      if (pending === 0) continue;
      const dueDate = dueDates[key] ?? as_of_date;
      const daysDiff = Math.floor((as_of_date.getTime() - dueDate.getTime()) / 86400000);
      if (daysDiff <= 30) buckets['0-30'] += pending;
      else if (daysDiff <= 60) buckets['31-60'] += pending;
      else if (daysDiff <= 90) buckets['61-90'] += pending;
      else if (daysDiff <= 180) buckets['91-180'] += pending;
      else buckets['180+'] += pending;
    }

    return { type: opts.type, as_of_date, buckets };
  },
};

export const LedgerBalanceService = {
  /**
   * Computes the effective balance for a ledger: opening_balance + sum(debit) - sum(credit).
   */
  async getEffectiveBalance(ledgerId: number): Promise<Prisma.Decimal> {
    const ledger = await prisma.ledger_master.findUnique({
      where: { id: ledgerId },
    });

    if (!ledger) {
      throw new NotFoundError('Ledger not found');
    }

    // Parse opening balance safely
    const opBalStr = ledger.Opening_Balance ? String(ledger.Opening_Balance).trim() : '0';
    let openingBalance = toDecimal(0);
    try {
      // The opening balance can be "1000 Dr" or "500 Cr". Handle suffix:
      if (opBalStr.toLowerCase().endsWith('cr')) {
        openingBalance = toDecimal(parseFloat(opBalStr)).negated();
      } else {
        openingBalance = toDecimal(parseFloat(opBalStr) || 0);
      }
    } catch {
      openingBalance = toDecimal(0);
    }

    // Sum journal ledger transactions
    const ledgerAggregates = await prisma.journal_ledger.aggregate({
      where: { ledger_id: ledgerId },
      _sum: {
        debit_amount: true,
        credit_amount: true,
      },
    });

    const totalDebits = toDecimal(ledgerAggregates._sum.debit_amount || 0);
    const totalCredits = toDecimal(ledgerAggregates._sum.credit_amount || 0);

    // Balance = OpeningBalance + Debits - Credits
    return openingBalance.add(totalDebits).sub(totalCredits);
  },
};
export default AccountsService;
