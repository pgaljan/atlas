import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class StructurePermissionGuard implements CanActivate {
//   private readonly allowedRoles = ['owner', 'editor', 'commenter', 'viewer'];

//   constructor(private readonly prisma: PrismaService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest();
//     const user = req.user;

//     const GENERIC_FORBIDDEN_MSG =
//       'You no longer have access to this structure.';

//     if (!user?.id) {
//       throw new ForbiddenException(GENERIC_FORBIDDEN_MSG);
//     }

//     try {
//       const structureId = await this.resolveStructureId(req);

//       if (!structureId) {
//         throw new Error('no-structure-id');
//       }

//       (req as any).__resolvedStructureId = structureId;

//       const structure = await this.prisma.structure.findUnique({
//         where: { id: structureId },
//         select: { ownerId: true },
//       });
//       if (structure && structure.ownerId === user.id) {
//         (req as any).__structurePermission = 'owner';
//         return true;
//       }

//       const share = await this.prisma.structureShare.findUnique({
//         where: { structureId_userId: { structureId, userId: user.id } },
//         select: { permission: true },
//       });
//       if (share) {
//         (req as any).__structurePermission = String(share.permission);
//         if (this.allowedRoles.includes(String(share.permission))) {
//           return true;
//         } else {
//           throw new Error('insufficient-permission');
//         }
//       }

//       const invite = await this.prisma.structureShareInvitation.findFirst({
//         where: { structureId, inviteeId: user.id, status: 'accepted' },
//         select: { permission: true },
//       });
//       if (invite) {
//         (req as any).__structurePermission = String(invite.permission);
//         if (this.allowedRoles.includes(String(invite.permission))) {
//           return true;
//         } else {
//           throw new Error('insufficient-permission');
//         }
//       }

//       throw new Error('not-collaborator');
//     } catch (err) {
//       throw new ForbiddenException(GENERIC_FORBIDDEN_MSG);
//     }
//   }

//   private async resolveStructureId(req: any): Promise<string | null> {
//     const body = req.body ?? {};
//     const query = req.query ?? {};
//     const params = req.params ?? {};

//     if (body.structureId) return body.structureId;
//     if (query.structureId) return query.structureId;
//     if (params.structureId) return params.structureId;

//     const elementId =
//       params.elementId ||
//       params.id ||
//       query.elementId ||
//       body.elementId ||
//       body.element?.id;
//     if (elementId) {
//       const el = await this.prisma.element.findUnique({
//         where: { id: elementId },
//         select: { structureId: true },
//       });
//       if (el?.structureId) return el.structureId;
//       return null;
//     }

//     const recordId =
//       params.recordId || query.recordId || body.recordId || body.record?.id;
//     if (recordId) {
//       const elementForRecord = await this.prisma.element.findFirst({
//         where: { recordId },
//         select: { structureId: true },
//       });
//       if (elementForRecord?.structureId) return elementForRecord.structureId;
//       return null;
//     }

//     return null;
//   }
// }
@Injectable()
export class StructurePermissionGuard implements CanActivate {
  private readonly allowedRoles = ['owner', 'editor', 'commenter', 'viewer'];

  constructor(private readonly prisma: PrismaService) {}

 async canActivate(context: ExecutionContext): Promise<boolean> {
  const req = context.switchToHttp().getRequest();
  const user = req.user;
  const GENERIC_FORBIDDEN_MSG = 'You no longer have access to this structure.';

  if (!user?.id) return true; // Allow public uploads if no user?

  try {
    const structureId = await this.resolveStructureId(req);

    // No structure → public upload → allow
    if (!structureId) return true;

    (req as any).__resolvedStructureId = structureId;

    // Fetch structure
    const structure = await this.prisma.structure.findUnique({
      where: { id: structureId },
      select: { ownerId: true },
    });

    if (!structure) return true; // structure not found → maybe public → allow

    if (structure.ownerId === user.id) {
      (req as any).__structurePermission = 'owner';
      return true;
    }

    // Check collaborator
    const share = await this.prisma.structureShare.findUnique({
      where: { structureId_userId: { structureId, userId: user.id } },
      select: { permission: true },
    });

    if (share && this.allowedRoles.includes(String(share.permission))) {
      (req as any).__structurePermission = String(share.permission);
      return true;
    }

    // Check invitation
    const invite = await this.prisma.structureShareInvitation.findFirst({
      where: { structureId, inviteeId: user.id, status: 'accepted' },
      select: { permission: true },
    });

    if (invite && this.allowedRoles.includes(String(invite.permission))) {
      (req as any).__structurePermission = String(invite.permission);
      return true;
    }

    // No access → forbidden
    throw new ForbiddenException(GENERIC_FORBIDDEN_MSG);
  } catch (err) {
    // Only throw forbidden if structure exists and user is not owner/collaborator
    if ((req as any).__resolvedStructureId) {
      throw new ForbiddenException(GENERIC_FORBIDDEN_MSG);
    }
    return true;
  }
}


  private async resolveStructureId(req: any): Promise<string | null> {
    const body = req.body ?? {};
    const query = req.query ?? {};
    const params = req.params ?? {};

    if (body.structureId) return body.structureId;
    if (query.structureId) return query.structureId;
    if (params.structureId) return params.structureId;

    const elementId =
      params.elementId ||
      params.id ||
      query.elementId ||
      body.elementId ||
      body.element?.id;
    if (elementId) {
      const el = await this.prisma.element.findUnique({
        where: { id: elementId },
        select: { structureId: true },
      });
      if (el?.structureId) return el.structureId;
      return null;
    }

    const recordId =
      params.recordId || query.recordId || body.recordId || body.record?.id;
    if (recordId) {
      const elementForRecord = await this.prisma.element.findFirst({
        where: { recordId },
        select: { structureId: true },
      });
      if (elementForRecord?.structureId) return elementForRecord.structureId;
      return null;
    }

    return null;
  }
}
