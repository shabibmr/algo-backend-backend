import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

export const auditService = {
  /**
   * Log an operational action to the database log table
   */
  async log(
    action: string,
    status: string,
    data: any,
    userId?: number | string | null,
    tx?: any,
  ): Promise<void> {
    const client = tx || prisma;
    const client_id = userId ? String(userId).substring(0, 10) : null;
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);

    try {
      await client.log.create({
        data: {
          action,
          status,
          data: dataStr,
          client_id,
        },
      });
    } catch (err: any) {
      // Don't fail the primary transaction/flow if auditing fails, but log it
      logger.error({
        message: 'Audit logging failed',
        error: err.message,
        action,
        status,
      });
    }
  },
};
export default auditService;
