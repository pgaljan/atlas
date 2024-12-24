import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateMarkmapHeader } from '../utils/markmap-utils';
import { CreateElementDto } from './dto/create-element.dto';
import { ReparentElementsDto } from './dto/reparent-elements.dto';
import { UpdateElementDto } from './dto/update-element.dto';

@Injectable()
export class ElementService {
  constructor(private readonly prisma: PrismaService) {}

  private async logAudit(
    action: string,
    element: string,
    elementId: number | string,
    details: object,
    userId?: number,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        element,
        elementId: elementId.toString(),
        details: details,
        userId: userId || null,
      },
    });
  }

  async createElement(createElementDto: CreateElementDto, userId?: number) {
    const { structureId, type, recordId, wbsLevel, wbsNumber } =
      createElementDto;

    // Validate if required fields are provided
    if (!structureId || !type || !wbsLevel || !wbsNumber) {
      throw new BadRequestException('Missing required fields');
    }

    const markmapMM = generateMarkmapHeader(wbsLevel);

    try {
      const createdElement = await this.prisma.element.create({
        data: {
          structureId,
          type,
          recordId,
          wbsLevel,
          wbsNumber,
          markmapMM,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Log the creation in the audit log
      await this.logAudit(
        'CREATE',
        'Element',
        createdElement.id,
        {
          structureId,
          type,
          recordId,
          wbsLevel,
          wbsNumber,
        },
        userId,
      );

      return createdElement;
    } catch (error) {
      throw new BadRequestException('Error creating element');
    }
  }

  async createNestedElements(
    parentId: number,
    nestedElements: CreateElementDto[],
  ) {
    for (const elementDto of nestedElements) {
      const { structureId, type, recordId, wbsLevel, wbsNumber } = elementDto;

      if (!structureId || !type || !wbsLevel || !wbsNumber) {
        throw new BadRequestException(
          'Missing required fields in nested element',
        );
      }

      const markmapMM = generateMarkmapHeader(wbsLevel);

      try {
        const createdElement = await this.prisma.element.create({
          data: {
            structureId,
            parentId,
            type,
            recordId,
            wbsLevel,
            wbsNumber,
            markmapMM,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        if (
          Array.isArray(elementDto.children) &&
          elementDto.children.length > 0
        ) {
          await this.createNestedElements(
            createdElement.id,
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

  async getElement(id: number) {
    const element = await this.prisma.element.findUnique({ where: { id } });
    if (!element) {
      throw new NotFoundException(`Element with id ${id} not found`);
    }
    return element;
  }

  async updateElement(
    id: number,
    updateElementDto: UpdateElementDto,
    userId?: number,
  ) {
    const element = await this.getElement(id);

    if (!updateElementDto.wbsNumber || !updateElementDto.wbsLevel) {
      throw new BadRequestException('Missing required fields for update');
    }

    // Perform the update
    const updatedElement = await this.prisma.element.update({
      where: { id },
      data: {
        ...updateElementDto,
        updatedAt: new Date(),
      },
    });

    // Log the update action in the audit log
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
  }

  async reparentElements(
    ReparentElementsDto: ReparentElementsDto,
    userId?: number,
  ) {
    const { reparentingRequests } = ReparentElementsDto;

    // Ensure that reparentingRequests is an array
    if (
      !Array.isArray(reparentingRequests) ||
      reparentingRequests.length === 0
    ) {
      throw new BadRequestException('Invalid reparenting requests');
    }

    const updatedElements = [];

    // Loop through each reparenting request and process it
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

      // Update the target element's parentId to the source element's ID
      const updatedElement = await this.prisma.element.update({
        where: { id: targetElementId },
        data: {
          parentId: sourceElementId,
        },
      });

      // Log the reparenting action in the audit log
      await this.logAudit(
        'REPARENT',
        'Element',
        updatedElement.id,
        {
          sourceElementId,
          targetElementId,
          attributes,
        },
        userId,
      );

      updatedElements.push(updatedElement);
    }

    return {
      message: `${updatedElements.length} elements reparented successfully`,
      updatedElements,
    };
  }

  async deleteElement(id: number, userId?: number) {
    const element = await this.getElement(id);

    if (element.deletedAt) {
      throw new BadRequestException('Element is already deleted');
    }

    try {
      const deletedElement = await this.prisma.element.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // Log the deletion in the audit log
      await this.logAudit(
        'DELETE',
        'Element',
        deletedElement.id,
        {
          deletedAt: deletedElement.deletedAt,
          reason: 'Deletion initiated by user',
        },
        userId,
      );

      return deletedElement;
    } catch (error) {
      throw new BadRequestException('Error deleting element');
    }
  }
}
