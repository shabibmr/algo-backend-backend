import { Request, Response, NextFunction } from 'express';

interface CachedResponse {
  statusCode: number;
  body: any;
  headers: Record<string, any>;
  timestamp: number;
}

// Memory cache for idempotency keys with a 1-hour TTL (3,600,000 ms)
const cache = new Map<string, CachedResponse>();
const TTL = 60 * 60 * 1000;

// Clean up expired keys periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, cached] of cache.entries()) {
    if (now - cached.timestamp > TTL) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function idempotency(req: Request, res: Response, next: NextFunction) {
  // Only apply to POST requests
  if (req.method !== 'POST') {
    return next();
  }

  const key = req.headers['idempotency-key'] as string;
  if (!key) {
    return next();
  }

  const cached = cache.get(key);
  if (cached) {
    if (Date.now() - cached.timestamp < TTL) {
      // Return cached response
      res.status(cached.statusCode);
      for (const [headerName, headerValue] of Object.entries(cached.headers)) {
        res.setHeader(headerName, headerValue);
      }
      return res.json(cached.body);
    } else {
      cache.delete(key);
    }
  }

  // Intercept response to store it in cache
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  let responseBody: any = null;

  res.json = (body: any) => {
    responseBody = body;
    const cachedResp: CachedResponse = {
      statusCode: res.statusCode,
      body,
      headers: {
        'x-cache-lookup': 'HIT',
      },
      timestamp: Date.now(),
    };
    cache.set(key, cachedResp);
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
    const cachedResp: CachedResponse = {
      statusCode: res.statusCode,
      body: responseBody || body,
      headers: {
        'x-cache-lookup': 'HIT',
      },
      timestamp: Date.now(),
    };
    cache.set(key, cachedResp);
    return originalSend(body);
  };

  next();
}
