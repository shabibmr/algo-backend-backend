export interface AuthUser {
  userId: number;
  username: string;
  roleId: number;
  branchId: number | null;
  companyId: number | null;
}

export interface TenantContext {
  companyId: number | null;
  branchId: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  requestId?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Extend Express Request type to include authUser, tenantContext, and requestId
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenant?: TenantContext;
      requestId?: string;
    }
  }
}
