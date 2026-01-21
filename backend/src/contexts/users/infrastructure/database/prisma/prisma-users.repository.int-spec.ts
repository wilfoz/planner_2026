import { PrismaClient } from '@prisma/client';

import { PrismaUsersRepository } from '@/contexts/users/infrastructure/database/prisma/prisma-users.repository';
import { setupPrismaTests } from '@test/setupPrismaTests';

describe('PrismaUsersRepository (integration)', () => {
  setupPrismaTests();

  const prisma = new PrismaClient();
  const repo = new PrismaUsersRepository(prisma as any);

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates and finds user by email', async () => {
    const created = await repo.create({
      name: 'Test',
      email: 'test@example.com',
      password: 'hashed',
    });

    const found = await repo.findByEmail('test@example.com');

    expect(found?.props.id).toBe(created.props.id);
    expect(found?.props.email).toBe('test@example.com');
  });
});

