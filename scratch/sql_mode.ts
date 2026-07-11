import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const modes = await prisma.$queryRawUnsafe<any[]>('SELECT @@GLOBAL.sql_mode, @@SESSION.sql_mode');
  console.log('SQL Modes:', JSON.stringify(modes, null, 2));

  // Try to set global sql_mode to a relaxed one during this session or globally
  // We can strip NO_ZERO_IN_DATE and NO_ZERO_DATE
  const currentMode = Object.values(modes[0])[0] as string;
  console.log('Current global mode:', currentMode);
  
  const relaxedMode = currentMode
    .split(',')
    .filter(m => m !== 'NO_ZERO_IN_DATE' && m !== 'NO_ZERO_DATE' && m !== 'STRICT_TRANS_TABLES' && m !== 'STRICT_ALL_TABLES')
    .join(',');
  
  console.log('Setting global sql_mode to:', relaxedMode);
  await prisma.$executeRawUnsafe(`SET @@GLOBAL.sql_mode = '${relaxedMode}'`);
  await prisma.$executeRawUnsafe(`SET @@SESSION.sql_mode = '${relaxedMode}'`);
  console.log('SQL mode updated successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
