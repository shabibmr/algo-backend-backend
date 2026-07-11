/**
 * Grants the Administrator role full CRUD on every bootstrap module so a local
 * dev login can exercise master screens end to end.
 * Run: npx tsx scripts/seed-dev-permissions.ts
 *
 * Why this exists: the client's PermissionService now fails **closed** (a role
 * with no `user_access_permissions` row for a module sees nothing for it,
 * matching what `authorize()` already enforced server-side). `seed-test-user`
 * grants only `Inventory`, and with `Allow_Delete: false` — enough to list, not
 * enough to delete. This tops the role up to match company bootstrap grants.
 *
 * Dev convenience only — do not run against a real deployment.
 * Refuses NODE_ENV=production unless ALLOW_DEV_SEED=1 is set.
 * Idempotent: re-running updates matching rows (including duplicates) rather
 * than creating extras.
 *
 * After running, restart the API process (a tsx watch restart is enough).
 * authorize() caches permissions in-memory; this script cannot clear another
 * process's cache.
 */
import { PrismaClient } from '@prisma/client';
import {
  ADMIN_BOOTSTRAP_MODULES,
  ADMIN_ROLE_NAME,
} from '../src/core/permissions/adminModules';

const prisma = new PrismaClient();

const FULL_CRUD = {
  Allow_Create: true,
  Allow_Read: true,
  Allow_Update: true,
  Allow_Delete: true,
  Allow_Share: true,
};

function assertDevSeedAllowed(): void {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_SEED !== '1') {
    throw new Error(
      'Refusing to run seed-dev-permissions in production. Set ALLOW_DEV_SEED=1 to override.',
    );
  }
}

async function resolveAdminRole() {
  let role = await prisma.user_roles.findFirst({
    where: { role_name: ADMIN_ROLE_NAME },
  });
  if (!role) {
    role = await prisma.user_roles.create({
      data: {
        role_name: ADMIN_ROLE_NAME,
        description: 'Full system access',
      },
    });
    console.log(`Created missing "${ADMIN_ROLE_NAME}" role (id ${role.id}).`);
  }
  return role;
}

async function main() {
  assertDevSeedAllowed();

  const role = await resolveAdminRole();
  const roleId = role.id;

  let created = 0;
  let updated = 0;

  for (const module_name of ADMIN_BOOTSTRAP_MODULES) {
    const result = await prisma.user_access_permissions.updateMany({
      where: { role_id: roleId, module_name },
      data: FULL_CRUD,
    });

    if (result.count === 0) {
      await prisma.user_access_permissions.create({
        data: { role_id: roleId, module_name, ...FULL_CRUD },
      });
      created++;
    } else {
      updated += result.count;
      if (result.count > 1) {
        console.warn(
          `Duplicate permission rows for ${module_name} (role ${roleId}): updated ${result.count}`,
        );
      }
    }
  }

  console.log(
    `Role "${role.role_name}" (id ${roleId}): full CRUD on ${ADMIN_BOOTSTRAP_MODULES.length} modules ` +
      `(${created} created, ${updated} updated).`,
  );
  console.log(
    'Restart the API server so authorize() picks up the new permissions.',
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
