import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { verifyPassword, hashPassword } from './password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './jwt';
import { UnauthorizedError, ValidationError } from '../errors/AppError';
import { ApiResponse } from '../types';
import auditService from '../audit/auditService';
import { logger } from '../utils/logger';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});

export const authController = {
  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const log = req.log || logger;

      log.info({
        type: 'auth',
        event: 'login_attempt',
        username,
        requestId: req.requestId,
      });

      // Find user
      const user = await prisma.user_credentials.findUnique({
        where: { username },
        include: {
          user_roles: true,
        },
      });

      if (!user || !user.is_active) {
        log.warn({
          type: 'auth',
          event: 'login_failure',
          username,
          reason: 'invalid_credentials',
          requestId: req.requestId,
        });
        throw new UnauthorizedError('Invalid username or password');
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        // Log failed attempt
        log.warn({
          type: 'auth',
          event: 'login_failure',
          username,
          userId: user.id,
          reason: 'invalid_credentials',
          requestId: req.requestId,
        });
        await auditService.log('LOGIN', 'FAILURE', { username }, user.id);
        throw new UnauthorizedError('Invalid username or password');
      }

      // Resolve companyId from branch
      let companyId: number | null = null;
      if (user.branch_id) {
        const branch = await prisma.branch.findUnique({
          where: { id: user.branch_id },
        });
        if (branch) {
          companyId = branch.company_id;
        }
      }

      // Fallback: If no companyId resolved, use the first company profile
      if (companyId === null) {
        const company = await prisma.companyprofile.findFirst();
        if (company) {
          companyId = company.id;
        }
      }

      const payload = {
        userId: user.id,
        username: user.username,
        roleId: user.role_id,
        branchId: user.branch_id,
        companyId,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Update last login
      await prisma.user_credentials.update({
        where: { id: user.id },
        data: { last_login_at: new Date() },
      });

      // Audit successful login
      await auditService.log('LOGIN', 'SUCCESS', { username }, user.id);

      log.info({
        type: 'auth',
        event: 'login_success',
        username,
        userId: user.id,
        requestId: req.requestId,
      });

      const response: ApiResponse<any> = {
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            username: user.username,
            roleId: user.role_id,
            roleName: user.user_roles.role_name,
            branchId: user.branch_id,
            companyId,
          },
        },
        requestId: req.requestId,
      };

      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const log = req.log || logger;

      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        log.warn({
          type: 'auth',
          event: 'refresh_failure',
          reason: 'invalid_token',
          requestId: req.requestId,
        });
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      // Verify user still exists and is active
      const user = await prisma.user_credentials.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.is_active) {
        log.warn({
          type: 'auth',
          event: 'refresh_failure',
          userId: decoded.userId,
          reason: 'user_inactive',
          requestId: req.requestId,
        });
        throw new UnauthorizedError('User is no longer active');
      }

      const payload = {
        userId: user.id,
        username: user.username,
        roleId: user.role_id,
        branchId: user.branch_id,
        companyId: decoded.companyId,
      };

      const accessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      log.info({
        type: 'auth',
        event: 'refresh_success',
        userId: user.id,
        requestId: req.requestId,
      });

      const response: ApiResponse<any> = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
        requestId: req.requestId,
      };

      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 44: GET /auth/me ────────────────────────────────────
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError('Not authenticated');

      const user = await prisma.user_credentials.findUnique({
        where: { id: userId },
        include: { user_roles: true },
      });

      if (!user || !user.is_active) throw new UnauthorizedError('User not found or inactive');

      let companyId = req.user?.companyId;
      if (!companyId && user.branch_id) {
        const branch = await prisma.branch.findUnique({
          where: { id: user.branch_id },
        });
        if (branch) {
          companyId = branch.company_id;
        }
      }
      if (!companyId) {
        const company = await prisma.companyprofile.findFirst();
        if (company) {
          companyId = company.id;
        }
      }

      // financialyear may be missing on older DBs (schema drift) — never fail /auth/me for that
      let activeFY: {
        id: number;
        fy_code: string;
        display_name: string;
        start_date: Date;
        end_date: Date;
        status: string;
      } | null = null;
      if (companyId) {
        try {
          activeFY =
            (await prisma.financialyear.findFirst({
              where: { company_id: companyId, is_default: true },
            })) ||
            (await prisma.financialyear.findFirst({
              where: { company_id: companyId },
              orderBy: { start_date: 'desc' },
            }));
        } catch {
          activeFY = null;
        }
      }

      const permissions = user.role_id
        ? await prisma.user_access_permissions.findMany({
            where: { role_id: user.role_id },
          })
        : [];

      const response: ApiResponse<any> = {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          roleId: user.role_id,
          roleName: user.user_roles?.role_name ?? null,
          branchId: user.branch_id,
          companyId,
          lastLoginAt: user.last_login_at,
          activeFinancialYear: activeFY
            ? {
                id: activeFY.id,
                fyCode: activeFY.fy_code,
                displayName: activeFY.display_name,
                startDate: activeFY.start_date,
                endDate: activeFY.end_date,
                status: activeFY.status,
              }
            : null,
          permissions: permissions.map((p) => ({
            module_name: p.module_name || '',
            Allow_Create: !!p.Allow_Create,
            Allow_Read: !!p.Allow_Read,
            Allow_Update: !!p.Allow_Update,
            Allow_Delete: !!p.Allow_Delete,
            Allow_Share: !!p.Allow_Share,
          })),
        },
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── BE-001: GET /auth/permissions ────────────────────────────
  async permissions(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = req.user?.roleId;
      if (!roleId) throw new UnauthorizedError('Not authenticated');

      const permissions = await prisma.user_access_permissions.findMany({
        where: { role_id: roleId },
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          permissions: permissions.map(p => ({
            module_name: p.module_name || '',
            Allow_Create: !!p.Allow_Create,
            Allow_Read: !!p.Allow_Read,
            Allow_Update: !!p.Allow_Update,
            Allow_Delete: !!p.Allow_Delete,
            Allow_Share: !!p.Allow_Share,
          })),
        },
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 45: POST /auth/change-password ───────────────────────
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError('Not authenticated');

      const log = req.log || logger;
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user_credentials.findUnique({ where: { id: userId } });
      if (!user) throw new UnauthorizedError('User not found');

      const valid = await verifyPassword(currentPassword, user.password_hash);
      if (!valid) {
        log.warn({
          type: 'auth',
          event: 'change_password_failure',
          userId,
          reason: 'current_password_incorrect',
          requestId: req.requestId,
        });
        throw new ValidationError('Current password is incorrect');
      }

      const newHash = await hashPassword(newPassword);
      await prisma.user_credentials.update({
        where: { id: userId },
        data: { password_hash: newHash },
      });

      await auditService.log('CHANGE_PASSWORD', 'SUCCESS', { userId }, userId);

      log.info({
        type: 'auth',
        event: 'change_password_success',
        userId,
        requestId: req.requestId,
      });

      return res
        .status(200)
        .json({
          success: true,
          message: 'Password changed successfully',
          requestId: req.requestId,
        });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 46: POST /auth/logout ────────────────────────────────
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const log = req.log || logger;
      if (userId) {
        await auditService.log('LOGOUT', 'SUCCESS', {}, userId);
        log.info({
          type: 'auth',
          event: 'logout',
          userId,
          requestId: req.requestId,
        });
      }
      return res
        .status(200)
        .json({ success: true, message: 'Logged out successfully', requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
};
