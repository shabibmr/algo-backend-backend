export enum VoucherType {
  QUOTATION = 'Quotation',
  SALES_ORDER = 'SalesOrder',
  PURCHASE_ORDER = 'PurchaseOrder',
  PURCHASE_INVOICE = 'PurchaseInvoice',
  SALES_INVOICE = 'SalesInvoice',
  PAYMENT = 'Payment',
  RECEIPT = 'Receipt',
  JOURNAL = 'Journal',
  GODOWN_TRANSFER = 'GodownTransfer',
  DEBIT_NOTE = 'DebitNote',
  CREDIT_NOTE = 'CreditNote',
  DELIVERY_NOTE = 'DeliveryNote',
  RECEIPT_NOTE = 'ReceiptNote',
}

export enum VoucherStatus {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  POSTED = 'Posted',
  CANCELLED = 'Cancelled',
  CLOSED = 'Closed',
}

export enum AllocationType {
  EXPENSE = 'EXPENSE',
  DISCOUNT = 'DISCOUNT',
  TAX = 'TAX',
  CHARGE = 'CHARGE',
  REBATE = 'REBATE',
}

export enum AllocationMethod {
  BY_VALUE = 'BYVALUE',
  BY_QUANTITY = 'BYQUANTITY',
  BY_WEIGHT = 'BYWEIGHT',
  BY_VOLUME = 'BYVOLUME',
  MANUAL = 'MANUAL',
}
