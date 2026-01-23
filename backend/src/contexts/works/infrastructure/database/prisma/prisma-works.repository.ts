
import { Work as PrismaWork } from '@prisma/client';

import { Work } from '@/contexts/works/domain/work.entity';
import { WorksListResult, WorksRepository } from '@/contexts/works/domain/works.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import {
  isPrismaRecordNotFoundError,
} from '@/shared/infrastructure/database/prisma/prisma-errors';

function mapWork(record: PrismaWork): Work {
  return new Work({
    id: record.id,
    name: record.name,
    tension: record.tension,
    extension: record.extension,
    phases: record.phases,
    circuits: record.circuits,
    lightning_rod: record.lightning_rod,
    start_date: record.start_date,
    end_date: record.end_date,
    createdAt: record.createdAt,
  });
}

export class PrismaWorksRepository implements WorksRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(input: {
    name: string;
    tension?: number | null;
    extension?: number | null;
    phases?: number | null;
    circuits?: number | null;
    lightning_rod?: number | null;
    start_date?: Date | null;
    end_date?: Date | null;
  }): Promise<Work> {
    const created = await this.prisma.work.create({
      data: {
        name: input.name,
        tension: input.tension,
        extension: input.extension,
        phases: input.phases,
        circuits: input.circuits,
        lightning_rod: input.lightning_rod,
        start_date: input.start_date,
        end_date: input.end_date,
      },
    });

    return mapWork(created);
  }

  async findById(id: string): Promise<Work | null> {
    const found = await this.prisma.work.findUnique({
      where: { id },
    });
    if (!found) return null;
    return mapWork(found);
  }

  async list(input: PageInput): Promise<WorksListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();

    const where = filter
      ? {
        name: { contains: filter, mode: 'insensitive' as const },
      }
      : {};

    const orderByField = input.sort && ['createdAt', 'name'].includes(input.sort)
      ? input.sort
      : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.work.count({ where }),
      this.prisma.work.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
      }),
    ]);

    return { total, items: items.map(mapWork) };
  }

  async update(
    id: string,
    input: Partial<{
      name: string;
      tension?: number | null;
      extension?: number | null;
      phases?: number | null;
      circuits?: number | null;
      lightning_rod?: number | null;
      start_date?: Date | null;
      end_date?: Date | null;
    }>,
  ): Promise<Work> {
    try {
      const updated = await this.prisma.work.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.tension !== undefined ? { tension: input.tension } : {}),
          ...(input.extension !== undefined ? { extension: input.extension } : {}),
          ...(input.phases !== undefined ? { phases: input.phases } : {}),
          ...(input.circuits !== undefined ? { circuits: input.circuits } : {}),
          ...(input.lightning_rod !== undefined ? { lightning_rod: input.lightning_rod } : {}),
          ...(input.start_date !== undefined ? { start_date: input.start_date } : {}),
          ...(input.end_date !== undefined ? { end_date: input.end_date } : {}),
        },
      });
      return mapWork(updated);
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Work not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.work.delete({ where: { id } });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Work not found');
      throw e;
    }
  }
}
