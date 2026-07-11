import app from './app';
import { config } from './config';
import { prisma } from './core/db/prisma';
import { logger } from './core/utils/logger';

const server = app.listen(config.PORT, async () => {
  try {
    // Test database connection on startup
    await prisma.$connect();
    logger.info(
      `✨ Database connected successfully to ${config.DATABASE_URL.split('@')[1] || 'mysql'}`,
    );
  } catch (err: any) {
    logger.fatal({
      message: '❌ Database connection failed on startup',
      error: err.message,
    });
    process.exit(1);
  }

  logger.info(`🚀 Server running in ${config.NODE_ENV} mode on http://localhost:${config.PORT}`);
});

// Handle graceful shutdown
function gracefulShutdown(signal: string) {
  logger.info(`🔌 Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Prisma client database disconnected.');
      process.exit(0);
    } catch (err: any) {
      logger.error({
        message: 'Error during Prisma client disconnect',
        error: err.message,
      });
      process.exit(1);
    }
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forcefully shutting down as graceful shutdown timed out.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
