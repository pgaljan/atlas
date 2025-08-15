import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../utils/mailer.util';
import { CreateShareLinkDto } from './dto/create-share-link-structure.dto';
import { CreateShareDto } from './dto/create-share-structure.dto';
import { InviteShareDto } from './dto/invite-share-structure.dto';
import { UpdateShareDto } from './dto/update-share-structure.dto';

@Injectable()
export class StructureSharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  // Helper to assert current user is owner of structure
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
        user: { select: { id: true, email: true, displayName: true } },
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
      select: { ownerId: true },
    });
    if (structure.ownerId === userId) {
      throw new BadRequestException('User is already the owner');
    }

    const existing = await this.prisma.structureShare.findUnique({
      where: { structureId_userId: { structureId, userId } },
    });

    if (existing) {
      return this.prisma.structureShare.update({
        where: { id: existing.id },
        data: { permission },
      });
    }

    return this.prisma.structureShare.create({
      data: { structureId, userId, permission },
      include: { user: true },
    });
  }

  async removeShare(shareId: string, currentUserId: string) {
    const share = await this.prisma.structureShare.findUnique({
      where: { id: shareId },
    });
    if (!share) throw new NotFoundException('Share not found');

    await this.ensureIsOwner(share.structureId, currentUserId);

    return this.prisma.structureShare.delete({ where: { id: shareId } });
  }

  async updateShare(
    shareId: string,
    dto: UpdateShareDto,
    currentUserId: string,
  ) {
    const share = await this.prisma.structureShareInvitation.findUnique({
      where: { id: shareId },
    });
    if (!share) throw new NotFoundException('Share not found');

    await this.ensureIsOwner(share.structureId, currentUserId);

    if (String(dto.permission) === 'owner') {
      throw new BadRequestException(
        'Use transferOwnership to change structure owner',
      );
    }

    return this.prisma.structureShareInvitation.update({
      where: { id: shareId },
      data: { permission: dto.permission },
    });
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

    return this.prisma.$transaction(async (tx) => {
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
  }

  async createInvitation(dto: InviteShareDto, inviterUserId: string) {
    const { structureId, inviteeEmail, permission, message } = dto;

    // Ensure inviter is owner (throws if not)
    const structure = await this.ensureIsOwner(structureId, inviterUserId);

    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterUserId },
    });
    if (!inviter) throw new NotFoundException('Inviter not found');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Start transaction: create invitation, ensure team, optionally add existing user as team member
    const inv = await this.prisma.$transaction(async (tx) => {
      const createdInv = await tx.structureShareInvitation.create({
        data: {
          structureId,
          inviterId: inviterUserId,
          inviteeEmail,
          permission,
          message,
          expiresAt,
        },
      });

      // Ensure there's a team owned by the structure owner in this workspace
      let team = await tx.team.findFirst({
        where: {
          workspaceId: structure.workspaceId,
          ownerId: structure.ownerId,
        },
      });

      if (!team) {
        // fallback: any team in workspace
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
            name: `${owner?.displayName || owner?.email || 'Workspace'} Team`,
            ownerId: structure.ownerId,
            workspaceId: structure.workspaceId,
          },
        });
      }

      // If the invitee already exists as a user (inviting an existing user), add them to the team now.
      if (inviteeEmail) {
        const existingUser = await tx.user.findUnique({
          where: { email: inviteeEmail },
        });

        if (existingUser) {
          // create team member if not already present (unique constraint prevents duplicates)
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
            // ignore duplicate or other errors here (teamMember unique constraint will throw if already present)
            // optionally you can log: console.log('teamMember create skipped:', err);
          }

          // If user has no default workspace, set it
          if (!existingUser.defaultWorkspaceId) {
            await tx.user.update({
              where: { id: existingUser.id },
              data: { defaultWorkspaceId: structure.workspaceId },
            });
          }
        }
      }

      return createdInv;
    });

    // send email (non-blocking for DB integrity; failure doesn't roll back DB)
    try {
      await this.mailerService.sendStructureShareInvitation(
        inviteeEmail,
        structure.name || 'Unnamed Structure',
        inviter.displayName || inviter.email,
        inv.token,
        permission,
        message,
      );
    } catch (emailError) {}

    return inv;
  }

  async acceptInvitation(token: string, acceptingUserEmail: string) {
    const invitation = await this.prisma.structureShareInvitation.findUnique({
      where: { token },
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

    // Find user by email instead of id
    const acceptingUser = await this.prisma.user.findUnique({
      where: { email: acceptingUserEmail },
    });
    if (!acceptingUser) throw new NotFoundException('Accepting user not found');

    // Validate invitee email matches user email (case insensitive)
    if (
      invitation.inviteeEmail &&
      invitation.inviteeEmail.toLowerCase() !==
        acceptingUser.email.toLowerCase()
    ) {
      throw new ForbiddenException(
        'This invitation was issued to a different email',
      );
    }

    const structureId = invitation.structureId;

    return this.prisma.$transaction(async (tx) => {
      // create or update StructureShare
      const existingShare = await tx.structureShare.findUnique({
        where: {
          structureId_userId: { structureId, userId: acceptingUser.id },
        },
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
            userId: acceptingUser.id,
            permission: invitation.permission,
          },
        });
      }

      // Find or create team as before
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
            name: `${owner?.displayName || owner?.email || 'Workspace'} Team`,
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
              userId: acceptingUser.id,
              workspaceId: invitation.structure.workspaceId,
              role: 'member',
            },
          ],
          skipDuplicates: true, // quietly ignore duplicates (no P2002)
        });
      } catch (err) {}

      if (!acceptingUser.defaultWorkspaceId) {
        await tx.user.update({
          where: { id: acceptingUser.id },
          data: { defaultWorkspaceId: invitation.structure.workspaceId },
        });
      }

      // Update invitation status & link invitee
      await tx.structureShareInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          usedAt: new Date(),
          inviteeId: acceptingUser.id,
        },
      });

      return { success: true };
    });
  }

  async createShareLink(dto: CreateShareLinkDto, currentUserId: string) {
    const { structureId, permission, expiresAt } = dto;
    await this.ensureIsOwner(structureId, currentUserId);

    const token = uuidv4();

    const payload: any = {
      structureId,
      permission,
      token,
      isActive: true,
    };
    if (expiresAt) payload.expiresAt = new Date(expiresAt);

    return this.prisma.structureShareLink.create({ data: payload });
  }

  async validateShareLink(token: string) {
    const link = await this.prisma.structureShareLink.findUnique({
      where: { token },
    });
    if (!link || !link.isActive)
      throw new BadRequestException('Invalid or revoked link');
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      await this.prisma.structureShareLink.update({
        where: { id: link.id },
        data: { isActive: false },
      });
      throw new BadRequestException('Link expired');
    }
    return link;
  }

  async revokeShareLink(id: string, currentUserId: string) {
    const link = await this.prisma.structureShareLink.findUnique({
      where: { id },
    });
    if (!link) throw new NotFoundException('Link not found');
    await this.ensureIsOwner(link.structureId, currentUserId);
    return this.prisma.structureShareLink.update({
      where: { id },
      data: { isActive: false },
    });
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
          select: { id: true, email: true, displayName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getShareableLinks(structureId: string, currentUserId: string) {
    await this.ensureIsOwner(structureId, currentUserId);

    return this.prisma.structureShareLink.findMany({
      where: { structureId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async removeInvitation(invitationId: string, currentUserId: string) {
    const invitation = await this.prisma.structureShareInvitation.findUnique({
      where: { id: invitationId },
      include: { structure: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.inviterId !== currentUserId) {
      throw new ForbiddenException(
        'You are not allowed to delete this invitation',
      );
    }

    await this.prisma.structureShareInvitation.delete({
      where: { id: invitationId },
    });

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
}
