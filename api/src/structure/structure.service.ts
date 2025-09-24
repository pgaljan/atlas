import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStructureDto } from './dto';

@Injectable()
export class StructureService {
  constructor(private readonly prisma: PrismaService) {}

  private formatElements(elements: any[]): any[] {
    return elements.map((element) => {
      const childrenPayload = element.children
        ? this.formatElements(element.children)
        : undefined;

      return {
        id: element.id,
        name: element.name,
        recordId: element.recordId,
        parentId: element.parentId,
        orderIndex: element.orderIndex ?? 0,
        isExpanded:
          element.isExpanded !== undefined ? element.isExpanded : true,
        children: childrenPayload ? { create: childrenPayload } : undefined,
      };
    });
  }

  private async getUserPermissionOnStructure(
    structureId: string,
    userId: string | null,
  ) {
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
    if (share) return share.permission as any;

    const invitation = await this.prisma.structureShareInvitation.findFirst({
      where: { structureId, inviteeId: userId, status: 'accepted' },
      select: { permission: true },
    });
    if (invitation) return invitation.permission as any;

    return null;
  }

  async createStructure(createStructureDto: CreateStructureDto) {
    const {
      name,
      description,
      visibility,
      ownerId,
      elements,
      workspaceId,
      type = 'default',
    } = createStructureDto;

    try {
      // Check if a structure with the same name already exists
      const existingStructure = await this.prisma.structure.findFirst({
        where: {
          name,
          ownerId,
        },
      });

      if (existingStructure) {
        throw new InternalServerErrorException(
          `"${name}" already exists for this user.`,
        );
      }

      if (existingStructure) {
        throw new InternalServerErrorException(`"${name}" already exists.`);
      }

      // Fetch user subscription
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: ownerId },
      });

      if (!subscription) {
        throw new NotFoundException(
          `Subscription for user ${ownerId} not found`,
        );
      }

      let features = subscription.features as Record<string, any>;

      // Check and update the "Structures" feature count
      if (features['Structures'] !== 'Unlimited') {
        let structureLimit = parseInt(features['Structures'], 10);

        if (!isNaN(structureLimit) && structureLimit > 0) {
          features['Structures'] = (structureLimit - 1).toString();
        } else {
          throw new InternalServerErrorException(
            `Structure limit exceeded for user ${ownerId}`,
          );
        }

        // Update the subscription with the new feature count
        await this.prisma.subscription.update({
          where: { userId: ownerId },
          data: {
            features: features,
          },
        });
      }

      // Create the structure
      const structure = await this.prisma.structure.create({
        data: {
          name,
          title: name,
          description,
          visibility: visibility || Visibility.private,
          ownerId,
          type,
          workspaceId,
          elements: {
            create: elements ? this.formatElements(elements) : [],
          },
        },
      });

      // Log the creation in the AuditLog
      await this.prisma.auditLog.create({
        data: {
          action: 'CREATE',
          element: 'Structure',
          elementId: structure.id.toString(),
          details: {
            name,
            description,
            visibility,
            elements: elements?.map((element) => ({
              type: element.name,
            })),
          },
          userId: ownerId,
        },
      });

      return structure;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create structure: ${error.message}`,
      );
    }
  }

  async getStructure(id: string, userId?: string | null) {
    const structure = await this.prisma.structure.findUnique({
      where: { id },
      include: {
        elements: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          include: {
            sourceLinks: true,
            targetLinks: true,
            Record: true,
          },
        },
      },
    });

    if (!structure) {
      throw new NotFoundException(`Structure with id ${id} not found`);
    }

    const perm = await this.getUserPermissionOnStructure(id, userId);
    if (perm === null) {
      throw new ForbiddenException('You do not have access to this structure');
    }

    const buildHierarchy = (elements: any[], parentId: string | null = null) =>
      elements
        .filter((element) => element.parentId === parentId)
        .map((element) => ({
          ...element,
          children: buildHierarchy(elements, element.id),
        }));

    const nestedElements = buildHierarchy(structure.elements);
    return { ...structure, elements: nestedElements };
  }

  async getAccessibleStructuresForUser(currentUserId: string) {
    return this.prisma.structure.findMany({
      where: {
        OR: [
          { ownerId: currentUserId },
          { shares: { some: { userId: currentUserId } } },
          {
            shareInvitations: {
              some: { inviteeId: currentUserId, status: 'accepted' },
            },
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
          select: { permission: true },
        },
        shareInvitations: {
          where: { inviteeId: currentUserId, status: 'accepted' },
        },
        owner: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateStructure(
    id: string,
    updateData: Partial<CreateStructureDto>,
    userId?: string,
  ) {
    const structure = await this.prisma.structure.findUnique({ where: { id } });
    if (!structure)
      throw new NotFoundException(`Structure with id ${id} not found`);

    const perm = await this.getUserPermissionOnStructure(id, userId);
    if (!perm) {
      throw new ForbiddenException(
        'You no longer have access to this structure',
      );
    }

    try {
      const {
        name,
        title,
        description,
        visibility,
        imageUrl,
        elements,
        maps,
        type,
        markmapShowWbs,
      } = updateData;

      const elementsToProcess = elements || [];

      const updatedStructure = await this.prisma.structure.update({
        where: { id },
        data: {
          name: name || undefined,
          markmapShowWbs,
          title: title || undefined,
          description: description || undefined,
          visibility: visibility || undefined,
          imageUrl: imageUrl || undefined,
          updatedAt: new Date(),
          type: type || undefined,
          elements: elements
            ? {
                deleteMany: {},
                create: elements,
              }
            : undefined,
          StructureMap: maps
            ? {
                deleteMany: {},
                create: maps,
              }
            : undefined,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          element: 'Structure',
          elementId: updatedStructure.id.toString(),
          details: {
            name,
            description,
            visibility,
            imageUrl,
            elements: elementsToProcess.map((element) => ({
              type: element.name,
            })),
          },
          userId: userId || structure.ownerId,
        },
      });

      return updatedStructure;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update structure: ${error.message}`,
      );
    }
  }
  async deleteStructure(id: string, userId?: string) {
    const structure = await this.prisma.structure.findUnique({
      where: { id },
      include: { elements: true },
    });

    if (!structure) {
      throw new NotFoundException(`Structure with id ${id} not found`);
    }

    if (userId && structure.ownerId === userId) {
      const elementIds = structure.elements.map((element) => element.id);

      await this.prisma.record.deleteMany({
        where: { id: { in: elementIds } },
      });
      await this.prisma.element.deleteMany({ where: { structureId: id } });

      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: structure.ownerId },
      });

      if (subscription) {
        let features = subscription.features as Record<string, any>;
        if (features['Structures'] !== 'Unlimited') {
          let structureLimit = parseInt(features['Structures'], 10);
          if (!isNaN(structureLimit)) {
            features['Structures'] = (structureLimit + 1).toString();
            await this.prisma.subscription.update({
              where: { userId: structure.ownerId },
              data: { features: features },
            });
          }
        }

        await this.prisma.auditLog.create({
          data: {
            action: 'DELETE',
            element: 'Structure',
            elementId: structure.id.toString(),
            details: {
              name: structure.name,
              description: structure.description,
            },
            userId: structure.ownerId,
          },
        });

        return this.prisma.structure.delete({ where: { id } });
      }

      await this.prisma.auditLog.create({
        data: {
          action: 'DELETE',
          element: 'Structure',
          elementId: structure.id.toString(),
          details: { name: structure.name, description: structure.description },
          userId: structure.ownerId,
        },
      });

      return this.prisma.structure.delete({ where: { id } });
    }

    const deletedShares = await this.prisma.structureShare.deleteMany({
      where: {
        structureId: id,
        userId,
      },
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    const inviteeUsername = targetUser?.username ?? null;

    const deletedInvitations =
      await this.prisma.structureShareInvitation.deleteMany({
        where: {
          structureId: id,
          OR: [
            { inviteeId: userId },
            ...(inviteeUsername ? [{ inviteeUsername }] : []),
          ],
        },
      });

    const deletedTeamMembers = await this.prisma.teamMember.deleteMany({
      where: { workspaceId: structure.workspaceId, userId },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'REMOVE_SHARED_ACCESS_FOR_USER',
        element: 'Structure',
        elementId: id,
        details: {
          removedShares: deletedShares.count,
          removedInvitations: deletedInvitations.count,
          removedTeamMembers: deletedTeamMembers.count,
          targetUserId: userId,
        },
        userId,
      },
    });

    return {
      message:
        'Removed your access to this shared structure. The structure still exists for the owner.',
      removedShares: deletedShares.count,
      removedInvitations: deletedInvitations.count,
      removedTeamMembers: deletedTeamMembers.count,
    };
  }

  async createBatchStructures(structures: CreateStructureDto[]) {
    try {
      const createdStructures = await Promise.all(
        structures.map((structure) => this.createStructure(structure)),
      );

      for (const createdStructure of createdStructures) {
        await this.prisma.auditLog.create({
          data: {
            action: 'CREATE',
            element: 'Structure',
            elementId: createdStructure.id.toString(),
            details: {
              name: createdStructure.name,
              description: createdStructure.description,
            },
            userId: createdStructure.ownerId,
          },
        });
      }

      return createdStructures;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to batch create structures: ${error.message}`,
      );
    }
  }

  async updateBatchStructures(structures: Partial<CreateStructureDto>[]) {
    try {
      return Promise.all(
        structures.map((structure) =>
          this.updateStructure(structure.id, structure),
        ),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to batch update structures: ${error.message}`,
      );
    }
  }

  async deleteBatchStructures(ids: string[]) {
    try {
      return Promise.all(ids.map((id) => this.deleteStructure(id)));
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to batch delete structures: ${error.message}`,
      );
    }
  }

  async updateIsExpandedOnly(id: string, isExpanded: boolean, userId?: string) {
    const structure = await this.prisma.structure.findUnique({
      where: { id },
    });

    if (!structure) {
      throw new NotFoundException(`Structure with id ${id} not found`);
    }

    const perm = await this.getUserPermissionOnStructure(id, userId);
    if (!perm) {
      throw new ForbiddenException(
        'You no longer have access to this structure',
      );
    }

    try {
      const updatedStructure = await this.prisma.structure.update({
        where: { id },
        data: {
          isExpanded,
          updatedAt: new Date(),
        },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          element: 'Structure',
          elementId: updatedStructure.id.toString(),
          details: {
            previousData: { isExpanded: structure.isExpanded },
            updatedData: { isExpanded },
          },
          userId,
        },
      });

      return updatedStructure;
    } catch (error) {
      throw new InternalServerErrorException('Error updating expand state');
    }
  }

  async updateWbsStart(structureId: string, wbsStart: number, userId?: string) {
    const structure = await this.prisma.structure.findUnique({
      where: { id: structureId },
    });

    if (!structure) {
      throw new NotFoundException(`Structure with id ${structureId} not found`);
    }

    const perm = await this.getUserPermissionOnStructure(structureId, userId);
    if (!perm || !['owner', 'editor'].includes(perm)) {
      throw new ForbiddenException(
        'Insufficient permission to update WBS Start',
      );
    }

    try {
      const updatedStructure = await this.prisma.structure.update({
        where: { id: structureId },
        data: {
          wbsStart,
          updatedAt: new Date(),
        },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          element: 'Structure',
          elementId: structureId,
          details: {
            previousData: { wbsStart: structure.wbsStart },
            updatedData: { wbsStart },
          },
          userId: userId || structure.ownerId,
        },
      });

      return updatedStructure;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update WBS Start: ${error.message}`,
      );
    }
  }

  async getStructureSummariesByWorkspace(workspaceId: string) {
    const summaries = await this.prisma.structure.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        type: true,
        imageUrl: true,
      },
    });
    return summaries;
  }
}
