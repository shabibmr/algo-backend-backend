import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthUser } from '../types';

export interface TokenPayload {
  userId: number;
  username: string;
  roleId: number;
  branchId: number | null;
  companyId: number | null;
}

/**
 * Generate Access Token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

/**
 * Generate Refresh Token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token: string): AuthUser {
  const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
  return {
    userId: decoded.userId,
    username: decoded.username,
    roleId: decoded.roleId,
    branchId: decoded.branchId,
    companyId: decoded.companyId,
  };
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
}
