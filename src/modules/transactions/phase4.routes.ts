import { Router } from 'express';
import { Phase4Controller } from './phase4.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { validate } from '../../core/middleware/validate';
import {
  quotationPostSchema,
  salesOrderPostSchema,
  purchaseOrderPostSchema,
  godownTransferPostSchema,
  deliveryNotePostSchema,
  receiptNotePostSchema,
  materialInPostSchema,
  requirementPostSchema,
  stockRequestPostSchema,
  ledgerStatementQuerySchema,
  trialBalanceQuerySchema,
  financialReportQuerySchema,
} from './phase4.schema';

const router = Router();

// Apply authentication middleware globally to all routes
router.use(authenticate);

// Quotation routes
router.post(
  '/quotation',
  authorize('Quotation', 'create'),
  validate(quotationPostSchema),
  Phase4Controller.postQuotation,
);

router.put(
  '/quotation/:id/status',
  authorize('Quotation', 'update'),
  Phase4Controller.updateQuotationStatus,
);

// Sales Order routes
router.post(
  '/sales-order',
  authorize('SalesOrder', 'create'),
  validate(salesOrderPostSchema),
  Phase4Controller.postSalesOrder,
);

// Purchase Order routes
router.post(
  '/purchase-order',
  authorize('PurchaseOrder', 'create'),
  zodCustomValidate(purchaseOrderPostSchema), // fallback or standard validate
  Phase4Controller.postPurchaseOrder,
);

function zodCustomValidate(schema: any) {
  return validate(schema);
}

// Godown Transfer routes
router.post(
  '/godown-transfer',
  authorize('GodownTransfer', 'create'),
  validate(godownTransferPostSchema),
  Phase4Controller.postGodownTransfer,
);

// Delivery Note routes
router.post(
  '/delivery-note',
  authorize('DeliveryNote', 'create'),
  validate(deliveryNotePostSchema),
  Phase4Controller.postDeliveryNote,
);

// Receipt Note routes
router.post(
  '/receipt-note',
  authorize('ReceiptNote', 'create'),
  validate(receiptNotePostSchema),
  Phase4Controller.postReceiptNote,
);

// Pending quantities helper route
router.get(
  '/pending-quantities/:id',
  authorize('DeliveryNote', 'read'),
  Phase4Controller.getPendingQuantities,
);

// Material In routes
router.post(
  '/material-in',
  authorize('MaterialIn', 'create'),
  validate(materialInPostSchema),
  Phase4Controller.postMaterialIn,
);

// Requirement routes
router.post(
  '/requirement',
  authorize('Requirement', 'create'),
  validate(requirementPostSchema),
  Phase4Controller.postRequirement,
);

// Stock Request routes
router.post(
  '/stock-request',
  authorize('StockRequest', 'create'),
  validate(stockRequestPostSchema),
  Phase4Controller.postStockRequest,
);

router.post(
  '/stock-request/:id/fulfill',
  authorize('StockRequest', 'update'),
  Phase4Controller.fulfillStockRequest,
);

// Journal Ledger reports routes
router.get(
  '/reports/ledger-statement',
  authorize('JournalLedger', 'read'),
  validate(ledgerStatementQuerySchema),
  Phase4Controller.getLedgerStatement,
);

router.get(
  '/reports/trial-balance',
  authorize('JournalLedger', 'read'),
  validate(trialBalanceQuerySchema),
  Phase4Controller.getTrialBalance,
);

router.get(
  '/reports/profit-loss',
  authorize('JournalLedger', 'read'),
  validate(financialReportQuerySchema),
  Phase4Controller.getProfitAndLoss,
);

router.get(
  '/reports/balance-sheet',
  authorize('JournalLedger', 'read'),
  Phase4Controller.getBalanceSheet,
);

router.get('/reports/day-book', authorize('JournalLedger', 'read'), Phase4Controller.getDayBook);

// Posting-owned entity read endpoints
router.get(
  '/shipment/:voucherHeaderId',
  authorize('Transactions', 'read'),
  Phase4Controller.getShipment,
);

router.get(
  '/physical-specs/:detailLineId',
  authorize('Transactions', 'read'),
  Phase4Controller.listPhysicalSpecs,
);

router.get(
  '/line-allocations/:detailLineId',
  authorize('Transactions', 'read'),
  Phase4Controller.listLineAllocations,
);

export const phase4Routes = router;
export default router;
