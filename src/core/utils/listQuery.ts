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
 * Parses page/limit/search/sortBy/sortOrder from the query string, treating
 * any remaining query params as entity filters (whitelisted downstream by
 * BaseRepository via each repository's `filterFields`).
 */
export function getQueryOptions(req: Request): ListQueryOptions {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
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
