import fs from 'fs';
import path from 'path';
import pino, { type Logger, type TransportTargetOptions } from 'pino';
import { config } from '../../config';

const REDACT_PATHS = [
  'password',
  'password_hash',
  'currentPassword',
  'newPassword',
  'accessToken',
  'refreshToken',
  'token',
  'authorization',
  'headers.authorization',
  'req.headers.authorization',
  'body.password',
  'body.currentPassword',
  'body.newPassword',
  'body.refreshToken',
  'body.accessToken',
  'req.body.password',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.refreshToken',
  'req.body.accessToken',
  'data.accessToken',
  'data.refreshToken',
  'data.password',
  'data.password_hash',
];

/** Absolute path to the log directory (resolved from cwd + LOG_DIR). */
export function getLogDir(): string {
  return path.resolve(process.cwd(), config.LOG_DIR);
}

function buildLogger(): Logger {
  if (config.NODE_ENV === 'test' || config.LOG_LEVEL === 'silent') {
    return pino({ level: 'silent' });
  }

  const logDir = getLogDir();
  if (config.LOG_TO_FILE) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const targets: TransportTargetOptions[] = [];

  // Console: pretty in development, raw JSON otherwise
  if (config.NODE_ENV === 'development') {
    targets.push({
      target: 'pino-pretty',
      level: config.LOG_LEVEL,
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
      },
    });
  } else {
    targets.push({
      target: 'pino/file',
      level: config.LOG_LEVEL,
      options: { destination: 1 }, // stdout
    });
  }

  if (config.LOG_TO_FILE) {
    // All levels → app.*.log (daily rotation)
    targets.push({
      target: 'pino-roll',
      level: config.LOG_LEVEL,
      options: {
        file: path.join(logDir, 'app'),
        frequency: 'daily',
        mkdir: true,
        dateFormat: 'yyyy-MM-dd',
        extension: '.log',
        limit: { count: 14 },
      },
    });

    // warn+ → error.*.log
    targets.push({
      target: 'pino-roll',
      level: 'warn',
      options: {
        file: path.join(logDir, 'error'),
        frequency: 'daily',
        mkdir: true,
        dateFormat: 'yyyy-MM-dd',
        extension: '.log',
        limit: { count: 30 },
      },
    });
  }

  const transport = pino.transport({ targets });

  return pino(
    {
      level: config.LOG_LEVEL,
      redact: {
        paths: REDACT_PATHS,
        censor: '[REDACTED]',
      },
    },
    transport,
  );
}

export const logger = buildLogger();

/**
 * Child logger bound to a request (and optional user) for correlation.
 */
export function createRequestLogger(requestId: string, userId?: number | string | null): Logger {
  return logger.child({
    requestId,
    ...(userId != null ? { userId } : {}),
  });
}
