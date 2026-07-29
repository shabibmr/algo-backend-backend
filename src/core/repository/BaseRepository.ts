import { prisma } from '../db/prisma';
import { Paginated } from '../types';
import { logger } from '../utils/logger';

export interface RepositoryConfig {
  modelName: string; // matches the key in prisma client, e.g. 'ledger_master'
  primaryKeyField?: string; // default: 'id' or '_id'
  softDeleteField?: string | null; // default: 'is_active', null to disable
  searchFields?: string[];
  filterFields?: string[];
  auditFieldMap?: {
    addedBy?: string | null; // e.g. 'added_by'
    createdAt?: string | null; // e.g. 'created_at'
    lastModifiedBy?: string | null; // e.g. 'last_modified_by'
    lastModified?: string | null; // e.g. 'last_modified' or 'updated_at'
  };
}

export class BaseRepository<T> {
  protected modelName: string;
  protected pkField: string;
  protected softDeleteField: string | null;
  protected searchFields: string[];
  protected filterFields: string[];
  protected auditMap: {
    addedBy: string | null;
    createdAt: string | null;
    lastModifiedBy: string | null;
    lastModified: string | null;
  };

  constructor(config: RepositoryConfig) {
    this.modelName = config.modelName;
    this.pkField = config.primaryKeyField || 'id';
    this.softDeleteField =
      config.softDeleteField === undefined ? 'is_active' : config.softDeleteField;
    this.searchFields = config.searchFields || [];
    this.filterFields = config.filterFields || [];
    this.auditMap = {
      addedBy: config.auditFieldMap?.addedBy || null,
      createdAt: config.auditFieldMap?.createdAt || null,
      lastModifiedBy: config.auditFieldMap?.lastModifiedBy || null,
      lastModified: config.auditFieldMap?.lastModified || null,
    };
  }

  /**
   * Helper to get the correct prisma model delegate (supports transaction fallback)
   */
  protected getDelegate(tx?: any) {
    const client = tx || prisma;
    const delegate = (client as any)[this.modelName];
    if (!delegate) {
      throw new Error(`Prisma delegate for model ${this.modelName} not found.`);
    }
    return delegate;
  }

  /**
   * Time a repository op and emit structured debug (or error) logs.
   * Does not log full row payloads.
   */
  protected async withRepoLog<R>(
    op: string,
    meta: Record<string, unknown>,
    fn: () => Promise<R>,
  ): Promise<R> {
    const start = Date.now();
    try {
      const result = await fn();
      logger.debug({
        type: 'repository',
        model: this.modelName,
        op,
        durationMs: Date.now() - start,
        ...meta,
      });
      return result;
    } catch (err: any) {
      logger.error({
        type: 'repository',
        model: this.modelName,
        op,
        durationMs: Date.now() - start,
        error: err?.message,
        ...meta,
      });
      throw err;
    }
  }

  /**
   * Inject soft-delete active check into queries if applicable
   */
  protected applySoftDelete(where: any = {}, includeInactive = false): any {
    if (!this.softDeleteField || includeInactive) {
      return where;
    }
    return {
      ...where,
      [this.softDeleteField]: true,
    };
  }

  /**
   * Find a single record by primary key
   */
  async findById(
    id: any,
    options?: { select?: any; include?: any; includeInactive?: boolean; tx?: any },
  ): Promise<T | null> {
    return this.withRepoLog('findById', { id }, async () => {
      const delegate = this.getDelegate(options?.tx);
      const where = this.applySoftDelete({ [this.pkField]: id }, options?.includeInactive);

      return delegate.findFirst({
        where,
        select: options?.select,
        include: options?.include,
      });
    });
  }

  /**
   * Find first record matching criteria
   */
  async findFirst(options: {
    where?: any;
    select?: any;
    include?: any;
    orderBy?: any;
    includeInactive?: boolean;
    tx?: any;
  }): Promise<T | null> {
    return this.withRepoLog('findFirst', {}, async () => {
      const delegate = this.getDelegate(options.tx);
      const where = this.applySoftDelete(options.where || {}, options.includeInactive);

      return delegate.findFirst({
        where,
        select: options.select,
        include: options.include,
        orderBy: options.orderBy,
      });
    });
  }

