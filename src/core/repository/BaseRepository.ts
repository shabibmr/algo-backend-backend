import { prisma } from '../db/prisma';
import { Paginated } from '../types';

export interface RepositoryConfig {
  modelName: string; // matches the key in prisma client, e.g. 'ledger_master'
  primaryKeyField?: string; // default: 'id' or '_id'
  softDeleteField?: string | null; // default: 'is_active', null to disable
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
    const delegate = this.getDelegate(options?.tx);
    const where = this.applySoftDelete({ [this.pkField]: id }, options?.includeInactive);

    return delegate.findFirst({
      where,
      select: options?.select,
      include: options?.include,
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
    const delegate = this.getDelegate(options.tx);
    const where = this.applySoftDelete(options.where || {}, options.includeInactive);

    return delegate.findFirst({
      where,
      select: options.select,
      include: options.include,
      orderBy: options.orderBy,
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
    includeInactive?: boolean;
    tx?: any;
  }): Promise<Paginated<T>> {
    const delegate = this.getDelegate(options.tx);
    const where = this.applySoftDelete(options.where || {}, options.includeInactive);

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      delegate.findMany({
        where,
        select: options.select,
        include: options.include,
        orderBy: options.orderBy,
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
  }

  /**
   * Create a new record, injecting audit fields
   */
  async create(data: any, options?: { user?: string; tx?: any }): Promise<T> {
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
  }

  /**
   * Update an existing record by id, injecting audit fields
   */
  async update(id: any, data: any, options?: { user?: string; tx?: any }): Promise<T> {
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
  }

  /**
   * Delete a record by primary key (performs soft delete by default)
   */
  async delete(id: any, options?: { user?: string; hardDelete?: boolean; tx?: any }): Promise<T> {
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
  }

  /**
   * Count matching records
   */
  async count(options?: { where?: any; includeInactive?: boolean; tx?: any }): Promise<number> {
    const delegate = this.getDelegate(options?.tx);
    const where = this.applySoftDelete(options?.where || {}, options?.includeInactive);
    return delegate.count({ where });
  }
}
