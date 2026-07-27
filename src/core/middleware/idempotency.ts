import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

interface CachedResponse {
  statusCode: number;
  body: any;
  timestamp: number;
}

interface CacheEntry {
  /** Set while the original request is still in flight; replaced once it responds. */
  pending: boolean;
  /** Hash of the request body, so a reused key with a different payload is rejected. */
  bodyHash: string;
  response?: CachedResponse;
  timestamp: number;
}

// Memory cache for idempotency keys with a 1-hour TTL (3,600,000 ms).
// Single-process only — see docs/backend-suggestions.md BE-005 for the multi-instance gap.
const cache = new Map<string, CacheEntry>();
const TTL = 60 * 60 * 1000;

// Clean up expired keys periodically (every 10 minutes). Unref'd so the timer
// never holds the event loop open during tests or graceful shutdown.
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > TTL) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);
sweeper.unref();

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Builds the cache key.
 *
 * This middleware is registered globally in `app.ts`, i.e. before `authenticate`
 * runs (each module router registers `authenticate` itself), so `req.user` is not
 * yet populated here. The `Authorization` header is available though, and uniquely
 * identifies the caller — hashing it scopes the cache per-user without reordering
 * middleware. A token refresh yields a different key, which is a false miss (the
 * duplicate is allowed through) rather than a cross-tenant leak.
 */
function buildCacheKey(req: Request, idempotencyKey: string): string {
  const identity = sha256(String(req.headers.authorization ?? 'anonymous'));
  return [identity, req.method, req.originalUrl, idempotencyKey].join(':');
}

function hashBody(body: unknown): string {
  try {
    return sha256(JSON.stringify(body ?? null));
  } catch {
    // Circular or otherwise unserializable body — fall back to a constant so the
    // key still works for the double-submit case rather than throwing.
    return 'unhashable';
  }
}

export function idempotency(req: Request, res: Response, next: NextFunction) {
  // Only apply to POST requests
  if (req.method !== 'POST') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;
  if (!idempotencyKey) {
    return next();
  }

  const key = buildCacheKey(req, idempotencyKey);
  const bodyHash = hashBody(req.body);

  const existing = cache.get(key);
  if (existing) {
    if (Date.now() - existing.timestamp >= TTL) {
      cache.delete(key);
    } else if (existing.bodyHash !== bodyHash) {
      // Same key, different payload — the client is reusing a key it shouldn't.
      return res.status(422).json({
        success: false,
        message:
          'Idempotency-Key was already used with a different request body. Use a new key for a new request.',
        requestId: req.requestId,
      });
    } else if (existing.pending) {
      // The original request is still running; replaying now would double-post.
      return res.status(409).json({
        success: false,
        message: 'A request with this Idempotency-Key is already in progress.',
        requestId: req.requestId,
      });
    } else if (existing.response) {
      res.status(existing.response.statusCode);
      res.setHeader('Idempotent-Replay', 'true');
      return res.json(existing.response.body);
    }
  }

  // Reserve the key before running the handler so a concurrent duplicate sees it.
  cache.set(key, { pending: true, bodyHash, timestamp: Date.now() });

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  let responseBody: any = null;
  let stored = false;

  const store = (body: any) => {
    // Only successful responses are idempotent. Caching a 4xx/5xx would pin a
    // transient failure to this key for the full TTL and break every retry.
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }
    stored = true;
    cache.set(key, {
      pending: false,
      bodyHash,
      response: { statusCode: res.statusCode, body, timestamp: Date.now() },
      timestamp: Date.now(),
    });
  };

  res.json = (body: any) => {
    responseBody = body;
    store(body);
    return originalJson(body);
  };

  res.send = (body: any) => {
    if (!responseBody && typeof body === 'string') {
      try {
        responseBody = JSON.parse(body);
      } catch {
        responseBody = body;
      }
    }
    store(responseBody ?? body);
    return originalSend(body);
  };

  // Release the reservation if the handler failed or the connection dropped,
  // so a wedged key doesn't block legitimate retries for the next hour.
  const release = () => {
    if (!stored) {
      const entry = cache.get(key);
      if (entry?.pending) {
        cache.delete(key);
      }
    }
  };
  res.on('finish', release);
  res.on('close', release);

  next();
}
