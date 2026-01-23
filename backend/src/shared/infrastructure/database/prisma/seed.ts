import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Clean Database
  await prisma.production.deleteMany();
  await prisma.tower.deleteMany();
  await prisma.foundation.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.team.deleteMany();
  await prisma.task.deleteMany();
  await prisma.work.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });
  console.log(`Created user: ${user.email}`);

  // 3. Create Work
  const work = await prisma.work.create({
    data: {
      name: 'LT 500kV Project Alpha',
      tension: 500,
      extension: 150.5,
      phases: 3,
      circuits: 2,
      lightning_rod: 2,
      start_date: new Date('2026-02-01'),
      end_date: new Date('2026-12-31'),
    },
  });
  console.log(`Created work: ${work.name}`);

  // 4. Create Foundations
  const f1 = await prisma.foundation.create({
    data: {
      project: 'FDN-001',
      revision: 'A',
      description: 'Standard Suspension Foundation',
      excavation_volume: 50,
      concrete_volume: 20,
      backfill_volume: 30,
      steel_volume: 2000,
    },
  });

  const f2 = await prisma.foundation.create({
    data: {
      project: 'FDN-002',
      revision: 'A',
      description: 'Heavy Angle Foundation',
      excavation_volume: 80,
      concrete_volume: 35,
      backfill_volume: 45,
      steel_volume: 4000,
    },
  });

  // 5. Create Towers
  await prisma.tower.createMany({
    data: [
      {
        code: 1,
        tower_number: 'T-01',
        type: 'Suspension',
        coordinates: { lat: -23.55052, lng: -46.63330, altitude: 760 },
        distance: 0,
        height: 45,
        weight: 12000,
        work_id: work.id,
        deflection: 0,
        structureType: 'suspension',
        color: '#0ea5e9',
        isHidden: false,
      },
      {
        code: 2,
        tower_number: 'T-02',
        type: 'Suspension',
        coordinates: { lat: -23.55152, lng: -46.63430, altitude: 765 },
        distance: 350,
        height: 45,
        weight: 12000,
        work_id: work.id,
        deflection: 0,
        structureType: 'suspension',
        color: '#0ea5e9',
        isHidden: false,
      },
      {
        code: 3,
        tower_number: 'T-03',
        type: 'Anchor',
        coordinates: { lat: -23.55252, lng: -46.63630, altitude: 770 },
        distance: 400,
        height: 50,
        weight: 18000,
        work_id: work.id,
        deflection: 15,
        structureType: 'anchor',
        color: '#ef4444',
        isHidden: false,
      },
    ],
  });

  // Link foundations to towers (update)
  const t1 = await prisma.tower.findFirst({ where: { tower_number: 'T-01' } });
  if (t1) {
    await prisma.tower.update({
      where: { id: t1.id },
      data: {
        foundations: {
          connect: { id: f1.id },
        },
      },
    });
  }

  const t3 = await prisma.tower.findFirst({ where: { tower_number: 'T-03' } });
  if (t3) {
    await prisma.tower.update({
      where: { id: t3.id },
      data: {
        foundations: {
          connect: { id: f2.id },
        },
      },
    });
  }
  console.log('Created towers and foundations');

  // 6. Create Team
  const team = await prisma.team.create({
    data: {
      name: 'Team Alpha',
    },
  });

  // 7. Create Employees
  await prisma.employee.create({
    data: {
      registration: 'EMP-001',
      full_name: 'John Doe',
      occupation: 'Foreman',
      leadership: true,
      team_id: team.id,
    },
  });

  // 8. Create Equipment
  await prisma.equipment.create({
    data: {
      registration: 'EQ-001',
      model: 'Excavator 320',
      manufacturer: 'CAT',
      license_plate: 'ABC-1234',
      provider: 'Rental Co',
      team_id: team.id,
    },
  });

  // 9. Create Task
  await prisma.task.create({
    data: {
      code: 100,
      stage: 'Civil',
      group: 'Foundations',
      name: 'Excavation',
      unit: 'm3',
    },
  });

  // 10. Update productions (optional placeholder)

  console.log('✅ Seeding completed.');
}

import * as fs from 'fs';

main()
  .catch((e) => {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    console.error('Error during seeding:', msg);
    fs.writeFileSync('seed_error.txt', msg);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
