import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShareDto } from './dto/create-share-structure.dto';
import { InviteShareDto } from './dto/invite-share-structure.dto';
import { UpdateShareDto } from './dto/update-share-structure.dto';

@Injectable()
export class StructureSharesService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(StructureSharesService.name);
  private async logAudit(
    action: string,
    element: string,
    elementId: string,
    details: object,
    userId?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        element,
        elementId,
        details,
        userId: userId || null,
      },
    });
  }

  private async ensureIsOwner(structureId: string, userId: string) {
    const structure = await this.prisma.structure.findUnique({
      where: { id: structureId },
    });
    if (!structure) throw new NotFoundException('Structure not found');
    if (structure.ownerId !== userId)
      throw new ForbiddenException(
        'Only structure owner can perform this action',
      );
    return structure;
  }

  private async getUserPermission(structureId: string, userId: string | null) {
    if (!userId) return null;
    const structure = await this.prisma.structure.findUnique({
      where: { id: structureId },
      select: { ownerId: true },
    });
    if (!structure) throw new NotFoundException('Structure not found');

    if (structure.ownerId === userId) return 'owner' as const;

    const share = await this.prisma.structureShare.findUnique({
      where: { structureId_userId: { structureId, userId } },
      select: { permission: true },
    });

    return share ? (share.permission as any) : null;
  }

  private async ensureHasMinimumPermission(
    structureId: string,
    userId: string,
    allowed: string[],
  ) {
    const perm = await this.getUserPermission(structureId, userId);
    if (!perm || !allowed.includes(perm)) {
      throw new ForbiddenException('Insufficient permission for this action');
    }
  }

  async listShares(structureId: string, currentUserId: string) {
    await this.ensureIsOwner(structureId, currentUserId);

    return this.prisma.structureShare.findMany({
      where: { structureId },
      include: {
        user: { select: { id: true, username: true, displayName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createOrUpdateShare(createDto: CreateShareDto, currentUserId: string) {
    const { structureId, userId, permission } = createDto;

    if ((permission as string) === 'owner') {
      throw new BadRequestException(
        'Use transferOwnership to change structure owner',
      );
    }

    await this.ensureIsOwner(structureId, currentUserId);

    const structure = await this.prisma.structure.findUnique({
      where: { id: structureId },
      select: { ownerId: true, name: true },
    });
    if (structure.ownerId === userId) {
      throw new BadRequestException('User is already the owner');
    }

    const existing = await this.prisma.structureShare.findUnique({
      where: { structureId_userId: { structureId, userId } },
    });

    let result;
    if (existing) {
      result = await this.prisma.structureShare.update({
        where: { id: existing.id },
        data: { permission },
      });

      await this.logAudit(
        'UPDATE_SHARE',
        'StructureShare',
        result.id,
        {
          structureId,
          structureName: structure.name,
          userId,
          permission,
          previousPermission: existing.permission,
        },
        currentUserId,
      );
    } else {
      result = await this.prisma.structureShare.create({
        data: { structureId, userId, permission },
        include: { user: true },
      });

      await this.logAudit(
        'CREATE_SHARE',
        'StructureShare',
        result.id,
        {
          structureId,
          structureName: structure.name,
          userId,
          permission,
        },
        currentUserId,
      );
    }

    return result;
  }

  async removeShare(shareId: string, currentUserId: string) {
    const share = await this.prisma.structureShare.findUnique({
      where: { id: shareId },
      include: {
        structure: {
          select: { name: true },
        },
      },
    });
    if (!share) throw new NotFoundException('Share not found');

    await this.ensureIsOwner(share.structureId, currentUserId);

    await this.prisma.structureShare.delete({ where: { id: shareId } });

    await this.logAudit(
      'DELETE_SHARE',
      'StructureShare',
      shareId,
      {
        structureId: share.structureId,
        structureName: share.structure.name,
        userId: share.userId,
        permission: share.permission,
      },
      currentUserId,
    );

    return { message: 'Share removed successfully' };
  }

  async updateShare(
    invitationId: string,
    dto: UpdateShareDto,
    currentUserId: string,
  ) {
    const invitation = await this.prisma.structureShareInvitation.findUnique({
      where: { id: invitationId },
      include: {
        invitee: { select: { id: true, username: true } },
        inviter: { select: { id: true, username: true } },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');

    await this.ensureIsOwner(invitation.structureId, currentUserId);

    if (String(dto.permission) === 'owner') {
      throw new BadRequestException(
        'Use transferOwnership to change structure owner',
      );
    }

    const [updatedInvitation, updatedShare] = await this.prisma.$transaction([
      this.prisma.structureShareInvitation.update({
        where: { id: invitationId },
        data: { permission: dto.permission },
      }),

      invitation.inviteeId
        ? this.prisma.structureShare.updateMany({
            where: {
              structureId: invitation.structureId,
              userId: invitation.inviteeId,
            },
            data: { permission: dto.permission },
          })
        : null,
    ]);

    await this.logAudit(
      'UPDATE_INVITATION_ROLE',
      'StructureShareInvitation',
      invitationId,
      {
        structureId: invitation.structureId,
        previousPermission: invitation.permission,
        updatedPermission: dto.permission,
        invitee: invitation.invitee
          ? { id: invitation.invitee.id, username: invitation.invitee.username }
          : { username: invitation.inviteeUsername || null },
        inviter: invitation.inviter
          ? { id: invitation.inviter.id, username: invitation.inviter.username }
          : null,
      },
      currentUserId,
    );

    return {
      updatedInvitation,
      updatedShare: updatedShare ?? null, 
    };
  }

  async transferOwnership(
    structureId: string,
    newOwnerUserId: string,
    currentUserId: string,
  ) {
    const structure = await this.prisma.structure.findUnique({
      where: { id: structureId },
    });
    if (!structure) throw new NotFoundException('Structure not found');
    if (structure.ownerId !== currentUserId) {
      throw new ForbiddenException('Only current owner can transfer ownership');
    }
    if (structure.ownerId === newOwnerUserId) {
      throw new BadRequestException('User is already owner');
    }

    const newOwner = await this.prisma.user.findUnique({
      where: { id: newOwnerUserId },
    });
    if (!newOwner) throw new NotFoundException('New owner user not found');

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.structure.update({
        where: { id: structureId },
        data: { ownerId: newOwnerUserId },
      });

      await tx.structureShare.deleteMany({
        where: { structureId, userId: newOwnerUserId },
      });

      await tx.structureShare.upsert({
        where: { structureId_userId: { structureId, userId: currentUserId } },
        update: { permission: 'editor' },
        create: {
          structureId,
          userId: currentUserId,
          permission: 'editor',
        },
      });

      return { success: true };
    });

    await this.logAudit(
      'TRANSFER_OWNERSHIP',
      'Structure',
      structureId,
      {
        structureName: structure.name,
        previousOwnerId: currentUserId,
        newOwnerId: newOwnerUserId,
      },
      currentUserId,
    );

    return result;
  }

  async createInvitation(dto: InviteShareDto, inviterUserId: string) {
    const { structureId, inviteeUsername, permission, message } = dto;

    const structure = await this.ensureIsOwner(structureId, inviterUserId);

    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterUserId },
    });
    if (!inviter) throw new NotFoundException('Inviter not found');

    if (inviteeUsername.toLowerCase() === inviter.username?.toLowerCase()) {
      throw new BadRequestException(
        'You cannot invite yourself to a structure you already own or have access to.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { username: inviteeUsername },
    });
    if (!existingUser) {
      throw new BadRequestException('Invitee must be a registered user');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const inv = await this.prisma.$transaction(async (tx) => {
      const createdInv = await tx.structureShareInvitation.create({
        data: {
          structure: { connect: { id: structureId } },
          inviter: { connect: { id: inviterUserId } },
          inviteeUsername,
          permission,
          message,
          expiresAt,
        },
      });

      let team = await tx.team.findFirst({
        where: {
          workspaceId: structure.workspaceId,
          ownerId: structure.ownerId,
        },
      });

      if (!team) {
        team = await tx.team.findFirst({
          where: { workspaceId: structure.workspaceId },
        });
      }

      if (!team) {
        const owner = await tx.user.findUnique({
          where: { id: structure.ownerId },
        });
        team = await tx.team.create({
          data: {
            name: `${owner?.displayName || owner?.username || 'Workspace'} Team`,
            ownerId: structure.ownerId,
            workspaceId: structure.workspaceId,
          },
        });
      }

      // Add existingUser to the team if not already present
      try {
        await tx.teamMember.createMany({
          data: [
            {
              teamId: team.id,
              userId: existingUser.id,
              workspaceId: structure.workspaceId,
              role: 'member',
            },
          ],
          skipDuplicates: true,
        });
      } catch (err) {
        // ignore duplicate errors
      }

      if (!existingUser.defaultWorkspaceId) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: { defaultWorkspaceId: structure.workspaceId },
        });
      }

      return createdInv;
    });

    await this.logAudit(
      'CREATE_INVITATION',
      'StructureShareInvitation',
      inv.id,
      {
        structureId,
        structureName: structure.name,
        inviteeUsername,
        permission,
        inviter: {
          id: inviter.id,
          username: inviter.username,
          displayName: inviter.displayName,
        },
        status: inv.status,
        invitedAt: inv.createdAt,
        expirationDate: inv.expiresAt || null,
        message: inv.message || null,
      },
      inviterUserId,
    );

    return inv;
  }

  async acceptInvitationById(
    invitationId: string,
    acceptingUserId: string,
    acceptingUsername?: string | null,
  ) {
    this.logger.debug('acceptInvitationById called', {
      invitationId,
      acceptingUserId,
      acceptingUsernameProvided: Boolean(acceptingUsername),
    });

    const invitation = await this.prisma.structureShareInvitation.findUnique({
      where: { id: invitationId },
      include: {
        structure: {
          select: { id: true, ownerId: true, workspaceId: true, name: true },
        },
        inviter: true,
      },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation not pending');
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      await this.prisma.structureShareInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invitation has expired');
    }

    if (!acceptingUsername) {
      const u = await this.prisma.user.findUnique({
        where: { id: acceptingUserId },
        select: { username: true },
      });
      acceptingUsername = u?.username || null;
    }

    if (invitation.inviteeUsername && acceptingUsername) {
      if (
        invitation.inviteeUsername.toLowerCase() !==
        acceptingUsername.toLowerCase()
      ) {
        throw new ForbiddenException(
          'This invitation was issued to a different username',
        );
      }
    }

    const structureId = invitation.structureId;
    const invitedPermission = invitation.permission;

    await this.prisma.$transaction(async (tx) => {
      const existingShare = await tx.structureShare.findUnique({
        where: { structureId_userId: { structureId, userId: acceptingUserId } },
      });

      if (existingShare) {
        await tx.structureShare.update({
          where: { id: existingShare.id },
          data: { permission: invitation.permission },
        });
      } else {
        await tx.structureShare.create({
          data: {
            structureId,
            userId: acceptingUserId,
            permission: invitation.permission,
          },
        });
      }

      let team = await tx.team.findFirst({
        where: {
          workspaceId: invitation.structure.workspaceId,
          ownerId: invitation.structure.ownerId,
        },
      });

      if (!team) {
        team = await tx.team.findFirst({
          where: { workspaceId: invitation.structure.workspaceId },
        });
      }

      if (!team) {
        const owner = await tx.user.findUnique({
          where: { id: invitation.structure.ownerId },
        });
        team = await tx.team.create({
          data: {
            name: `${owner?.displayName || owner?.username || 'Workspace'} Team`,
            ownerId: invitation.structure.ownerId,
            workspaceId: invitation.structure.workspaceId,
          },
        });
      }

      try {
        await tx.teamMember.createMany({
          data: [
            {
              teamId: team.id,
              userId: acceptingUserId,
              workspaceId: invitation.structure.workspaceId,
              role: 'member',
            },
          ],
          skipDuplicates: true,
        });
      } catch (err) {
        // ignore duplicate errors
      }

      const userRec = await tx.user.findUnique({
        where: { id: acceptingUserId },
      });
      if (userRec && !userRec.defaultWorkspaceId) {
        await tx.user.update({
          where: { id: acceptingUserId },
          data: { defaultWorkspaceId: invitation.structure.workspaceId },
        });
      }

      await tx.structureShareInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          usedAt: new Date(),
          inviteeId: acceptingUserId,
        },
      });
    });

    await this.logAudit(
      'ACCEPT_INVITATION',
      'StructureShareInvitation',
      invitation.id,
      {
        structureId: invitation.structureId,
        invitedAt: invitation.createdAt,
        structureName: invitation.structure.name,
        permission: invitation.permission,
        inviterId: invitation.inviterId,
        inviterUsername: invitation.inviter?.username || null,
        inviteeUsername: invitation.inviteeUsername,
      },
      acceptingUserId,
    );

    const owner = await this.prisma.user.findUnique({
      where: { id: invitation.structure.ownerId },
      select: { username: true },
    });

    return {
      success: true,
      structureId,
      permission: invitedPermission,
      ownerUsername: owner?.username || null,
    };
  }

  async getPendingInvitations(structureId: string, currentUserId: string) {
    await this.ensureIsOwner(structureId, currentUserId);

    return this.prisma.structureShareInvitation.findMany({
      where: { structureId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCollaborators(structureId: string, currentUserId: string) {
    await this.ensureHasMinimumPermission(structureId, currentUserId, [
      'owner',
      'editor',
    ]);

    return this.prisma.structureShareInvitation.findMany({
      where: { structureId },
      include: {
        inviter: {
          select: { id: true, username: true, displayName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async removeInvitation(invitationId: string, currentUserId: string) {
    const invitation = await this.prisma.structureShareInvitation.findUnique({
      where: { id: invitationId },
      include: { structure: true },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');

    if (
      invitation.inviterId !== currentUserId &&
      invitation.structure.ownerId !== currentUserId
    ) {
      throw new ForbiddenException(
        'You are not allowed to delete this invitation',
      );
    }

    await this.prisma.structureShareInvitation.delete({
      where: { id: invitationId },
    });

    await this.logAudit(
      'DELETE_INVITATION',
      'StructureShareInvitation',
      invitationId,
      {
        structureId: invitation.structureId,
        structureName: invitation.structure.name,
        inviteeUsername: invitation.inviteeUsername,
        permission: invitation.permission,
      },
      currentUserId,
    );

    return { message: 'Invitation deleted successfully' };
  }

  async listAccessibleStructures(currentUserId: string) {
    return this.prisma.structure.findMany({
      where: {
        OR: [
          { ownerId: currentUserId },
          { shares: { some: { userId: currentUserId } } },
          {
            shareInvitations: {
              some: {
                inviteeId: currentUserId,
                status: 'accepted',
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        shares: {
          where: { userId: currentUserId },
          select: { permission: true },
        },
        shareInvitations: {
          where: { inviteeId: currentUserId, status: 'accepted' },
          select: { permission: true },
        },
      },
    });
  }

  async getSharedStructures(currentUserId: string, currentUsername?: string) {
    this.logger.debug('getSharedStructures called', {
      currentUserId,
      currentUsernameProvided: Boolean(currentUsername),
    });

    if (!currentUsername) {
      const u = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { username: true },
      });
      currentUsername = u?.username || null;
      this.logger.debug('Fetched currentUsername for user', {
        currentUserId,
        currentUsername,
      });
    }

    const inviteeUsernameFilter = currentUsername
      ? [{ inviteeUsername: currentUsername }]
      : [];

    return this.prisma.structure.findMany({
      where: {
        AND: [
          { ownerId: { not: currentUserId } },
          {
            OR: [
              { shares: { some: { userId: currentUserId } } },
              {
                shareInvitations: {
                  some: {
                    OR: [
                      { inviteeId: currentUserId },
                      ...inviteeUsernameFilter,
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        title: true,
        imageUrl: true,
        description: true,
        updatedAt: true,
        ownerId: true,
        type: true,
        visibility: true,
        shares: {
          where: { userId: currentUserId },
          select: {
            permission: true,
            user: { select: { id: true, username: true } },
          },
        },
        shareInvitations: {
          where: {
            OR: [
              { inviteeId: currentUserId },
              ...(currentUsername
                ? [{ inviteeUsername: currentUsername }]
                : []),
            ],
          },
          select: {
            id: true,
            permission: true,
            status: true,
            token: true,
            inviteeUsername: true,
            inviter: {
              select: { id: true, username: true, displayName: true },
            },
            message: true,
            expiresAt: true,
            createdAt: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profileUrl: true,
          },
        },
      },
    });
  }

  async removeCollaboratorByUser(
    structureId: string,
    targetUserId: string,
    currentUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const structure = await tx.structure.findUnique({
        where: { id: structureId },
        select: {
          id: true,
          name: true,
          workspaceId: true,
        },
      });

      if (!structure) {
        throw new NotFoundException('Structure not found');
      }

      const deletedShares = await tx.structureShare.deleteMany({
        where: {
          structureId,
          userId: targetUserId,
        },
      });

      const deletedInvitations = await tx.structureShareInvitation.deleteMany({
        where: {
          structureId,
          inviteeId: targetUserId,
        },
      });

      const deletedTeamMembers = await tx.teamMember.deleteMany({
        where: {
          workspaceId: structure.workspaceId,
          userId: targetUserId,
        },
      });

      const targetUser = await tx.user.findUnique({
        where: { id: targetUserId },
        select: { username: true },
      });

      const inviteeUsername = targetUser?.username || 'Unknown User';

      await tx.auditLog.create({
        data: {
          action: 'REMOVE_COLLABORATOR',
          element: 'StructureShare',
          elementId: structureId,
          details: {
            structureName: structure.name,
            targetUserId,
            targetUsername: inviteeUsername,
            deletedShares: deletedShares.count,
            deletedInvitations: deletedInvitations.count,
            deletedTeamMembers: deletedTeamMembers.count,
          },
          userId: currentUserId,
        },
      });

      return {
        message: 'Collaborator removed successfully',
        deletedShares: deletedShares.count,
        deletedInvitations: deletedInvitations.count,
        deletedTeamMembers: deletedTeamMembers.count,
      };
    });
  }
}
