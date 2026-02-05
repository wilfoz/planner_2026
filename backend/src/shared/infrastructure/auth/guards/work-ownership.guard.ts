import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class WorkOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { id } = request.params;

    if (!user) return false;

    // Check for ADMIN role in realm_access
    const roles = user.realm_access?.roles || [];
    if (roles.includes('ADMIN')) {
      return true;
    }

    // Check if Work ID is in assigned_works attribute
    // Note: Keycloak mappers usually return this as an array of strings
    const assignedWorks = user.assigned_works;

    if (Array.isArray(assignedWorks) && assignedWorks.includes(id)) {
      return true;
    }

    // Fallback if it's a single string (unlikely with multivalued=true but possible)
    if (typeof assignedWorks === 'string' && assignedWorks === id) {
      return true;
    }

    throw new ForbiddenException(`You do not have permission to access Work ID: ${id}`);
  }
}
