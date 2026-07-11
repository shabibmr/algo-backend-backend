import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth/jwt';
import { UnauthorizedError } from '../errors/AppError';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const user = verifyAccessToken(token);
    req.user = user;
    req.tenant = {
      companyId: user.companyId,
      branchId: user.branchId,
    };
    next();
  } catch (err: any) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
