import { PrismaClient } from '@prisma/client';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/app.module';
import { applyGlobalConfig } from '@/shared/config/apply-global-config';
import { setupPrismaTests } from '@test/setupPrismaTests';

describe('Productions (e2e)', () => {
  setupPrismaTests();

  let app: NestFastifyApplication;
  const prisma = new PrismaClient();
  let workId: string;
  let taskId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Cleanup
    await prisma.production.deleteMany();
    await prisma.tower.deleteMany(); // Deleting towers before works
    await prisma.task.deleteMany();
    await prisma.work.deleteMany();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    applyGlobalConfig(app);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // Create Work
    const work = await prisma.work.create({
      data: {
        name: 'Test Work Productions',
        tension: 230,
      },
    });
    workId = work.id;

    // Create Task
    const task = await prisma.task.create({
      data: {
        code: 101,
        stage: 'Foundation',
        group: 'Civil',
        name: 'Excavation',
        unit: 'm3',
      },
    });
    taskId = task.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('create and list productions', async () => {
    const createDto = {
      task_id: taskId,
      work_id: workId,
      status: 'EXECUTED',
      comments: 'Test production comment',
    };

    // Create
    const create = await request(app.getHttpServer())
      .post('/production')
      .send(createDto)
      .expect(201);

    expect(create.body).toHaveProperty('data.id');
    expect(create.body.data).toHaveProperty('task_id', taskId);
    expect(create.body.data).toHaveProperty('status', 'EXECUTED');

    // List
    const list = await request(app.getHttpServer())
      .get(`/production?page=1&per_page=10`)
      .expect(200);

    expect(list.body).toHaveProperty('meta');
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
    const createdProduction = list.body.data.find((p: any) => p.id === create.body.data.id);
    expect(createdProduction).toBeDefined();
    expect(createdProduction).toHaveProperty('comments', 'Test production comment');
  });
});
