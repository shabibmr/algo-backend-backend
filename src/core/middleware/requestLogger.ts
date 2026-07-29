import { Request, Response, NextFunction } from 'express';
import { config } from '../../config';
import { createRequestLogger, logger } from '../utils/logger';

const SKIP_OR_QUIET_PATHS = ['/health', '/ready'];
const DOCS_PREFIX = '/docs';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SENSITIVE_BODY_KEYS = new Set([
  'password',
  'password_hash',
  'currentPassword',
  'newPassword',
  'accessToken',
  'refreshToken',
  'token',
  'authorization',
]);

function sanitizeBody(body: unknown): unknown {
  if (body == null || typeof body !== 'object') return body;
  if (Array.isArray(body)) return body.map(sanitizeBody);

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_BODY_KEYS.has(key)) {
      out[key] = '[REDACTED]';
    } else if (value != null && typeof value === 'object') {
      out[key] = sanitizeBody(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function isQuietPath(path: string): boolean {
  if (SKIP_OR_QUIET_PATHS.includes(path)) return true;
  if (path === DOCS_PREFIX || path.startsWith(`${DOCS_PREFIX}/`)) return true;
  return false;
}

/**
 * HTTP access logger. Mount after requestIdMiddleware.
 * Attaches req.log (child logger) and logs method/path/status/duration on finish.
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.requestId || 'unknown';
  req._startTime = Date.now();
  req.log = createRequestLogger(requestId);

  const quiet = isQuietPath(req.path);

  if (config.LOG_REQUEST_BODY && WRITE_METHODS.has(req.method) && req.body && !quiet) {
    req.log.debug({
      type: 'http_body',
      method: req.method,
      path: req.originalUrl || req.url,
      body: sanitizeBody(req.body),
    });
  }

  res.on('finish', () => {
    const durationMs = req._startTime != null ? Date.now() - req._startTime : undefined;
    const statusCode = res.statusCode;
    const userId = req.user?.userId;

    // Refresh child bindings now that auth may have run
    const log = createRequestLogger(requestId, userId);

    const entry = {
      type: 'http' as const,
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      userId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      contentLength: res.get('content-length'),
    };

    if (quiet) {
      log.debug(entry);
      return;
    }

    if (statusCode >= 500) {
      log.error(entry);
    } else if (statusCode >= 400) {
      log.warn(entry);
    } else {
      log.info(entry);
    }
  });

  // Ensure failures before finish still get a log if connection drops mid-flight
  res.on('close', () => {
    if (!res.writableFinished && req._startTime != null) {
      logger.warn({
        type: 'http',
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Date.now() - req._startTime,
        userId: req.user?.userId,
        aborted: true,
      });
    }
  });

  next();
}
