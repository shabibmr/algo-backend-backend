/**
 * Grants the Administrator role full CRUD on every module the Flutter client
 * currently gates on, so a local dev login can actually exercise the master
 * screens end to end.
 * Run: npx tsx scripts/seed-dev-permissions.ts
 *
 * Why this exists: the client's PermissionService now fails **closed** (a role
 * with no `user_access_permissions` row for a module sees nothing for it,
 * matching what `authorize()` already enforced server-side). `seed-test-user`
 * grants only `Inventory`, and with `Allow_Delete: false` — enough to list, not
 * enough to delete. This tops the role up.
 *
 * Dev convenience only — do not run against a real deployment.
 * Idempotent: re-running updates the same rows rather than duplicating them.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_ROLE_ID = 1;

/**
 * The `rbacModule` / `requiredModule` strings the client actually sends today.
 * Inventory/Employee/Accounts are coarse (one string gates the whole module);
 * the Organization entities gate per-entity, hence the individual names.
 */
const MODULES = [
  // Coarse-gated modules (inventory.routes.ts, employee.routes.ts, …)
  'Inventory',
  'Employee',
  'Accounts',
  'Transactions',
  // Organization gates per entity (organization.routes.ts)
  'CompanyProfile',
  'Branch',
  'Currency',
  'UserRole',
  'AddressBook',
];

const FULL_CRUD = {
  Allow_Create: true,
  Allow_Read: true,
  Allow_Update: true,
  Allow_Delete: true,
  Allow_Share: true,
};

async function main() {
  const role = await prisma.user_roles.findUnique({ where: { id: ADMIN_ROLE_ID } });
  if (!role) {
    throw new Error(
      `Role ${ADMIN_ROLE_ID} not found — run scripts/seed-test-user.ts first.`,
    );
  }

  let created = 0;
  let updated = 0;

  for (const module_name of MODULES) {
    const existing = await prisma.user_access_permissions.findFirst({
      where: { role_id: ADMIN_ROLE_ID, module_name },
    });

    if (existing) {
      await prisma.user_access_permissions.update({
        where: { id: existing.id },
        data: FULL_CRUD,
      });
      updated++;
    } else {
      await prisma.user_access_permissions.create({
        data: { role_id: ADMIN_ROLE_ID, module_name, ...FULL_CRUD },
      });
      created++;
    }
  }

  console.log(
    `Role "${role.role_name}" (id ${ADMIN_ROLE_ID}): full CRUD on ${MODULES.length} modules ` +
      `(${created} created, ${updated} updated).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
