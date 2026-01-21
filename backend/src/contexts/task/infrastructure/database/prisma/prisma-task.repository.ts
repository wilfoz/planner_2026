import { TaskEntity } from '@/contexts/task/domain/task.entity';
import { TaskListResult, TaskRepository } from '@/contexts/task/domain/task.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import { isPrismaRecordNotFoundError } from '@/shared/infrastructure/database/prisma/prisma-errors';

export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { code: number; stage: string; group: string; name: string; unit: string }): Promise<TaskEntity> {
    const created = await this.prisma.task.create({ data: input });
    return new TaskEntity({ ...created, createdAt: created.createdAt });
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const found = await this.prisma.task.findUnique({ where: { id } });
    if (!found) return null;
    return new TaskEntity({ ...found, createdAt: found.createdAt });
  }

  async list(input: PageInput): Promise<TaskListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();

    const where = filter
      ? {
          OR: [
            { name: { contains: filter, mode: 'insensitive' as const } },
            { stage: { contains: filter, mode: 'insensitive' as const } },
            { group: { contains: filter, mode: 'insensitive' as const } },
            { unit: { contains: filter, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderByField =
      input.sort && ['createdAt', 'code', 'stage', 'group', 'name', 'unit'].includes(input.sort)
        ? input.sort
        : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      total,
      items: items.map((t) => new TaskEntity({ ...t, createdAt: t.createdAt })),
    };
  }

  async update(id: string, input: Partial<{ code: number; stage: string; group: string; name: string; unit: string }>): Promise<TaskEntity> {
    try {
      const updated = await this.prisma.task.update({
        where: { id },
        data: input,
      });
      return new TaskEntity({ ...updated, createdAt: updated.createdAt });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Task not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Task not found');
      throw e;
    }
  }
}

