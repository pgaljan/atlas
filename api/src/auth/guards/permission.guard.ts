import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/common/decorators/permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );


    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Unauthorized');

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
        roles: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!dbUser) throw new ForbiddenException('User not found');

    const userPermissions = new Set<string>();
    if (dbUser.role) {
      for (const rp of dbUser.role.rolePermissions || []) {
        if (rp.permission?.name) userPermissions.add(rp.permission.name);
      }
    }

    for (const r of dbUser.roles || []) {
      for (const rp of r.rolePermissions || []) {
        if (rp.permission?.name) userPermissions.add(rp.permission.name);
      }
    }

    console.log(
      'PermissionGuard userPermissions:',
      Array.from(userPermissions),
    );

    const ok = requiredPermissions.every((p) => userPermissions.has(p));
    if (!ok) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