  /**
   * Find many records with pagination, sorting and filtering
   */
  async findMany(options: {
    where?: any;
    select?: any;
    include?: any;
    orderBy?: any;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
    includeInactive?: boolean;
    tx?: any;
  }): Promise<Paginated<T>> {
    const page = options.page || 1;
    const limit = options.limit || 20;

    return this.withRepoLog(
      'findMany',
      { page, limit, search: options.search || undefined },
      async () => {
        const delegate = this.getDelegate(options.tx);
        let where = this.applySoftDelete(options.where || {}, options.includeInactive);

        // 1. Full-text search
        if (options.search && this.searchFields.length > 0) {
          const searchConditions = this.searchFields.map(field => ({
            [field]: {
              contains: options.search,
            },
          }));
          where = {
            ...where,
            OR: searchConditions,
          };
        }

        // 2. Field Filters
        if (options.filters) {
          const filterConditions: any = {};
          for (const [key, val] of Object.entries(options.filters)) {
            if (val === undefined || val === '') continue;

            if (key === 'from_date') {
              const dateField =
                this.modelName.includes('voucher') ||
                this.modelName.includes('invoice') ||
                this.modelName.includes('note')
                  ? 'voucher_date'
                  : 'created_at';
              filterConditions[dateField] = {
                ...(filterConditions[dateField] || {}),
                gte: new Date(String(val)),
              };
              continue;
            }
            if (key === 'to_date') {
              const dateField =
                this.modelName.includes('voucher') ||
                this.modelName.includes('invoice') ||
                this.modelName.includes('note')
                  ? 'voucher_date'
                  : 'created_at';
              filterConditions[dateField] = {
                ...(filterConditions[dateField] || {}),
                lte: new Date(String(val)),
              };
              continue;
            }

            // Fail closed: a repository that declares no `filterFields` exposes no
            // filterable columns. Previously an empty list meant "allow everything",
            // which let arbitrary query params reach the Prisma `where`.
            if (!this.filterFields.includes(key)) {
              continue;
            }

            if (val === 'true') {
              filterConditions[key] = true;
            } else if (val === 'false') {
              filterConditions[key] = false;
            } else if (val === 'null') {
              filterConditions[key] = null;
            } else if (!isNaN(Number(val)) && val !== '' && typeof val === 'string') {
              filterConditions[key] = Number(val);
            } else {
              filterConditions[key] = val;
            }
          }
          where = {
            ...where,
            ...filterConditions,
          };
        }

        const skip = (page - 1) * limit;

        // 3. Sorting
        let orderBy = options.orderBy;
        if (options.sortBy) {
          orderBy = {
            [options.sortBy]: options.sortOrder === 'asc' ? 'asc' : 'desc',
          };
        } else if (!orderBy) {
          orderBy = {
            [this.pkField]: 'desc',
          };
        }

        const [items, total] = await Promise.all([
          delegate.findMany({
            where,
            select: options.select,
            include: options.include,
            orderBy,
            skip,
            take: limit,
          }),
          delegate.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
          items,
          meta: {
            total,
            page,
            limit,
            totalPages,
          },
        };
      },
    );
  }

  /**
   * Create a new record, injecting audit fields
   */
  async create(data: any, options?: { user?: string; tx?: any }): Promise<T> {
    return this.withRepoLog('create', {}, async () => {
      const delegate = this.getDelegate(options?.tx);
      const decoratedData = { ...data };

      if (options?.user) {
        if (this.auditMap.addedBy) {
          decoratedData[this.auditMap.addedBy] = options.user;
        }
        if (this.auditMap.lastModifiedBy) {
          decoratedData[this.auditMap.lastModifiedBy] = options.user;
        }
      }

      // Default dates are handled by DB schema defaults, but can set here if needed

      return delegate.create({
        data: decoratedData,
      });
    });
  }

  /**
   * Update an existing record by id, injecting audit fields
   */
  async update(id: any, data: any, options?: { user?: string; tx?: any }): Promise<T> {
    return this.withRepoLog('update', { id }, async () => {
      const delegate = this.getDelegate(options?.tx);
      const decoratedData = { ...data };

      if (options?.user) {
        if (this.auditMap.lastModifiedBy) {
          decoratedData[this.auditMap.lastModifiedBy] = options.user;
        }
      }

      // Explicitly update last modified date if not handled by db trigger
      if (this.auditMap.lastModified) {
        decoratedData[this.auditMap.lastModified] = new Date();
      }

      return delegate.update({
        where: { [this.pkField]: id },
        data: decoratedData,
      });
    });
  }

  /**
   * Delete a record by primary key (performs soft delete by default)
   */
  async delete(id: any, options?: { user?: string; hardDelete?: boolean; tx?: any }): Promise<T> {
    return this.withRepoLog(
      'delete',
      { id, hardDelete: !!options?.hardDelete },
      async () => {
        const delegate = this.getDelegate(options?.tx);

        if (this.softDeleteField && !options?.hardDelete) {
          const updateData: any = {
            [this.softDeleteField]: false,
          };

          if (options?.user && this.auditMap.lastModifiedBy) {
            updateData[this.auditMap.lastModifiedBy] = options.user;
          }

          if (this.auditMap.lastModified) {
            updateData[this.auditMap.lastModified] = new Date();
          }

          return delegate.update({
            where: { [this.pkField]: id },
            data: updateData,
          });
        }

        return delegate.delete({
          where: { [this.pkField]: id },
        });
      },
    );
  }

  /**
   * Count matching records
   */
  async count(options?: { where?: any; includeInactive?: boolean; tx?: any }): Promise<number> {
    return this.withRepoLog('count', {}, async () => {
      const delegate = this.getDelegate(options?.tx);
      const where = this.applySoftDelete(options?.where || {}, options?.includeInactive);
      return delegate.count({ where });
    });
  }
}
