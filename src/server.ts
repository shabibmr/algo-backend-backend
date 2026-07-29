import app from './app';
import { config } from './config';
import { prisma } from './core/db/prisma';
import { getLogDir, logger } from './core/utils/logger';

const server = app.listen(config.PORT, async () => {
  logger.info({
    type: 'lifecycle',
    event: 'start',
    port: config.PORT,
    nodeEnv: config.NODE_ENV,
    logLevel: config.LOG_LEVEL,
    logDir: config.LOG_TO_FILE ? getLogDir() : null,
    logToFile: config.LOG_TO_FILE,
  });

  try {
    // Test database connection on startup
    await prisma.$connect();
    logger.info({
      type: 'lifecycle',
      event: 'db_connected',
      database: config.DATABASE_URL.split('@')[1] || 'mysql',
    });
  } catch (err: any) {
    logger.fatal({
      type: 'lifecycle',
      event: 'db_failed',
      message: 'Database connection failed on startup',
      error: err.message,
    });
    process.exit(1);
  }

  logger.info({
    type: 'lifecycle',
    event: 'listening',
    message: `Server running in ${config.NODE_ENV} mode on http://localhost:${config.PORT}`,
  });
});

// Handle graceful shutdown
function gracefulShutdown(signal: string) {
  logger.info({
    type: 'lifecycle',
    event: 'shutdown',
    signal,
  });

  server.close(async () => {
    logger.info({ type: 'lifecycle', event: 'http_closed' });

    try {
      await prisma.$disconnect();
      logger.info({ type: 'lifecycle', event: 'db_disconnected' });
      process.exit(0);
    } catch (err: any) {
      logger.error({
        type: 'lifecycle',
        event: 'db_disconnect_error',
        error: err.message,
      });
      process.exit(1);
    }
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error({
      type: 'lifecycle',
      event: 'shutdown_timeout',
      message: 'Forcefully shutting down as graceful shutdown timed out.',
    });
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === 'string'
        ? reason
        : JSON.stringify(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;
  logger.error({
    type: 'unhandledRejection',
    message,
    stack,
    reason: reason instanceof Error ? undefined : reason,
  });
});

process.on('uncaughtException', (err: Error) => {
  logger.fatal({
    type: 'uncaughtException',
    message: err.message,
    stack: err.stack,
    errorName: err.name,
  });
  // Allow logs to flush, then exit
  setTimeout(() => process.exit(1), 500);
});
