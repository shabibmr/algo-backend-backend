/**
 * Task 66: RBAC permission seed for new modules.
 * Run: npx ts-node scripts/seed-permissions.ts
 *
 * Inserts user_access_permissions rows for new modules per all existing roles.
 * Safe to re-run (uses upsert/skipDuplicates).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_MODULES = [
  'TermsAndConditions',
  'TransportationDetails',
  'ProjectMaster',
  'VoucherSeries',
  'ExtraValues',
  'ConfigSetting',
  'ErrorReporting',
  'StockLedger',
  'OutstandingReports',
];

async function main() {
  const roles = await prisma.user_roles.findMany();
  console.log(`Seeding permissions for ${roles.length} roles × ${NEW_MODULES.length} modules`);

  let seeded = 0;
  for (const role of roles) {
    for (const module_name of NEW_MODULES) {
      // Check if already exists
      const existing = await prisma.user_access_permissions.findFirst({
        where: { role_id: role.id, module_name },
      });
      if (!existing) {
        await prisma.user_access_permissions.create({
          data: {
            role_id: role.id,
            module_name,
            Allow_Create: true,
            Allow_Read: true,
            Allow_Update: true,
            Allow_Delete: false,
            Allow_Share: false,
          },
        });
        seeded++;
      }
    }
  }

  console.log(`Done. Seeded ${seeded} new permission rows.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
