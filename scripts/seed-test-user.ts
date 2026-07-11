/**
 * Seeds one local dev login for manually verifying the Flutter Brand screen.
 * Run: npx tsx scripts/seed-test-user.ts
 *
 * Idempotent: re-running upserts the same address_book/user_credentials rows
 * and guarantees Administrator has Inventory read access, without ever
 * reading back password_hash or existing permission values.
 *
 * Requires an Administrator role (created by company bootstrap or
 * scripts/seed-dev-permissions.ts). Resolves the role by name, not hardcoded id.
 *
 * Credentials: username "brand.tester" / password "BrandTest123!"
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/core/auth/password';
import { ADMIN_ROLE_NAME } from '../src/core/permissions/adminModules';

const prisma = new PrismaClient();

const USERNAME = 'brand.tester';
const PASSWORD = 'BrandTest123!';

async function main() {
  const adminRole = await prisma.user_roles.findFirst({
    where: { role_name: ADMIN_ROLE_NAME },
  });
  if (!adminRole) {
    throw new Error(
      `Role "${ADMIN_ROLE_NAME}" not found. Bootstrap a company first, or run scripts/seed-dev-permissions.ts to create the role and grant permissions.`,
    );
  }
  const roleId = adminRole.id;

  const passwordHash = await hashPassword(PASSWORD);

  let contact = await prisma.address_book.findFirst({
    where: { Address_Id: 'seed-brand-tester' },
  });
  if (!contact) {
    contact = await prisma.address_book.create({
      data: {
        Address_Id: 'seed-brand-tester',
        Name: 'Brand Tester',
        contact_type: 'INDIVIDUAL',
      },
    });
  }

  await prisma.user_credentials.upsert({
    where: { username: USERNAME },
    update: { password_hash: passwordHash, role_id: roleId, is_active: true },
    create: {
      contact_id: contact.id,
      username: USERNAME,
      password_hash: passwordHash,
      role_id: roleId,
      is_active: true,
    },
  });

  const existingPerm = await prisma.user_access_permissions.findFirst({
    where: { role_id: roleId, module_name: 'Inventory' },
  });
  if (existingPerm) {
    await prisma.user_access_permissions.update({
      where: { id: existingPerm.id },
      data: { Allow_Read: true },
    });
  } else {
    await prisma.user_access_permissions.create({
      data: {
        role_id: roleId,
        module_name: 'Inventory',
        Allow_Create: true,
        Allow_Read: true,
        Allow_Update: true,
        Allow_Delete: false,
        Allow_Share: false,
      },
    });
  }

  console.log(
    `Seeded login -> username: ${USERNAME}  password: ${PASSWORD}  role: ${ADMIN_ROLE_NAME} (id ${roleId})`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
