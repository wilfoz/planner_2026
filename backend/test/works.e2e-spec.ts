import { PrismaClient } from '@prisma/client';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/app.module';
import { applyGlobalConfig } from '@/shared/config/apply-global-config';
import { setupPrismaTests } from '@test/setupPrismaTests';

describe('Works (e2e)', () => {
  setupPrismaTests();

  let app: NestFastifyApplication;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
    // Clean up
    await prisma.production.deleteMany();
    await prisma.tower.deleteMany();
    await prisma.work.deleteMany();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    applyGlobalConfig(app);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('should create, list, update and delete a work', async () => {
    // 0. Register and Login
    await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'WorkTester', email: 'worktester@example.com', password: 'password' });

    const loginRes = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'worktester@example.com', password: 'password' });

    const token = loginRes.body.accessToken;
    expect(token).toBeDefined();

    // 1. Create Work
    const createDto = {
      name: 'E2E Test Work',
      contractor: 'Test Contractor',
      tension: 500,
      extension: 100.5,
      phases: 3,
      circuits: 2,
      lightning_rod: 1,
      number_of_conductor_cables: 4,
      start_date: '2026-01-01T00:00:00.000Z',
      end_date: '2026-12-31T00:00:00.000Z',
      states: ['SP', 'RJ'],
    };

    const createRes = await request(app.getHttpServer())
      .post('/works')
      .set('Authorization', `Bearer ${token}`)
      .send(createDto)
      .expect(201);

    const createdId = createRes.body.data.id;
    expect(createdId).toBeDefined();
    expect(createRes.body.data.name).toBe(createDto.name);
    expect(createRes.body.data.contractor).toBe(createDto.contractor);
    expect(createRes.body.data.number_of_conductor_cables).toBe(createDto.number_of_conductor_cables);
    expect(createRes.body.data.states).toEqual(expect.arrayContaining(createDto.states));

    // 2. List Works
    const listRes = await request(app.getHttpServer())
      .get('/works?page=1&per_page=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // The interceptor wraps { total, items } into data: { total, items }
    // So checking listRes.body.data.total
    expect(listRes.body.data.total).toBeGreaterThanOrEqual(1);
    const foundInList = listRes.body.data.items.find((w: any) => w.id === createdId);
    expect(foundInList).toBeDefined();
    expect(foundInList.contractor).toBe(createDto.contractor);

    // 3. Get By ID
    const getRes = await request(app.getHttpServer())
      .get(`/works/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.data.id).toBe(createdId);
    expect(getRes.body.data.name).toBe(createDto.name);

    // 4. Update Work
    const updateDto = {
      name: 'Updated Work Name',
      contractor: 'Updated Contractor',
      tension: 230,
    };

    const updateRes = await request(app.getHttpServer())
      .put(`/works/${createdId}`) // Assuming PUT, checking controller might be safer but usually it's PUT or PATCH
      .set('Authorization', `Bearer ${token}`)
      .send(updateDto)
      .expect(200);

    expect(updateRes.body.data.name).toBe(updateDto.name);
    expect(updateRes.body.data.contractor).toBe(updateDto.contractor);
    expect(updateRes.body.data.tension).toBe(updateDto.tension);

    // Verify update with GET
    const getUpdatedRes = await request(app.getHttpServer())
      .get(`/works/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getUpdatedRes.body.data.name).toBe(updateDto.name);

    // 5. Delete Work
    await request(app.getHttpServer())
      .delete(`/works/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Verify deletion
    await request(app.getHttpServer())
      .get(`/works/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
