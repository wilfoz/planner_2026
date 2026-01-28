import { PrismaClient } from '@prisma/client';
import { PrismaTowersRepository } from '@/contexts/towers/infrastructure/database/prisma/prisma-towers.repository';
// Assuming @test/setupPrismaTests exists as per other files
import { setupPrismaTests } from '@test/setupPrismaTests';

describe('PrismaTowersRepository (integration)', () => {
  setupPrismaTests();

  const prisma = new PrismaClient();
  const repo = new PrismaTowersRepository(prisma as any);

  let workId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Cleanup order matters due to FKs
    await prisma.tower.deleteMany();
    await prisma.work.deleteMany();

    // Create a dummy work for relation
    const work = await prisma.work.create({
      data: {
        name: 'Test Work',
        tension: 138,
        extension: 10,
        phases: 3,
        circuits: 2,
        lightning_rod: 1,
        start_date: new Date(),
        end_date: new Date(new Date().getTime() + 1000000),
      }
    });
    workId = work.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates and finds tower', async () => {
    const input = {
      code: 10,
      tower_number: 'T-10',
      type: 'Suspension',
      coordinates: { lat: -23.0, lng: -46.0, altitude: 0 },
      work_id: workId,
      isHidden: false
    };

    const created = await repo.create(input);

    expect(created.props.id).toBeDefined();
    expect(created.props.coordinates.lat).toBe(-23.0);

    const found = await repo.findById(created.props.id);
    expect(found).toBeDefined();
    expect(found?.props.coordinates.lat).toBe(-23.0);
  });
});
