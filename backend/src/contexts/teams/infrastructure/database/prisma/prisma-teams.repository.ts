import { Team } from '@/contexts/teams/domain/team.entity';
import { TeamsListResult, TeamsRepository } from '@/contexts/teams/domain/teams.repository';
import { ConflictError } from '@/shared/errors/conflict.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import {
  isPrismaRecordNotFoundError,
  isPrismaUniqueConstraintError,
} from '@/shared/infrastructure/database/prisma/prisma-errors';

export class PrismaTeamsRepository implements TeamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { name: string; employees?: string[]; equipments?: string[] }): Promise<Team> {
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const team = await tx.team.create({ data: { name: input.name } });

        if (input.employees?.length) {
          await tx.employee.updateMany({
            where: { id: { in: input.employees } },
            data: { team_id: team.id },
          });
        }

        if (input.equipments?.length) {
          await tx.equipment.updateMany({
            where: { id: { in: input.equipments } },
            data: { team_id: team.id },
          });
        }

        return await tx.team.findUniqueOrThrow({
          where: { id: team.id },
          include: { employees: { select: { id: true } }, equipments: { select: { id: true } } },
        });
      });

      return new Team({
        id: created.id,
        name: created.name,
        employees: created.employees.map((e) => e.id),
        equipments: created.equipments.map((e) => e.id),
        createdAt: created.createdAt,
      });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Team already exists');
      throw e;
    }
  }

  async findById(id: string): Promise<Team | null> {
    const found = await this.prisma.team.findUnique({
      where: { id },
      include: { employees: { select: { id: true } }, equipments: { select: { id: true } } },
    });
    if (!found) return null;
    return new Team({
      id: found.id,
      name: found.name,
      employees: found.employees.map((e) => e.id),
      equipments: found.equipments.map((e) => e.id),
      createdAt: found.createdAt,
    });
  }

  async list(input: PageInput): Promise<TeamsListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();

    const where = filter ? { name: { contains: filter, mode: 'insensitive' as const } } : {};

    const orderByField = input.sort && ['createdAt', 'name'].includes(input.sort) ? input.sort : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.team.count({ where }),
      this.prisma.team.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
        include: { employees: { select: { id: true } }, equipments: { select: { id: true } } },
      }),
    ]);

    return {
      total,
      items: items.map(
        (t) =>
          new Team({
            id: t.id,
            name: t.name,
            employees: t.employees.map((e) => e.id),
            equipments: t.equipments.map((e) => e.id),
            createdAt: t.createdAt,
          }),
      ),
    };
  }

  async update(id: string, input: { name?: string; employees?: string[]; equipments?: string[] }): Promise<Team> {
    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.team.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Team not found');

        if (input.name !== undefined) {
          await tx.team.update({ where: { id }, data: { name: input.name } });
        }

        if (input.employees) {
          await tx.employee.updateMany({ where: { team_id: id }, data: { team_id: null } });
          if (input.employees.length) {
            await tx.employee.updateMany({ where: { id: { in: input.employees } }, data: { team_id: id } });
          }
        }

        if (input.equipments) {
          await tx.equipment.updateMany({ where: { team_id: id }, data: { team_id: null } });
          if (input.equipments.length) {
            await tx.equipment.updateMany({ where: { id: { in: input.equipments } }, data: { team_id: id } });
          }
        }

        return await tx.team.findUniqueOrThrow({
          where: { id },
          include: { employees: { select: { id: true } }, equipments: { select: { id: true } } },
        });
      });

      return new Team({
        id: updated.id,
        name: updated.name,
        employees: updated.employees.map((e) => e.id),
        equipments: updated.equipments.map((e) => e.id),
        createdAt: updated.createdAt,
      });
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Team already exists');
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Team not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.employee.updateMany({ where: { team_id: id }, data: { team_id: null } });
        await tx.equipment.updateMany({ where: { team_id: id }, data: { team_id: null } });
        await tx.team.delete({ where: { id } });
      });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Team not found');
      throw e;
    }
  }
}

