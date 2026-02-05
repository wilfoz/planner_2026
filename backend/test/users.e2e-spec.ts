import { PrismaClient } from '@prisma/client';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/app.module';
import { applyGlobalConfig } from '@/shared/config/apply-global-config';
import { setupPrismaTests } from '@test/setupPrismaTests';

describe('Users (e2e)', () => {
  setupPrismaTests();

  let app: NestFastifyApplication;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.user.deleteMany();

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

  it('signs up, logs in, and lists users with auth', async () => {
    const signup = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'John', email: 'john@example.com', password: '123456' })
      .expect(201);

    expect(signup.body).toHaveProperty('data.id');
    expect(signup.body.data).toHaveProperty('email', 'john@example.com');

    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'john@example.com', password: '123456' })
      .expect(201);

    expect(login.body).toHaveProperty('accessToken');
    expect(login.body).toHaveProperty('user');
    expect(login.body.user).toHaveProperty('email', 'john@example.com');
    const token = login.body.accessToken as string;

    const list = await request(app.getHttpServer())
      .get('/users?page=1&per_page=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body).toHaveProperty('meta');
    expect(Array.isArray(list.body.data)).toBe(true);
  });
});

