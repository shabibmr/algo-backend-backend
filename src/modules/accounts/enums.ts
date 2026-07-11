export enum NatureType {
  ASSETS = 'Assets',
  LIABILITIES = 'Liabilities',
  INCOME = 'Income',
  EXPENSE = 'Expense',
  CAPITAL = 'Capital',
}

export enum GroupBehavior {
  DEBIT = 'Debit',
  CREDIT = 'Credit',
}

export enum LedgerType {
  SUNDRY_DEBTOR = 'SundryDebtor',
  SUNDRY_CREDITOR = 'SundryCreditor',
  BANK = 'Bank',
  CASH = 'Cash',
  EXPENSE = 'Expense',
  INCOME = 'Income',
  TAX = 'Tax',
  FIXED_ASSET = 'FixedAsset',
  CAPITAL = 'Capital',
  DUTY_TAX = 'DutyTax',
  STOCK = 'Stock',
  OTHER = 'Other',
}

export enum RefType {
  NEW_REF = 'New Ref',
  AGST_REF = 'Agst Ref',
  ADV = 'Advance',
  ON_ACCT = 'On Account',
}

export enum InstrumentType {
  CHEQUE = 'Cheque',
  DD = 'DD',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  OTHER = 'Other',
}
