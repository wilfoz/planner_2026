import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { User } from '@/contexts/users/domain/user.entity';
import { UsersRepository, UsersListResult } from '@/contexts/users/domain/users.repository';
import { PageInput } from '@/shared/pagination/pagination';
import { ConflictError } from '@/shared/errors/conflict.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import {
  isPrismaRecordNotFoundError,
  isPrismaUniqueConstraintError,
} from '@/shared/infrastructure/database/prisma/prisma-errors';

export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { name?: string | null; email: string; password: string }): Promise<User> {
    try {
      const created = await this.prisma.user.create({
        data: {
          name: input.name ?? null,
          email: input.email,
          password: input.password,
        },
      });
      return new User({
        id: created.id,
        name: created.name,
        email: created.email,
        password: created.password,
        createdAt: created.createdAt,
      });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Email already in use');
      throw e;
    }
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    if (!found) return null;
    return new User({
      id: found.id,
      name: found.name,
      email: found.email,
      password: found.password,
      createdAt: found.createdAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    if (!found) return null;
    return new User({
      id: found.id,
      name: found.name,
      email: found.email,
      password: found.password,
      createdAt: found.createdAt,
    });
  }

  async list(input: PageInput): Promise<UsersListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();

    const where = filter
      ? {
          OR: [
            { email: { contains: filter, mode: 'insensitive' as const } },
            { name: { contains: filter, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderByField =
      input.sort && ['createdAt', 'email', 'name'].includes(input.sort) ? input.sort : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      total,
      items: items.map(
        (u) =>
          new User({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            createdAt: u.createdAt,
          }),
      ),
    };
  }

  async update(id: string, input: { name?: string | null; email?: string }): Promise<User> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.email !== undefined ? { email: input.email } : {}),
        },
      });
      return new User({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        password: updated.password,
        createdAt: updated.createdAt,
      });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Email already in use');
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('User not found');
      throw e;
    }
  }

  async updatePassword(id: string, input: { password: string }): Promise<User> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: { password: input.password },
      });
      return new User({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        password: updated.password,
        createdAt: updated.createdAt,
      });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('User not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('User not found');
      throw e;
    }
  }
}

