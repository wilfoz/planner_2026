import { Prisma } from '@prisma/client';
import { TaskEntity } from '@/contexts/task/domain/task.entity';
import { TaskListResult, TaskRepository } from '@/contexts/task/domain/task.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import { isPrismaRecordNotFoundError } from '@/shared/infrastructure/database/prisma/prisma-errors';

export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(input: { code: number; stage: string; group: string; name: string; unit: string; work_id: string }): Promise<TaskEntity> {
    const { work_id, ...taskData } = input;
    const created = await this.prisma.$transaction(async (tx) => {
      // 1. Create the Task
      const task = await tx.task.create({ data: taskData });

      // 2. Create the Production associated with the Work and Task
      await tx.production.create({
        data: {
          task_id: task.id,
          work_id: work_id,
          status: 'EXECUTED', // Default status as per plan
        },
      });

      return task;
    });

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

    const workId = input.work_id;

    const where: Prisma.TaskWhereInput = {
      ...(workId ? { production: { work_id: workId } } : {}),
      ...(filter
        ? {
          OR: [
            { name: { contains: filter, mode: 'insensitive' as const } },
            { stage: { contains: filter, mode: 'insensitive' as const } },
            { group: { contains: filter, mode: 'insensitive' as const } },
            { unit: { contains: filter, mode: 'insensitive' as const } },
          ],
        }
        : {}),
    };

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
      await this.prisma.$transaction(async (tx) => {
        // Since Task has a 1-to-1 or 1-to-many relation with Production (schema dependent), we should safe delete.
        // Assuming Task 1-1 Production based on schema (production -> task_id unique).
        await tx.production.deleteMany({ where: { task_id: id } });
        await tx.task.delete({ where: { id } });
      });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Task not found');
      throw e;
    }
  }
}

