import { Router } from 'express';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { VoucherReadController } from './voucherRead.controller';
import { VoucherExportController } from './voucherExport.controller';

const router = Router();
router.use(authenticate);

// ── 5A: Core posting vouchers ─────────────────────────────────────────────────

router.get(
  '/sales-invoices',
  authorize('SalesInvoice', 'read'),
  VoucherReadController.listSalesInvoices,
);
router.get(
  '/sales-invoices/:id',
  authorize('SalesInvoice', 'read'),
  VoucherReadController.getSalesInvoice,
);
router.get(
  '/sales-invoices/:id/pdf',
  authorize('SalesInvoice', 'read'),
  VoucherExportController.printSalesInvoice,
);
router.post(
  '/sales-invoices/:id/share',
  authorize('SalesInvoice', 'read'),
  VoucherExportController.shareSalesInvoice,
);

router.get(
  '/purchase-invoices',
  authorize('PurchaseInvoice', 'read'),
  VoucherReadController.listPurchaseInvoices,
);
router.get(
  '/purchase-invoices/:id',
  authorize('PurchaseInvoice', 'read'),
  VoucherReadController.getPurchaseInvoice,
);

router.get('/payments', authorize('PaymentVoucher', 'read'), VoucherReadController.listPayments);
router.get('/payments/:id', authorize('PaymentVoucher', 'read'), VoucherReadController.getPayment);

router.get('/receipts', authorize('ReceiptVoucher', 'read'), VoucherReadController.listReceipts);
router.get('/receipts/:id', authorize('ReceiptVoucher', 'read'), VoucherReadController.getReceipt);

router.get('/contra', authorize('ContraVoucher', 'read'), VoucherReadController.listContra);
router.get('/contra/:id', authorize('ContraVoucher', 'read'), VoucherReadController.getContra);

router.get('/journals', authorize('JournalVoucher', 'read'), VoucherReadController.listJournals);
router.get('/journals/:id', authorize('JournalVoucher', 'read'), VoucherReadController.getJournal);

router.get('/credit-notes', authorize('CreditNote', 'read'), VoucherReadController.listCreditNotes);
router.get(
  '/credit-notes/:id',
  authorize('CreditNote', 'read'),
  VoucherReadController.getCreditNote,
);

router.get('/debit-notes', authorize('DebitNote', 'read'), VoucherReadController.listDebitNotes);
router.get('/debit-notes/:id', authorize('DebitNote', 'read'), VoucherReadController.getDebitNote);

// ── 5B: Order / stock vouchers ────────────────────────────────────────────────

router.get('/quotations', authorize('Quotation', 'read'), VoucherReadController.listQuotations);
router.get('/quotations/:id', authorize('Quotation', 'read'), VoucherReadController.getQuotation);

router.get('/sales-orders', authorize('SalesOrder', 'read'), VoucherReadController.listSalesOrders);
router.get(
  '/sales-orders/:id',
  authorize('SalesOrder', 'read'),
  VoucherReadController.getSalesOrder,
);

router.get(
  '/purchase-orders',
  authorize('PurchaseOrder', 'read'),
  VoucherReadController.listPurchaseOrders,
);
router.get(
  '/purchase-orders/:id',
  authorize('PurchaseOrder', 'read'),
  VoucherReadController.getPurchaseOrder,
);

router.get(
  '/delivery-notes',
  authorize('DeliveryNote', 'read'),
  VoucherReadController.listDeliveryNotes,
);
router.get(
  '/delivery-notes/:id',
  authorize('DeliveryNote', 'read'),
  VoucherReadController.getDeliveryNote,
);

router.get(
  '/receipt-notes',
  authorize('ReceiptNote', 'read'),
  VoucherReadController.listReceiptNotes,
);
router.get(
  '/receipt-notes/:id',
  authorize('ReceiptNote', 'read'),
  VoucherReadController.getReceiptNote,
);

router.get(
  '/godown-transfers',
  authorize('GodownTransfer', 'read'),
  VoucherReadController.listGodownTransfers,
);
router.get(
  '/godown-transfers/:id',
  authorize('GodownTransfer', 'read'),
  VoucherReadController.getGodownTransfer,
);

// ── 5C: Internal stock vouchers ───────────────────────────────────────────────

router.get('/material-in', authorize('MaterialIn', 'read'), VoucherReadController.listMaterialIn);
router.get(
  '/material-in/:id',
  authorize('MaterialIn', 'read'),
  VoucherReadController.getMaterialIn,
);

router.get(
  '/requirements',
  authorize('Requirement', 'read'),
  VoucherReadController.listRequirements,
);
router.get(
  '/requirements/:id',
  authorize('Requirement', 'read'),
  VoucherReadController.getRequirement,
);

router.get(
  '/stock-requests',
  authorize('StockRequest', 'read'),
  VoucherReadController.listStockRequests,
);
router.get(
  '/stock-requests/:id',
  authorize('StockRequest', 'read'),
  VoucherReadController.getStockRequest,
);

// ── 5D: VoucherHeader generic lookup ──────────────────────────────────────────

router.get(
  '/voucher-header/:id',
  authorize('Transactions', 'read'),
  VoucherReadController.getVoucherHeader,
);

// ── Phase 6: Linkage & line-relation reads ────────────────────────────────────

router.get(
  '/linkages/:voucherHeaderId',
  authorize('Transactions', 'read'),
  VoucherReadController.getVoucherLinkages,
);
router.get(
  '/line-relations/:detailLineId',
  authorize('Transactions', 'read'),
  VoucherReadController.getLineRelations,
);

export const voucherReadRoutes = router;
export default router;
