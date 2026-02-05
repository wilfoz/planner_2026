import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

@Injectable()
export class TowerAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // Admin bypass
    const roles = user.realm_access?.roles || [];
    if (roles.includes('ADMIN')) {
      return true;
    }

    const method = request.method;

    // 1. Check Work ID from Body (Create) or Query (List - if strictly filtered)
    if (method === 'POST') {
      const workId = request.body?.work_id;
      if (!workId) throw new BadRequestException('work_id is required in body');
      return this.checkWorkAccess(user, workId);
    }

    // 2. Check Tower ID from Params (Get/Update/Delete)
    const { id } = request.params;
    if (id) {
      const tower = await this.prisma.tower.findUnique({
        where: { id },
        select: { work_id: true }
      });

      if (!tower) throw new NotFoundException('Tower not found');

      return this.checkWorkAccess(user, tower.work_id);
    }

    // List operation (GET without ID)
    // List usually filters by work_id in query. 
    // If work_id is present, check it.
    // If not present, we should probably fail or rely on UseCase/Controller to filter?
    // Controller implementation of list uses query.
    // We can rely on Controller + UseCase filtering there.
    // For now, return true for List, assuming Controller handles filtering.
    // Or check query.work_id?
    if (request.query?.work_id) {
      return this.checkWorkAccess(user, request.query.work_id);
    }

    return true;
  }

  private checkWorkAccess(user: any, workId: string): boolean {
    const assignedWorks = user.assigned_works;

    if (Array.isArray(assignedWorks) && assignedWorks.includes(workId)) {
      return true;
    }

    if (typeof assignedWorks === 'string' && assignedWorks === workId) {
      return true;
    }

    throw new ForbiddenException(`You do not have permission to access Works related to ID: ${workId}`);
  }
}
