import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { validate } from '../../core/middleware/validate';
import {
  salesInvoicePostSchema,
  purchaseInvoicePostSchema,
  cashBankVoucherPostSchema,
  contraVoucherPostSchema,
  journalVoucherPostSchema,
  noteVoucherPostSchema,
} from './transactions.schema';

const router = Router();

// Apply authentication to all transaction routes
router.use(authenticate);

// Sales Invoice posting
router.post(
  '/sales-invoice',
  authorize('SalesInvoice', 'create'),
  validate(salesInvoicePostSchema),
  TransactionsController.postSalesInvoice,
);

// Purchase Invoice posting
router.post(
  '/purchase-invoice',
  authorize('PurchaseInvoice', 'create'),
  validate(purchaseInvoicePostSchema),
  TransactionsController.postPurchaseInvoice,
);

// Payment Voucher posting
router.post(
  '/payment',
  authorize('PaymentVoucher', 'create'),
  validate(cashBankVoucherPostSchema),
  TransactionsController.postPaymentVoucher,
);

// Receipt Voucher posting
router.post(
  '/receipt',
  authorize('ReceiptVoucher', 'create'),
  validate(cashBankVoucherPostSchema),
  TransactionsController.postReceiptVoucher,
);

// Contra Voucher posting
router.post(
  '/contra',
  authorize('ContraVoucher', 'create'),
  validate(contraVoucherPostSchema),
  TransactionsController.postContraVoucher,
);

// Journal Voucher posting
router.post(
  '/journal',
  authorize('JournalVoucher', 'create'),
  validate(journalVoucherPostSchema),
  TransactionsController.postJournalVoucher,
);

// Credit Note posting
router.post(
  '/credit-note',
  authorize('CreditNote', 'create'),
  validate(noteVoucherPostSchema),
  TransactionsController.postCreditNote,
);

// Debit Note posting
router.post(
  '/debit-note',
  authorize('DebitNote', 'create'),
  validate(noteVoucherPostSchema),
  TransactionsController.postDebitNote,
);

export const transactionsRoutes = router;
export default router;
