import { Router } from 'express';
import { AccountsController } from './accounts.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { validate } from '../../core/middleware/validate';
import {
  accountGroupSchema,
  ledgerMasterSchema,
  billwiseSchema,
  chequeSchema,
} from './accounts.schema';

const router = Router();
router.use(authenticate);

// ── Account Groups ───────────────────────────────────────────
router.get('/groups', authorize('Accounts', 'read'), AccountsController.listAccountGroups);
router.get('/groups/:id', authorize('Accounts', 'read'), AccountsController.getAccountGroup);
router.post(
  '/groups',
  authorize('Accounts', 'create'),
  validate(accountGroupSchema),
  AccountsController.createAccountGroup,
);
router.put(
  '/groups/:id',
  authorize('Accounts', 'update'),
  validate(accountGroupSchema),
  AccountsController.updateAccountGroup,
);
router.delete(
  '/groups/:id',
  authorize('Accounts', 'delete'),
  AccountsController.deleteAccountGroup,
); // task 41

// ── Ledgers ──────────────────────────────────────────────────
router.get('/ledgers', authorize('Accounts', 'read'), AccountsController.listLedgers);
router.get('/ledgers/:id', authorize('Accounts', 'read'), AccountsController.getLedger);
router.post(
  '/ledgers',
  authorize('Accounts', 'create'),
  validate(ledgerMasterSchema),
  AccountsController.createLedger,
);
router.put(
  '/ledgers/:id',
  authorize('Accounts', 'update'),
  validate(ledgerMasterSchema),
  AccountsController.updateLedger,
);
router.delete('/ledgers/:id', authorize('Accounts', 'delete'), AccountsController.deleteLedger);

// ── Ledger Balance ───────────────────────────────────────────
router.get(
  '/ledgers/:id/balance',
  authorize('Accounts', 'read'),
  AccountsController.getLedgerBalance,
);

// ── Ledger Extension Tables (tasks 38-40) ────────────────────
router.get(
  '/ledgers/:id/bank',
  authorize('Accounts', 'read'),
  AccountsController.getLedgerBankDetails,
);
router.put(
  '/ledgers/:id/bank',
  authorize('Accounts', 'update'),
  AccountsController.upsertLedgerBankDetails,
);

router.get(
  '/ledgers/:id/credit',
  authorize('Accounts', 'read'),
  AccountsController.getLedgerCreditSettings,
);
router.put(
  '/ledgers/:id/credit',
  authorize('Accounts', 'update'),
  AccountsController.upsertLedgerCreditSettings,
);

router.get(
  '/ledgers/:id/tax',
  authorize('Accounts', 'read'),
  AccountsController.getLedgerTaxSettings,
);
router.put(
  '/ledgers/:id/tax',
  authorize('Accounts', 'update'),
  AccountsController.upsertLedgerTaxSettings,
);

// ── Billwise Records (task 42) ───────────────────────────────
router.get(
  '/billwise/ledger/:ledgerId',
  authorize('Accounts', 'read'),
  AccountsController.listBillwiseByLedger,
);
router.get('/billwise/:id', authorize('Accounts', 'read'), AccountsController.getBillwise);
router.post(
  '/billwise',
  authorize('Accounts', 'create'),
  validate(billwiseSchema),
  AccountsController.createBillwise,
);
router.put('/billwise/:id', authorize('Accounts', 'update'), AccountsController.updateBillwise);

// ── Cheque Details (task 43) ─────────────────────────────────
router.get(
  '/cheque/ledger/:ledgerId',
  authorize('Accounts', 'read'),
  AccountsController.listChequesByLedger,
);
router.get('/cheque/:id', authorize('Accounts', 'read'), AccountsController.getCheque);
router.post(
  '/cheque',
  authorize('Accounts', 'create'),
  validate(chequeSchema),
  AccountsController.createCheque,
);
router.put('/cheque/:id', authorize('Accounts', 'update'), AccountsController.updateCheque);

// ── Outstanding & Aging (tasks 50-52) ───────────────────────
router.get(
  '/outstanding/:ledgerId',
  authorize('Accounts', 'read'),
  AccountsController.getOutstanding,
);
router.get('/aging', authorize('Accounts', 'read'), AccountsController.getAging);

export const accountsRoutes = router;
export default router;
