import { STATUS_EMPLOYEE } from '@prisma/client';

import { Employee } from '@/contexts/employees/domain/employee.entity';
import { EmployeesListResult, EmployeesRepository } from '@/contexts/employees/domain/employees.repository';
import { ConflictError } from '@/shared/errors/conflict.error';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { PageInput } from '@/shared/pagination/pagination';
import {
  isPrismaRecordNotFoundError,
  isPrismaUniqueConstraintError,
} from '@/shared/infrastructure/database/prisma/prisma-errors';

export class PrismaEmployeesRepository implements EmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    registration: string;
    full_name: string;
    occupation: string;
    leadership: boolean;
    status: STATUS_EMPLOYEE;
    team_id?: string | null;
  }): Promise<Employee> {
    try {
      const created = await this.prisma.employee.create({
        data: {
          registration: input.registration,
          full_name: input.full_name,
          occupation: input.occupation,
          leadership: input.leadership,
          status: input.status,
          team_id: input.team_id ?? null,
        },
      });
      return new Employee({ ...created, team_id: created.team_id, createdAt: created.createdAt });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Employee already exists');
      throw e;
    }
  }

  async findById(id: string): Promise<Employee | null> {
    const found = await this.prisma.employee.findUnique({ where: { id } });
    if (!found) return null;
    return new Employee({ ...found, team_id: found.team_id, createdAt: found.createdAt });
  }

  async list(input: PageInput): Promise<EmployeesListResult> {
    const skip = (input.page - 1) * input.per_page;
    const take = input.per_page;
    const filter = input.filter?.trim();

    const where = filter
      ? {
          OR: [
            { full_name: { contains: filter, mode: 'insensitive' as const } },
            { registration: { contains: filter, mode: 'insensitive' as const } },
            { occupation: { contains: filter, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderByField =
      input.sort && ['createdAt', 'full_name', 'registration', 'occupation'].includes(input.sort)
        ? input.sort
        : 'createdAt';

    const [total, items] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        orderBy: { [orderByField]: input.sort_dir ?? 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      total,
      items: items.map((e) => new Employee({ ...e, team_id: e.team_id, createdAt: e.createdAt })),
    };
  }

  async update(
    id: string,
    input: Partial<{
      registration: string;
      full_name: string;
      occupation: string;
      leadership: boolean;
      status: STATUS_EMPLOYEE;
      team_id?: string | null;
    }>,
  ): Promise<Employee> {
    try {
      const updated = await this.prisma.employee.update({
        where: { id },
        data: {
          ...(input.registration !== undefined ? { registration: input.registration } : {}),
          ...(input.full_name !== undefined ? { full_name: input.full_name } : {}),
          ...(input.occupation !== undefined ? { occupation: input.occupation } : {}),
          ...(input.leadership !== undefined ? { leadership: input.leadership } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.team_id !== undefined ? { team_id: input.team_id } : {}),
        },
      });
      return new Employee({ ...updated, team_id: updated.team_id, createdAt: updated.createdAt });
    } catch (e) {
      if (isPrismaUniqueConstraintError(e)) throw new ConflictError('Employee already exists');
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Employee not found');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.employee.delete({ where: { id } });
    } catch (e) {
      if (isPrismaRecordNotFoundError(e)) throw new NotFoundError('Employee not found');
      throw e;
    }
  }
}

