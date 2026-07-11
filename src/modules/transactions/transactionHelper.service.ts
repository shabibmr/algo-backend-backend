import { Prisma } from '@prisma/client';
import { logger } from '../../core/utils/logger';

export const TransactionHelperService = {
  /**
   * Generates a unique, sequential voucher number inside an interactive transaction.
   * Uses pessimistic InnoDB row locking (SELECT ... FOR UPDATE) to ensure no collisions.
   */
  async generateNextNumber(
    tx: Prisma.TransactionClient,
    voucherType: string,
    voucherPrefix: string,
    financialYear: string,
  ): Promise<string> {
    logger.debug({
      message: 'Generating voucher number',
      voucherType,
      voucherPrefix,
      financialYear,
    });

    // 1. SELECT ... FOR UPDATE (pessimistic lock)
    let rows = await tx.$queryRaw<any[]>`
      SELECT * FROM transactionhelper
      WHERE voucher_type = ${voucherType}
        AND voucher_prefix = ${voucherPrefix}
        AND financial_year = ${financialYear}
      FOR UPDATE
    `;

    // 2. If no sequence row exists, initialize it
    if (rows.length === 0) {
      try {
        await tx.$executeRaw`
          INSERT INTO transactionhelper (
            voucher_type,
            voucher_prefix,
            financial_year,
            last_number,
            number_length,
            prefix_separator,
            reset_yearly,
            is_active
          ) VALUES (
            ${voucherType},
            ${voucherPrefix},
            ${financialYear},
            0,
            5,
            '/',
            1,
            1
          )
        `;
      } catch (err: any) {
        // If another transaction inserted it concurrently, ignore duplicate key error
        logger.debug({
          message: 'Conflict on transactionhelper insert, retrying lock',
          error: err.message,
        });
      }

      // Query and lock again after insertion
      rows = await tx.$queryRaw<any[]>`
        SELECT * FROM transactionhelper
        WHERE voucher_type = ${voucherType}
          AND voucher_prefix = ${voucherPrefix}
          AND financial_year = ${financialYear}
        FOR UPDATE
      `;

      if (rows.length === 0) {
        throw new Error('Failed to lock sequence number after initialization');
      }
    }

    const row = rows[0];
    const nextVal = row.last_number + 1;

    // 3. Format the number: prefix + separator + zeroPad(next_number, number_length)
    const len = row.number_length || 5;
    const sep = row.prefix_separator || '/';
    const paddedNum = String(nextVal).padStart(len, '0');
    const formattedNo = `${voucherPrefix}${sep}${paddedNum}`;

    // 4. Update the last_number in the locked row
    await tx.$executeRaw`
      UPDATE transactionhelper
      SET last_number = ${nextVal}
      WHERE id = ${row.id}
    `;

    logger.debug({
      message: 'Generated voucher number successfully',
      formattedNo,
      sequence: nextVal,
    });

    return formattedNo;
  },
};

export default TransactionHelperService;
