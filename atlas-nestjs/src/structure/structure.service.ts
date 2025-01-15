import {
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

  async createStructure(createStructureDto: CreateStructureDto) {
    const { name, description, visibility, ownerId, elements } =
      createStructureDto;

    try {
      // Check if a structure with the same name already exists
      const existingStructure = await this.prisma.structure.findFirst({
        where: { name },
      });

      if (existingStructure) {
        throw new InternalServerErrorException(`"${name}" already exists.`);
      }

      const owner = await this.prisma.user.findUnique({
        where: { id: ownerId },
      });
      if (!owner) {
        throw new NotFoundException(`User with id ${ownerId} not found`);
      }

      const elementsToProcess = elements || [];

      const formatElements = (elements: any[]) =>
        elements.map((element) => ({
          type: element.type,
          wbsLevel: element.wbsLevel,
          children: element.children
            ? { create: formatElements(element.children) }
            : undefined,
        }));

      const structure = await this.prisma.structure.create({
        data: {
          name,
          description,
          visibility: visibility || Visibility.private,
          ownerId,
          elements: {
            create: elements ? formatElements(elements) : [],
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
            elements: elementsToProcess.map((element) => ({
              type: element.name,
            })),
          },
          userId: ownerId,
        },
      });

      return structure;
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getStructure(id: string) {
    try {
      const structure = await this.prisma.structure.findUnique({
        where: { id },
        include: {
          elements: {
            where: { deletedAt: null },
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

      const buildHierarchy = (elements: any[], parentId = null) =>
        elements
          .filter((element) => element.parentId === parentId)
          .map((element) => ({
            ...element,
            children: buildHierarchy(elements, element.id),
          }));

      const nestedElements = buildHierarchy(structure.elements);

      return { ...structure, elements: nestedElements };
    } catch (error) {
      throw new NotFoundException(`Structure not found: ${error.message}`);
    }
  }

  async getStructuresByUserId(userId: string) {
    try {
      const structures = await this.prisma.structure.findMany({
        where: { ownerId: userId },
      });

      if (!structures || structures.length === 0) {
        throw new NotFoundException(
          `No structures found for user with id ${userId}`,
        );
      }

      return structures;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve structures: ${error.message}`,
      );
    }
  }

  async updateStructure(id: string, updateData: Partial<CreateStructureDto>) {
    try {
      const { name, title, description, visibility, elements, maps } =
        updateData;

      const structure = await this.prisma.structure.findUnique({
        where: { id },
      });
      if (!structure) {
        throw new NotFoundException(`Structure with id ${id} not found`);
      }

      const elementsToProcess = elements || [];

      // Perform the update
      const updatedStructure = await this.prisma.structure.update({
        where: { id },
        data: {
          name: name || undefined,
          title: title || undefined,
          description: description || undefined,
          visibility: visibility || undefined,
          updatedAt: new Date(),
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

      // Log the update in the AuditLog
      await this.prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          element: 'Structure',
          elementId: updatedStructure.id.toString(),
          details: {
            name,
            description,
            visibility,
            elements: elementsToProcess.map((element) => ({
              type: element.name,
            })),
          },
          userId: structure.ownerId,
        },
      });

      return updatedStructure;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update structure: ${error.message}`,
      );
    }
  }

  async deleteStructure(id: string) {
    try {
      const structure = await this.prisma.structure.findUnique({
        where: { id },
        include: { elements: true },
      });

      if (!structure) {
        throw new NotFoundException(`Structure with id ${id} not found`);
      }

      const elementIds = structure.elements.map((element) => element.id);

      await this.prisma.record.deleteMany({
        where: { id: { in: elementIds } },
      });
      await this.prisma.element.deleteMany({ where: { structureId: id } });

      // Log the deletion in the AuditLog
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
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete structure: ${error.message}`,
      );
    }
  }

  // Batch operations
  async createBatchStructures(structures: CreateStructureDto[]) {
    try {
      const createdStructures = await Promise.all(
        structures.map((structure) => this.createStructure(structure)),
      );

      // Log each creation in the AuditLog
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
}
