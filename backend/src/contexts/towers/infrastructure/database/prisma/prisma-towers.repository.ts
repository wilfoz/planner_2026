import { Tower as PrismaTower, Foundation as PrismaFoundation, Prisma } from '@prisma/client';

import { Foundation } from '@/contexts/foundations/domain/foundation.entity';
import { Coordinates } from '@/contexts/towers/domain/coordinates.type';
import { Tower } from '@/contexts/towers/domain/tower.entity';
import { ListTowersInput, TowersListResult, TowersRepository } from '@/contexts/towers/domain/towers.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import {
  isPrismaRecordNotFoundError,
} from '@/shared/infrastructure/database/prisma/prisma-errors';

function mapTower(record: PrismaTower & { foundations: PrismaFoundation[] }): Tower {
  const foundations = (record.foundations ?? []).map(
    (f) =>
      new Foundation({
        id: f.id,
        project: f.project,
        revision: f.revision,
        description: f.description,
        excavation_volume: f.excavation_volume,
        concrete_volume: f.concrete_volume,
        backfill_volume: f.backfill_volume,
        steel_volume: f.steel_volume,
        createdAt: f.createdAt,
      }),
  );

  return new Tower({
    id: record.id,
    code: record.code,
    tower_number: record.tower_number,
    type: record.type,
    coordinates: record.coordinates as Coordinates,
    distance: record.distance,
    height: record.height,
    weight: record.weight,
    embargo: record.embargo,
    deflection: record.deflection,
    structureType: record.structureType,
    color: record.color,
    isHidden: record.isHidden,
    work_id: record.work_id,
    createdAt: record.createdAt,
    foundations,
  });
}

export class PrismaTowersRepository implements TowersRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(input: {
    code: number;
    tower_number: string;
    type: string;
    coordinates: Coordinates;
    distance?: number | null;
    height?: number | null;
    weight?: number | null;
    embargo?: string | null;
    deflection?: number | null;
    structureType?: string | null;
    color?: string | null;
    isHidden?: boolean;
    work_id: string;
    foundations?: string[];
  }): Promise<Tower> {
    try {
      const created = await this.prisma.tower.create({
        data: {
          code: input.code,
          tower_number: input.tower_number,
          type: input.type,
          coordinates: input.coordinates as Prisma.InputJsonValue,
          distance: input.distance ?? null,
          height: input.height ?? null,
          weight: input.weight ?? null,
          embargo: input.embargo ?? null,
          deflection: input.deflection ?? null,
          structureType: input.structureType ?? null,
          color: input.color ?? null,
          isHidden: input.isHidden ?? false,
          work: { connect: { id: input.work_id } },
          ...(input.foundations
            ? { foundations: { connect: input.foundations.map((id) => ({ id })) } }
            : {}),
        },
        include: { foundations: true },
      });

      return mapTower(created);
    } catch (e) {
      // connect failures for foundations (or others)
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Tower or foundation not found');
      throw e;
    }
  }

  async findById(id: string): Promise<Tower | null> {
    const found = await this.prisma.tower.findUnique({
      where: { id },
      include: { foundations: true },
    });
    if (!found) return null;
    return mapTower(found);
  }

  async list(input: ListTowersInput): Promise<TowersListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();
    const workId = input.work_id;

    const where: Prisma.TowerWhereInput = {
      ...(workId ? { work_id: workId } : {}),
    };

    if (filter) {
      where.OR = [
        { tower_number: { contains: filter, mode: 'insensitive' as const } },
        { type: { contains: filter, mode: 'insensitive' as const } },
      ];
    }

    const orderByField = input.sort && ['createdAt', 'code', 'tower_number', 'type'].includes(input.sort)
      ? input.sort
      : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.tower.count({ where }),
      this.prisma.tower.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
        include: { foundations: true },
      }),
    ]);

    return { total, items: items.map(mapTower) };
  }

  async update(
    id: string,
    input: Partial<{
      code: number;
      tower_number: string;
      type: string;
      coordinates: Coordinates;
      distance?: number | null;
      height?: number | null;
      weight?: number | null;
      embargo?: string | null;
      deflection?: number | null;
      structureType?: string | null;
      color?: string | null;
      isHidden?: boolean;
      work_id?: string;
      foundations?: string[];
    }>,
  ): Promise<Tower> {
    try {
      const updated = await this.prisma.tower.update({
        where: { id },
        data: {
          ...(input.code !== undefined ? { code: input.code } : {}),
          ...(input.tower_number !== undefined ? { tower_number: input.tower_number } : {}),
          ...(input.type !== undefined ? { type: input.type } : {}),
          ...(input.coordinates !== undefined ? { coordinates: input.coordinates as Prisma.InputJsonValue } : {}),
          ...(input.distance !== undefined ? { distance: input.distance } : {}),
          ...(input.height !== undefined ? { height: input.height } : {}),
          ...(input.weight !== undefined ? { weight: input.weight } : {}),
          ...(input.embargo !== undefined ? { embargo: input.embargo } : {}),
          ...(input.deflection !== undefined ? { deflection: input.deflection } : {}),
          ...(input.structureType !== undefined ? { structureType: input.structureType } : {}),
          ...(input.color !== undefined ? { color: input.color } : {}),
          ...(input.isHidden !== undefined ? { isHidden: input.isHidden } : {}),
          ...(input.work_id !== undefined ? { work: { connect: { id: input.work_id } } } : {}),
          ...(input.foundations !== undefined
            ? { foundations: { set: input.foundations.map((fid) => ({ id: fid })) } }
            : {}),
        },
        include: { foundations: true },
      });
      return mapTower(updated);
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Tower or foundation not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.tower.delete({ where: { id } });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Tower not found');
      throw e;
    }
  }
}

