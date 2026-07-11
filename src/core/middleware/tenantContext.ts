import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../types';

export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction) {
  // If req.tenant is already set by authenticate middleware, we keep it.
  // Otherwise, we read from headers for potential unauthenticated/api routes.
  if (!req.tenant) {
    const companyId = req.headers['x-company-id'] ? Number(req.headers['x-company-id']) : null;
    const branchId = req.headers['x-branch-id'] ? Number(req.headers['x-branch-id']) : null;

    req.tenant = {
      companyId: isNaN(companyId as number) ? null : companyId,
      branchId: isNaN(branchId as number) ? null : branchId,
    };
  }

  next();
}

/**
 * Scopes a Prisma query where clause by injecting company_id and/or branch_id
 * if they are configured on the model and present in the tenant context.
 */
export function scopeTenant(
  whereClause: any,
  tenant: TenantContext | undefined,
  fields: { companyField?: string; branchField?: string } = {
    companyField: 'company_id',
    branchField: 'branch_id',
  },
): any {
  if (!tenant) return whereClause;

  const scoped = { ...whereClause };

  if (tenant.companyId !== null && fields.companyField) {
    scoped[fields.companyField] = tenant.companyId;
  }

  if (tenant.branchId !== null && fields.branchField) {
    scoped[fields.branchField] = tenant.branchId;
  }

  return scoped;
}
