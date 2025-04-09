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

  // Helper method to get the next order index for the given structure and parent
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

  async createElement(createElementDto: CreateElementDto, userId?: number) {
    const { structureId, name, recordId, parentId } = createElementDto;

    if (!structureId || !name) {
      throw new BadRequestException('Missing required fields');
    }

    const structureExists = await this.prisma.structure.findUnique({
      where: { id: structureId },
    });

    if (!structureExists) {
      throw new BadRequestException('Invalid structureId: Structure not found');
    }

    try {
      // Determine next order index for the current parent (or top-level if no parent)
      const nextOrderIndex = await this.getNextOrderIndex(
        structureId,
        parentId ? parentId : null,
      );

      const createdElement = await this.prisma.element.create({
        data: {
          structureId,
          parentId: parentId || null,
          name,
          recordId,
          orderIndex: nextOrderIndex,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update structure updatedAt field.
      await this.prisma.structure.update({
        where: { id: structureId },
        data: { updatedAt: new Date() },
      });

      await this.logAudit(
        'CREATE',
        'Element',
        createdElement.id.toString(),
        { structureId, recordId },
        userId?.toString(),
      );

      return createdElement;
    } catch (error) {
      throw new BadRequestException('Error creating element');
    }
  }

  async createNestedElements(
    parentId: string,
    nestedElements: CreateElementDto[],
  ) {
    for (const elementDto of nestedElements) {
      const { structureId, name, recordId } = elementDto;

      if (!structureId || !name) {
        throw new BadRequestException(
          'Missing required fields in nested element',
        );
      }

      try {
        const nextOrderIndex = await this.getNextOrderIndex(
          structureId,
          parentId,
        );

        const createdElement = await this.prisma.element.create({
          data: {
            structureId,
            parentId,
            name,
            recordId,
            orderIndex: nextOrderIndex,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        await this.prisma.structure.update({
          where: { id: structureId },
          data: { updatedAt: new Date() },
        });

        // If the current nested element has its own children, recursively create them.
        if (
          Array.isArray(elementDto.children) &&
          elementDto.children.length > 0
        ) {
          await this.createNestedElements(
            createdElement.id.toString(),
            elementDto.children,
          );
        }
      } catch (error) {
        throw new BadRequestException('Error creating nested elements');
      }
    }

    return { message: 'Nested elements created successfully' };
  }

  async getAllElements() {
    return this.prisma.element.findMany();
  }

  async getElement(id: string) {
    const element = await this.prisma.element.findUnique({ where: { id } });
    if (!element) {
      throw new NotFoundException(`Element with id ${id} not found`);
    }
    return element;
  }

  async updateElement(
    id: string,
    updateElementDto: UpdateElementDto,
    userId?: string,
  ) {
    const element = await this.getElement(id);

    if (!updateElementDto.name) {
      throw new BadRequestException('Missing required fields for update');
    }

    const updatedElement = await this.prisma.element.update({
      where: { id },
      data: {
        ...updateElementDto,
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
      updatedElement.id.toString(),
      {
        previousData: element,
        updatedData: updateElementDto,
      },
      userId,
    );

    return updatedElement;
  }

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

    const updatedElements = new Set<string>();

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

      const updatedElement = await this.prisma.element.update({
        where: { id: targetElementId },
        data: {
          parentId: sourceElementId || null,
        },
      });

      if (sourceElement) {
        updatedElements.add(sourceElement.structureId);
      } else {
        updatedElements.add(targetElement.structureId);
      }

      await this.logAudit(
        'REPARENT',
        'Element',
        updatedElement.id.toString(),
        {
          sourceElementId: sourceElementId || null,
          targetElementId,
          attributes,
        },
        userId,
      );
    }

    // Update updatedAt for each affected structure.
    for (const structureId of updatedElements) {
      await this.prisma.structure.update({
        where: { id: structureId },
        data: { updatedAt: new Date() },
      });
    }

    return {
      message: `${reparentingRequests.length} elements reparented successfully`,
    };
  }

  async deleteElement(id: string, userId?: string) {
    const element = await this.getElement(id);

    if (element.deletedAt) {
      throw new BadRequestException('Element is already deleted');
    }

    try {
      const deletedElement = await this.prisma.element.delete({
        where: { id },
      });

      await this.prisma.structure.update({
        where: { id: deletedElement.structureId },
        data: { updatedAt: new Date() },
      });

      await this.logAudit(
        'DELETE',
        'Element',
        deletedElement.id.toString(),
        {
          deletedAt: new Date(),
          reason: 'Deletion initiated by user',
        },
        userId?.toString(),
      );

      return deletedElement;
    } catch (error) {
      throw new BadRequestException('Error deleting element');
    }
  }
}
