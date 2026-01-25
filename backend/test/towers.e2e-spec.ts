import { PrismaClient } from '@prisma/client';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/app.module';
import { applyGlobalConfig } from '@/shared/config/apply-global-config';
import { setupPrismaTests } from '@test/setupPrismaTests';

describe('Towers (e2e)', () => {
  setupPrismaTests();

  let app: NestFastifyApplication;
  const prisma = new PrismaClient();
  let workId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Clean up databases with correct order for relations
    await prisma.production.deleteMany();
    await prisma.tower.deleteMany();
    await prisma.work.deleteMany();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    applyGlobalConfig(app);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // Create a Work for testing
    const work = await prisma.work.create({
      data: {
        name: 'Test Work Towers',
        tension: 138,
      },
    });
    workId = work.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('create and list towers', async () => {
    const createDto = {
      code: 1,
      tower_number: 'T-01',
      type: 'Suspension',
      coordinates: { lat: 10, lng: 20, altitude: 30 },
      work_id: workId,
    };

    // Create
    const create = await request(app.getHttpServer())
      .post('/tower')
      .send(createDto)
      .expect(201);

    expect(create.body).toHaveProperty('data.id');
    expect(create.body.data).toHaveProperty('tower_number', 'T-01');

    // List
    const list = await request(app.getHttpServer())
      .get(`/tower?page=1&per_page=10&work_id=${workId}`)
      .expect(200);

    expect(list.body).toHaveProperty('meta');
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
    expect(list.body.data[0]).toHaveProperty('tower_number', 'T-01');
  });
});
