
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking latest tasks...');
  const tasks = await prisma.task.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      production: true
    }
  });

  console.log('Found tasks:', tasks.length);
  for (const task of tasks) {
    console.log(`Task: ${task.name} (${task.id})`);
    console.log(`  Created At: ${task.createdAt}`);
    console.log(`  Production:`, task.production);
    if (task.production) {
      console.log(`    Work ID: ${task.production.work_id}`);
    } else {
      console.log(`    NO PRODUCTION LINKED`);
    }
    console.log('---');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
