import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );


    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Unauthorized');

    if (!user.roles || user.roles.length === 0) {
      // roles.guard.ts
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true, roles: true },
      });

      const merged: any[] = [];
      if (dbUser?.role) merged.push(dbUser.role);
      if (Array.isArray(dbUser?.roles)) merged.push(...dbUser.roles);
      user.roles = merged;
      request.user = user;
    }

    console.log(
      'RolesGuard user.roles:',
      user.roles?.map((r) => r.name),
    );

    const hasRole = user.roles.some((r) => requiredRoles.includes(r.name));
    if (!hasRole) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
