import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElementDto } from './dto/create-element.dto';
import { ReparentElementsDto } from './dto/reparent-elements.dto';
import { UpdateElementDto } from './dto/update-element.dto';

@Injectable()
export class ElementService {
  constructor(private readonly prisma: PrismaService) {}

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
        details: details,
        userId: userId || null,
      },
    });
  }

  private async deleteChildrenRecursive(parentId: string, userId?: string) {
    const children = await this.prisma.element.findMany({
      where: { parentId },
    });

    for (const child of children) {
      // Recursively delete this child’s children first
      await this.deleteChildrenRecursive(child.id, userId);

      // Then delete this child
      await this.prisma.element.delete({
        where: { id: child.id },
      });

      await this.logAudit(
        'DELETE',
        'Element',
        child.id,
        {
          deletedAt: new Date(),
          reason: `Cascade delete due to parent ${parentId}`,
        },
        userId,
      );
    }
  }

  // Helper to find the next “orderIndex” for a given structure + parent
  private async getNextOrderIndex(
    structureId: string,
    parentId: string | null,
  ): Promise<number> {
    const maxElement = await this.prisma.element.findFirst({
      where: {
        structureId,
        parentId,
      },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    return maxElement ? maxElement.orderIndex + 1 : 0;
  }

  /**
   * Create a single (or top‐level) Element.
   */
  async createElement(createElementDto: CreateElementDto, userId?: string) {
    const {
      structureId,
      name,
      recordId,
      parentId,
      isExpanded,
      type,
      eventType,
      gateType,
      eventValue,
      eventValueType,
    } = createElementDto;

    if (!structureId || !name) {
      throw new BadRequestException('Missing required fields');
    }

    // 1) Ensure the Structure exists
    const structureExists = await this.prisma.structure.findUnique({
      where: { id: structureId },
    });
    if (!structureExists) {
      throw new BadRequestException('Invalid structureId: Structure not found');
    }

    try {
      // 2) Determine “orderIndex” under this parent (or top‐level if no parent)
      const nextOrderIndex = await this.getNextOrderIndex(
        structureId,
        parentId || null,
      );

      // 3) Create the Element, including isExpanded
      const createdElement = await this.prisma.element.create({
        data: {
          structureId,
          parentId: parentId || null,
          name,
          recordId: recordId || null,
          orderIndex: nextOrderIndex,
          isExpanded: isExpanded ?? true,
          type: type || null,
          eventType: eventType || null,
          gateType: gateType || null,
          eventValue: eventValue || null,
          eventValueType: eventValueType || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 4) Update the parent Structure’s updatedAt
      await this.prisma.structure.update({
        where: { id: structureId },
        data: { updatedAt: new Date() },
      });

      // 5) Audit log
      await this.logAudit(
        'CREATE',
        'Element',
        createdElement.id,
        {
          structureId,
          recordId,
          parentId,
          isExpanded: isExpanded ?? true,
        },
        userId,
      );

      return createdElement;
    } catch (error) {
      throw new BadRequestException('Error creating element');
    }
  }

  /**
   * Recursively create nested children under a given parentId.
   * Each CreateElementDto may itself carry `children: CreateElementDto[]`.
   */
  async createNestedElements(
    parentId: string,
    nestedElements: CreateElementDto[],
    userId?: string,
  ) {
    for (const elementDto of nestedElements) {
      const {
        structureId,
        name,
        recordId,
        isExpanded,
        children,
        type,
        eventType,
        gateType,
        eventValue,
        eventValueType,
      } = elementDto;

      if (!structureId || !name) {
        throw new BadRequestException(
          'Missing required fields in nested element',
        );
      }

      try {
        // 1) Find next orderIndex under that parent
        const nextOrderIndex = await this.getNextOrderIndex(
          structureId,
          parentId,
        );

        // 2) Create the child element, persisting isExpanded
        const createdElement = await this.prisma.element.create({
          data: {
            structureId,
            parentId,
            name,
            recordId: recordId || null,
            orderIndex: nextOrderIndex,
            isExpanded: isExpanded ?? true,
            type: type || null,
            eventType: eventType || null,
            gateType: gateType || null,
            eventValue: eventValue || null,
            eventValueType: eventValueType || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // 3) Update the Structure’s updatedAt
        await this.prisma.structure.update({
          where: { id: structureId },
          data: { updatedAt: new Date() },
        });

        // 4) Audit log for this specific nested child
        await this.logAudit(
          'CREATE',
          'Element',
          createdElement.id,
          {
            structureId,
            parentId,
            recordId,
            isExpanded: isExpanded ?? true,
          },
          userId,
        );

        // 5) If this nested element itself has children, recurse
        if (Array.isArray(children) && children.length > 0) {
          await this.createNestedElements(createdElement.id, children, userId);
        }
      } catch (error) {
        throw new BadRequestException('Error creating nested elements');
      }
    }

    return { message: 'Nested elements created successfully' };
  }

  /**
   * Return all Elements (flat list).  You can filter / nest on the client side.
   */
  async getAllElements() {
    return this.prisma.element.findMany();
  }

  /**
   * Fetch a single Element.
   */
  async getElement(id: string) {
    const element = await this.prisma.element.findUnique({ where: { id } });
    if (!element) {
      throw new NotFoundException(`Element with id ${id} not found`);
    }
    return element;
  }

  /**
   * Update name, recordId, parentId, and/or isExpanded on an existing node.
   */
  async updateElement(
    id: string,
    updateElementDto: UpdateElementDto,
    userId?: string,
  ) {
    const element = await this.getElement(id);

    const {
      name,
      recordId,
      parentId,
      isExpanded,
      type,
      eventType,
      gateType,
      eventValue,
      eventValueType,
    } = updateElementDto;

    if (
      name === undefined &&
      recordId === undefined &&
      parentId === undefined &&
      isExpanded === undefined &&
      type === undefined &&
      eventType === undefined &&
      gateType === undefined &&
      eventValue === undefined &&
      eventValueType === undefined
    ) {
      throw new BadRequestException('No updatable field provided');
    }

    try {
      const updatedElement = await this.prisma.element.update({
        where: { id },
        data: {
          name,
          recordId,
          parentId,
          isExpanded,
          type,
          eventType,
          gateType,
          eventValue,
          eventValueType,
          updatedAt: new Date(),
        },
      });

      await this.prisma.structure.update({
        where: { id: updatedElement.structureId },
        data: { updatedAt: new Date() },
      });

      await this.logAudit(
        'UPDATE',
        'Element',
        updatedElement.id,
        {
          previousData: element,
          updatedData: updateElementDto,
        },
        userId,
      );

      return updatedElement;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error updating element');
    }
  }

  /**
   * Change parent-child relationships for one or more elements in a batch.
   */
  async reparentElements(
    reparentElementsDto: ReparentElementsDto,
    userId?: string,
  ) {
    const { reparentingRequests } = reparentElementsDto;

    if (
      !Array.isArray(reparentingRequests) ||
      reparentingRequests.length === 0
    ) {
      throw new BadRequestException('Invalid reparenting requests');
    }

    const affectedStructures = new Set<string>();

    for (const request of reparentingRequests) {
      const { sourceElementId, targetElementId, attributes } = request;

      let sourceElement = null;
      if (sourceElementId) {
        sourceElement = await this.prisma.element.findUnique({
          where: { id: sourceElementId },
        });
        if (!sourceElement) {
          throw new NotFoundException(
            `Source element not found for id ${sourceElementId}`,
          );
        }
      }

      const targetElement = await this.prisma.element.findUnique({
        where: { id: targetElementId },
      });
      if (!targetElement) {
        throw new NotFoundException(
          `Target element not found for id ${targetElementId}`,
        );
      }

      if (!attributes) {
        throw new BadRequestException('Missing attributes for the link');
      }

      // Perform the “reparent” by updating `parentId`
      const updatedElement = await this.prisma.element.update({
        where: { id: targetElementId },
        data: {
          parentId: sourceElementId || null,
          updatedAt: new Date(),
        },
      });

      // Add affected structure to the set
      affectedStructures.add(updatedElement.structureId);

      // Audit log for reparenting
      await this.logAudit(
        'REPARENT',
        'Element',
        updatedElement.id,
        {
          sourceElementId: sourceElementId || null,
          targetElementId,
          attributes,
        },
        userId,
      );
    }

    // Refresh `updatedAt` on each structure that changed
    for (const structureId of affectedStructures) {
      await this.prisma.structure.update({
        where: { id: structureId },
        data: { updatedAt: new Date() },
      });
    }

    return {
      message: `${reparentingRequests.length} elements reparented successfully`,
    };
  }

  /**
   * Delete an element by its ID.  (This permanently removes it from the DB.)
   */
  async deleteElement(id: string, userId?: string) {
    const element = await this.getElement(id);

    try {
      // 1. Recursively delete all children
      await this.deleteChildrenRecursive(id, userId);

      // 2. Delete the parent element itself
      const deletedElement = await this.prisma.element.delete({
        where: { id },
      });

      // 3. Update structure timestamp
      await this.prisma.structure.update({
        where: { id: deletedElement.structureId },
        data: { updatedAt: new Date() },
      });

      // 4. Audit log
      await this.logAudit(
        'DELETE',
        'Element',
        deletedElement.id,
        {
          deletedAt: new Date(),
          reason: 'Element and its children were deleted',
        },
        userId,
      );

      return deletedElement;
    } catch (error) {
      throw new BadRequestException('Error deleting element and its children');
    }
  }

  async updateIsExpandedOnly(id: string, isExpanded: boolean, userId?: string) {
    const element = await this.getElement(id);

    try {
      const updatedElement = await this.prisma.element.update({
        where: { id },
        data: {
          isExpanded,
          updatedAt: new Date(),
        },
      });

      await this.prisma.structure.update({
        where: { id: updatedElement.structureId },
        data: { updatedAt: new Date() },
      });

      await this.logAudit(
        'UPDATE',
        'Element',
        updatedElement.id,
        {
          previousData: element,
          updatedData: { isExpanded },
        },
        userId,
      );

      return updatedElement;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error updating expand state');
    }
  }

  async updateOrderIndex(id: string, orderIndex: number, userId?: string) {
    const element = await this.getElement(id);

    try {
      const updated = await this.prisma.element.update({
        where: { id },
        data: {
          orderIndex,
          updatedAt: new Date(),
        },
      });

      await this.prisma.structure.update({
        where: { id: updated.structureId },
        data: { updatedAt: new Date() },
      });

      await this.logAudit(
        'UPDATE',
        'Element',
        updated.id,
        {
          previousOrderIndex: element.orderIndex,
          newOrderIndex: orderIndex,
        },
        userId,
      );

      return updated;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error updating order index');
    }
  }
}
