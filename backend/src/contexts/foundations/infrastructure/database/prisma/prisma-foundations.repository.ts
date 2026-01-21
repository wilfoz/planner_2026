import { Foundation } from '@/contexts/foundations/domain/foundation.entity';
import { FoundationsListResult, FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';
import { ConflictError } from '@/shared/errors/conflict.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import {
  isPrismaRecordNotFoundError,
  isPrismaUniqueConstraintError,
} from '@/shared/infrastructure/database/prisma/prisma-errors';

export class PrismaFoundationsRepository implements FoundationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    project: string;
    revision: string;
    description: string;
    excavation_volume?: number | null;
    concrete_volume?: number | null;
    backfill_volume?: number | null;
    steel_volume?: number | null;
  }): Promise<Foundation> {
    try {
      const created = await this.prisma.foundation.create({
        data: {
          project: input.project,
          revision: input.revision,
          description: input.description,
          excavation_volume: input.excavation_volume ?? null,
          concrete_volume: input.concrete_volume ?? null,
          backfill_volume: input.backfill_volume ?? null,
          steel_volume: input.steel_volume ?? null,
        },
      });

      return new Foundation({ ...created, createdAt: created.createdAt });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Foundation already exists');
      throw e;
    }
  }

  async findById(id: string): Promise<Foundation | null> {
    const found = await this.prisma.foundation.findUnique({ where: { id } });
    if (!found) return null;
    return new Foundation({ ...found, createdAt: found.createdAt });
  }

  async list(input: PageInput): Promise<FoundationsListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();

    const where = filter
      ? {
          OR: [
            { description: { contains: filter, mode: 'insensitive' as const } },
            { project: { contains: filter, mode: 'insensitive' as const } },
            { revision: { contains: filter, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderByField =
      input.sort && ['createdAt', 'description', 'project', 'revision'].includes(input.sort)
        ? input.sort
        : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.foundation.count({ where }),
      this.prisma.foundation.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      total,
      items: items.map((f) => new Foundation({ ...f, createdAt: f.createdAt })),
    };
  }

  async update(
    id: string,
    input: Partial<{
      project: string;
      revision: string;
      description: string;
      excavation_volume?: number | null;
      concrete_volume?: number | null;
      backfill_volume?: number | null;
      steel_volume?: number | null;
    }>,
  ): Promise<Foundation> {
    try {
      const updated = await this.prisma.foundation.update({
        where: { id },
        data: {
          ...(input.project !== undefined ? { project: input.project } : {}),
          ...(input.revision !== undefined ? { revision: input.revision } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.excavation_volume !== undefined ? { excavation_volume: input.excavation_volume } : {}),
          ...(input.concrete_volume !== undefined ? { concrete_volume: input.concrete_volume } : {}),
          ...(input.backfill_volume !== undefined ? { backfill_volume: input.backfill_volume } : {}),
          ...(input.steel_volume !== undefined ? { steel_volume: input.steel_volume } : {}),
        },
      });
      return new Foundation({ ...updated, createdAt: updated.createdAt });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Foundation already exists');
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Foundation not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.foundation.delete({ where: { id } });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Foundation not found');
      throw e;
    }
  }
}

