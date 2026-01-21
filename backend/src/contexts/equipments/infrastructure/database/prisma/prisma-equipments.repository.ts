import { STATUS_EQUIPMENT } from '@prisma/client';

import { Equipment } from '@/contexts/equipments/domain/equipment.entity';
import { EquipmentsListResult, EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';
import { ConflictError } from '@/shared/errors/conflict.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import {
  isPrismaRecordNotFoundError,
  isPrismaUniqueConstraintError,
} from '@/shared/infrastructure/database/prisma/prisma-errors';

export class PrismaEquipmentsRepository implements EquipmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    registration: string;
    model: string;
    manufacturer: string;
    license_plate: string;
    provider: string;
    status: STATUS_EQUIPMENT;
    team_id?: string | null;
  }): Promise<Equipment> {
    try {
      const created = await this.prisma.equipment.create({
        data: {
          registration: input.registration,
          model: input.model,
          manufacturer: input.manufacturer,
          license_plate: input.license_plate,
          provider: input.provider,
          status: input.status,
          team_id: input.team_id ?? null,
        },
      });
      return new Equipment({ ...created, team_id: created.team_id, createdAt: created.createdAt });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Equipment already exists');
      throw e;
    }
  }

  async findById(id: string): Promise<Equipment | null> {
    const found = await this.prisma.equipment.findUnique({ where: { id } });
    if (!found) return null;
    return new Equipment({ ...found, team_id: found.team_id, createdAt: found.createdAt });
  }

  async list(input: PageInput): Promise<EquipmentsListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();

    const where = filter
      ? {
          OR: [
            { license_plate: { contains: filter, mode: 'insensitive' as const } },
            { registration: { contains: filter, mode: 'insensitive' as const } },
            { model: { contains: filter, mode: 'insensitive' as const } },
            { manufacturer: { contains: filter, mode: 'insensitive' as const } },
            { provider: { contains: filter, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderByField =
      input.sort &&
      ['createdAt', 'license_plate', 'registration', 'model', 'manufacturer', 'provider'].includes(input.sort)
        ? input.sort
        : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.equipment.count({ where }),
      this.prisma.equipment.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      total,
      items: items.map((e) => new Equipment({ ...e, team_id: e.team_id, createdAt: e.createdAt })),
    };
  }

  async update(
    id: string,
    input: Partial<{
      registration: string;
      model: string;
      manufacturer: string;
      license_plate: string;
      provider: string;
      status: STATUS_EQUIPMENT;
      team_id?: string | null;
    }>,
  ): Promise<Equipment> {
    try {
      const updated = await this.prisma.equipment.update({
        where: { id },
        data: {
          ...(input.registration !== undefined ? { registration: input.registration } : {}),
          ...(input.model !== undefined ? { model: input.model } : {}),
          ...(input.manufacturer !== undefined ? { manufacturer: input.manufacturer } : {}),
          ...(input.license_plate !== undefined ? { license_plate: input.license_plate } : {}),
          ...(input.provider !== undefined ? { provider: input.provider } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.team_id !== undefined ? { team_id: input.team_id } : {}),
        },
      });
      return new Equipment({ ...updated, team_id: updated.team_id, createdAt: updated.createdAt });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Equipment already exists');
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Equipment not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.equipment.delete({ where: { id } });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Equipment not found');
      throw e;
    }
  }
}

