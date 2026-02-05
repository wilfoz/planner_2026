
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const id = '8cb23efe-4ef5-4742-bede-c85c4fae55aa';
  console.log(`Checking for Work with ID: ${id}`);

  try {
    const work = await prisma.work.findUnique({
      where: { id },
    });

    if (work) {
      console.log('Work FOUND:', work);
    } else {
      console.log('Work NOT FOUND');

      // List all works to see what we have
      const allWorks = await prisma.work.findMany({ take: 5 });
      console.log('First 5 existing works:', allWorks.map(w => ({ id: w.id, name: w.name })));
    }
  } catch (e) {
    console.error('Error querying database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
