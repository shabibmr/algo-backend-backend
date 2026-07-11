import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import { user_access_permissions } from '@prisma/client';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'share';

// Cache structure: roleId -> { moduleName -> { action -> boolean } }
const permissionCache: Record<number, Record<string, Record<PermissionAction, boolean>>> = {};

// Cache TTL implementation or clear helper (for when permissions are updated)
export function clearPermissionCache(roleId?: number) {
  if (roleId) {
    delete permissionCache[roleId];
  } else {
    for (const key in permissionCache) {
      delete permissionCache[Number(key)];
    }
  }
}

export function authorize(moduleName: string, action: PermissionAction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const { roleId } = req.user;

    // Check Cache first
    if (
      permissionCache[roleId] &&
      permissionCache[roleId][moduleName] &&
      permissionCache[roleId][moduleName][action] !== undefined
    ) {
      if (permissionCache[roleId][moduleName][action]) {
        return next();
      } else {
        return next(new ForbiddenError(`Forbidden: No ${action} permission on ${moduleName}`));
      }
    }

    try {
      // Lookup in DB
      const permission = await prisma.user_access_permissions.findFirst({
        where: {
          role_id: roleId,
          module_name: moduleName,
        },
      });

      // Map action to column name
      const actionMap: Record<PermissionAction, keyof user_access_permissions> = {
        create: 'Allow_Create',
        read: 'Allow_Read',
        update: 'Allow_Update',
        delete: 'Allow_Delete',
        share: 'Allow_Share',
      };

      const columnName = actionMap[action];
      const allowed = permission ? !!permission[columnName] : false;

      // Populate Cache
      if (!permissionCache[roleId]) {
        permissionCache[roleId] = {};
      }
      if (!permissionCache[roleId][moduleName]) {
        permissionCache[roleId][moduleName] = {
          create: false,
          read: false,
          update: false,
          delete: false,
          share: false,
        };
      }

      // Pre-populate all actions from the fetched row
      permissionCache[roleId][moduleName] = {
        create: permission ? !!permission.Allow_Create : false,
        read: permission ? !!permission.Allow_Read : false,
        update: permission ? !!permission.Allow_Update : false,
        delete: permission ? !!permission.Allow_Delete : false,
        share: permission ? !!permission.Allow_Share : false,
      };

      if (allowed) {
        return next();
      } else {
        return next(new ForbiddenError(`Forbidden: No ${action} permission on ${moduleName}`));
      }
    } catch (err: any) {
      return next(err);
    }
  };
}
