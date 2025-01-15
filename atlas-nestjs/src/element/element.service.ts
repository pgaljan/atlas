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

  async createElement(createElementDto: CreateElementDto, userId?: number) {
    const { structureId, name, recordId } = createElementDto;

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
      const createdElement = await this.prisma.element.create({
        data: {
          structureId,
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
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
        const createdElement = await this.prisma.element.create({
          data: {
            structureId,
            parentId,
            name,
            recordId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

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

    const updatedElements = [];

    for (const request of reparentingRequests) {
      const { sourceElementId, targetElementId, attributes } = request;

      const sourceElement = await this.prisma.element.findUnique({
        where: { id: sourceElementId },
      });
      const targetElement = await this.prisma.element.findUnique({
        where: { id: targetElementId },
      });

      if (!sourceElement || !targetElement) {
        throw new NotFoundException(`One or both elements not found`);
      }

      if (!attributes) {
        throw new BadRequestException('Missing attributes for the link');
      }

      const updatedElement = await this.prisma.element.update({
        where: { id: targetElementId },
        data: {
          parentId: sourceElementId,
        },
      });

      await this.logAudit(
        'REPARENT',
        'Element',
        updatedElement.id.toString(),
        { sourceElementId, targetElementId, attributes },
        userId,
      );

      updatedElements.push(updatedElement);
    }

    return {
      message: `${updatedElements.length} elements reparented successfully`,
      updatedElements,
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

      await this.logAudit(
        'DELETE',
        'Element',
        deletedElement.id.toString(),
        {
          deletedAt: deletedElement.deletedAt,
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
