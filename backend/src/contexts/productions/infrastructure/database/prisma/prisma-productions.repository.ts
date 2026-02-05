import { Production as PrismaProduction } from '@prisma/client';

import { ProductionEntity } from '@/contexts/productions/domain/production.entity';
import { ProductionsListResult, ProductionsRepository } from '@/contexts/productions/domain/productions.repository';
import { ConflictError } from '@/shared/errors/conflict.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import {
  isPrismaForeignKeyError,
  isPrismaRecordNotFoundError,
  isPrismaUniqueConstraintError,
} from '@/shared/infrastructure/database/prisma/prisma-errors';

type ProductionRecord = PrismaProduction & { teams: { id: string }[]; towers: { id: string }[] };

function mapProduction(record: ProductionRecord): ProductionEntity {
  return new ProductionEntity({
    id: record.id,
    status: record.status,
    comments: record.comments,
    start_time: record.start_time,
    final_time: record.final_time,
    task_id: record.task_id,
    work_id: record.work_id,
    teams: record.teams.map((t) => t.id),
    towers: record.towers.map((t) => t.id),
    createdAt: record.createdAt,
  });
}

export class PrismaProductionsRepository implements ProductionsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(input: {
    status: any;
    comments?: string | null;
    start_time?: Date | null;
    final_time?: Date | null;
    task_id: string;
    work_id: string;
    teams?: string[];
    towers?: string[];
  }): Promise<ProductionEntity> {
    try {
      const created = await this.prisma.production.create({
        data: {
          status: input.status,
          comments: input.comments ?? null,
          start_time: input.start_time ?? null,
          final_time: input.final_time ?? null,
          task_id: input.task_id,
          work_id: input.work_id,
          ...(input.teams ? { teams: { connect: input.teams.map((id) => ({ id })) } } : {}),
          ...(input.towers ? { towers: { connect: input.towers.map((id) => ({ id })) } } : {}),
        },
        include: { teams: { select: { id: true } }, towers: { select: { id: true } } },
      });
      return mapProduction(created as ProductionRecord);
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Production already exists for this task');
      if (isPrismaForeignKeyError(e) || isPrismaRecordNotFoundError(e)) throw new NotFoundError('Task/team/tower not found');
      throw e;
    }
  }

  async findById(id: string): Promise<ProductionEntity | null> {
    const found = await this.prisma.production.findUnique({
      where: { id },
      include: { teams: { select: { id: true } }, towers: { select: { id: true } } },
    });
    if (!found) return null;
    return mapProduction(found as ProductionRecord);
  }

  async list(input: PageInput): Promise<ProductionsListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();

    const where: any = filter
      ? {
        OR: [
          { comments: { contains: filter, mode: 'insensitive' as const } },
          { task_id: { contains: filter, mode: 'insensitive' as const } },
        ],
      }
      : {};

    if (input.work_id) {
      where.work_id = input.work_id;
    }

    const orderByField =
      input.sort && ['createdAt', 'status', 'task_id', 'start_time', 'final_time'].includes(input.sort)
        ? input.sort
        : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.production.count({ where }),
      this.prisma.production.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
        include: { teams: { select: { id: true } }, towers: { select: { id: true } } },
      }),
    ]);

    return { total, items: (items as ProductionRecord[]).map(mapProduction) };
  }

  async update(
    id: string,
    input: Partial<{
      status: any;
      comments?: string | null;
      start_time?: Date | null;
      final_time?: Date | null;
      task_id: string;
      work_id?: string;
      teams?: string[];
      towers?: string[];
    }>,
  ): Promise<ProductionEntity> {
    try {
      const updated = await this.prisma.production.update({
        where: { id },
        data: {
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.comments !== undefined ? { comments: input.comments } : {}),
          ...(input.start_time !== undefined ? { start_time: input.start_time } : {}),
          ...(input.final_time !== undefined ? { final_time: input.final_time } : {}),
          ...(input.task_id !== undefined ? { task_id: input.task_id } : {}),
          ...(input.work_id !== undefined ? { work_id: input.work_id } : {}),
          ...(input.teams !== undefined ? { teams: { set: input.teams.map((tid) => ({ id: tid })) } } : {}),
          ...(input.towers !== undefined ? { towers: { set: input.towers.map((tid) => ({ id: tid })) } } : {}),
        },
        include: { teams: { select: { id: true } }, towers: { select: { id: true } } },
      });
      return mapProduction(updated as ProductionRecord);
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Production already exists for this task');
      if (isPrismaForeignKeyError(e) || isPrismaRecordNotFoundError(e)) throw new NotFoundError('Production/task/team/tower not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.production.delete({ where: { id } });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Production not found');
      throw e;
    }
  }

  async addTeam(productionId: string, teamId: string): Promise<ProductionEntity> {
    try {
      const updated = await this.prisma.production.update({
        where: { id: productionId },
        data: { teams: { connect: { id: teamId } } },
        include: { teams: { select: { id: true } }, towers: { select: { id: true } } },
      });
      return mapProduction(updated as ProductionRecord);
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Production/team not found');
      throw e;
    }
  }

  async delTeam(productionId: string, teamId: string): Promise<ProductionEntity> {
    try {
      const updated = await this.prisma.production.update({
        where: { id: productionId },
        data: { teams: { disconnect: { id: teamId } } },
        include: { teams: { select: { id: true } }, towers: { select: { id: true } } },
      });
      return mapProduction(updated as ProductionRecord);
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Production/team not found');
      throw e;
    }
  }

  async addTower(productionId: string, towerId: string): Promise<ProductionEntity> {
    try {
      const updated = await this.prisma.production.update({
        where: { id: productionId },
        data: { towers: { connect: { id: towerId } } },
        include: { teams: { select: { id: true } }, towers: { select: { id: true } } },
      });
      return mapProduction(updated as ProductionRecord);
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Production/tower not found');
      throw e;
    }
  }

  async delTower(productionId: string, towerId: string): Promise<ProductionEntity> {
    try {
      const updated = await this.prisma.production.update({
        where: { id: productionId },
        data: { towers: { disconnect: { id: towerId } } },
        include: { teams: { select: { id: true } }, towers: { select: { id: true } } },
      });
      return mapProduction(updated as ProductionRecord);
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Production/tower not found');
      throw e;
    }
  }
}

