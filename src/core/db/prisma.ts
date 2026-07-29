import { Prisma, PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  });

  // Query events (high volume — gated by LOG_DB_QUERIES)
  if (config.LOG_DB_QUERIES) {
    client.$on('query', (e: Prisma.QueryEvent) => {
      const entry = {
        type: 'db_query' as const,
        query: e.query,
        // Params may contain PII; omit in production
        params: config.NODE_ENV === 'production' ? undefined : truncate(e.params, 500),
        durationMs: e.duration,
        target: e.target,
      };

      if (e.duration >= config.LOG_SLOW_QUERY_MS) {
        logger.warn({ ...entry, slow: true });
      } else {
        logger.debug(entry);
      }
    });
  }

  client.$on('warn', (e: Prisma.LogEvent) => {
    logger.warn({
      type: 'db_warn',
      message: e.message,
      target: e.target,
    });
  });

  client.$on('error', (e: Prisma.LogEvent) => {
    logger.error({
      type: 'db_error',
      message: e.message,
      target: e.target,
    });
  });

  return client;
}

function truncate(value: string, max: number): string {
  if (!value || value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
