import { Request } from 'express';

export interface ListQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  filters?: Record<string, any>;
}

const RESERVED_KEYS = ['page', 'limit', 'search', 'sortBy', 'sortOrder'];

/**
 * Upper bound on a client-supplied page size. `BaseRepository.findMany` applies no
 * clamp of its own, so without this `?limit=1000000` would be honored verbatim.
 * Only affects params parsed off the query string — services that pass an explicit
 * `limit` programmatically (reference-data and export paths) are unaffected.
 */
const MAX_LIMIT = 200;

/**
 * Parses page/limit/search/sortBy/sortOrder from the query string, treating
 * any remaining query params as entity filters (whitelisted downstream by
 * BaseRepository via each repository's `filterFields`).
 */
export function getQueryOptions(req: Request): ListQueryOptions {
  const rawPage = req.query.page ? Number(req.query.page) : undefined;
  const page = rawPage && rawPage > 0 ? Math.floor(rawPage) : undefined;

  const rawLimit = req.query.limit ? Number(req.query.limit) : undefined;
  const limit =
    rawLimit && rawLimit > 0 ? Math.min(Math.floor(rawLimit), MAX_LIMIT) : undefined;

  const search = req.query.search ? String(req.query.search) : undefined;
  const sortBy = req.query.sortBy ? String(req.query.sortBy) : undefined;
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  const filters: Record<string, any> = {};
  for (const [key, val] of Object.entries(req.query)) {
    if (!RESERVED_KEYS.includes(key) && val !== undefined && val !== '') {
      filters[key] = val;
    }
  }

  return {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    filters: Object.keys(filters).length ? filters : undefined,
  };
}
