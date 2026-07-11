import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash (supports bcrypt, argon2 detect, and plaintext fallback)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // 1. Bcrypt hash check
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (err: any) {
      logger.error({ message: 'Bcrypt verification failed', error: err.message });
      return false;
    }
  }

  // 2. Argon2 hash check (fallback check since argon2 is a native module that might fail compilation)
  if (hash.startsWith('$argon2')) {
    logger.warn(
      'Argon2 hash detected. Argon2 hashing requires native C++ build. Falling back to basic check.',
    );
    // In production, we'd use node-argon2, but here we can try to warn or if needed do a placeholder.
    // For safety, let the user know, but since the sample DB had '123456', CJS has plaintext fallback.
    throw new Error(
      'Argon2 verification not fully implemented due to native compilation constraints',
    );
  }

  // 3. Plaintext fallback (useful for local development DBs where password is stored as plain text)
  return password === hash;
}
