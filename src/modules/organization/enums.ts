export enum FinancialYearStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  LOCKED = 'Locked',
}

export enum ConfigDataType {
  STRING = 'string',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  JSON = 'json',
  DATE = 'date',
}

export enum AuditLogAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
  APPROVE = 'APPROVE',
  CANCEL = 'CANCEL',
  OTHER = 'OTHER',
}

export enum ContactType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
  VENDOR = 'VENDOR',
  EMPLOYEE = 'EMPLOYEE',
  OTHER = 'OTHER',
}
