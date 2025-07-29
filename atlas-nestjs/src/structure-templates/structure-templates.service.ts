import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Structure } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStructureTemplateDto } from './dto/create-structure-template.dto';

@Injectable()
export class StructureTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemplate(dto: CreateStructureTemplateDto) {
    try {
      if (!dto.structureId) {
        throw new NotFoundException(
          'StructureId is required to create template from structure',
        );
      }

      const structure = await this.prisma.structure.findUnique({
        where: { id: dto.structureId },
        include: {
          elements: true,
          renderers: true,
          StructureMap: {
            include: { elements: true },
          },
          parsedData: true,
        },
      });

      if (!structure)
        throw new NotFoundException(
          `Structure with id ${dto.structureId} not found`,
        );

      const structureJson = {
        ...structure,
        elements: structure.elements ?? [],
        renderers: structure.renderers ?? [],
        maps: structure.StructureMap ?? [],
        parsedData: structure.parsedData ?? [],
      };

      // 3. Create template with embedded structureJson
      const template = await this.prisma.structureTemplate.create({
        data: {
          name: dto.name,
          description: dto.description,
          structureType: structure.type,
          tags: dto.tags ?? [],
          isPublic: dto.isPublic ?? false,
          structureId: structure.id,
          ownerId: dto.ownerId,
          workspaceId: dto.workspaceId,
          thumbnailUrl: dto.thumbnailUrl,
          fileUrl: dto.fileUrl,
          structureJson,
        },
      });

      return template;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `Failed to create structure template: ${error.message}`,
      );
    }
  }

  async duplicateTemplate(
    templateId: string,
    override: Partial<CreateStructureTemplateDto>,
  ) {
    const template = await this.prisma.structureTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with id ${templateId} not found`);
    }

    const duplicated = await this.prisma.structureTemplate.create({
      data: {
        name: override.name ?? `${template.name} (Copy)`,
        description: override.description ?? template.description,
        structureJson: template.structureJson,
        structureType: template.structureType,
        tags: override.tags ?? template.tags,
        isPublic: override.isPublic ?? template.isPublic,
        structureId: template.structureId,
        ownerId: override.ownerId ?? template.ownerId,
        workspaceId: override.workspaceId ?? template.workspaceId,
        thumbnailUrl: override.thumbnailUrl ?? template.thumbnailUrl,
        fileUrl: override.fileUrl ?? template.fileUrl,
      },
    });

    return duplicated;
  }

  async getAllTemplatesByWorkspace(workspaceId: string) {
    try {
      return await this.prisma.structureTemplate.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get templates: ${error.message}`,
      );
    }
  }

  async getTemplateById(id: string) {
    const template = await this.prisma.structureTemplate.findUnique({
      where: { id },
    });
    if (!template)
      throw new NotFoundException(`Template with id ${id} not found`);
    return template;
  }

  async updateTemplate(
    id: string,
    update: Partial<CreateStructureTemplateDto>,
  ) {
    try {
      return await this.prisma.structureTemplate.update({
        where: { id },
        data: update,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update template: ${error.message}`,
      );
    }
  }

  async deleteTemplate(id: string) {
    try {
      return await this.prisma.structureTemplate.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete template: ${error.message}`,
      );
    }
  }

  async useTemplateAsStructure(
    templateId: string,
    overrides: Partial<Structure>,
  ) {
    const template = await this.prisma.structureTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // 👇 Fix: cast structureJson to expected shape
    const parsed = template.structureJson as unknown as {
      elements: any[];
      renderers?: any[];
      parsedData?: any[];
      maps?: any[];
    };

    const newStructure = await this.prisma.structure.create({
      data: {
        title: overrides.name || `${template.name} (From Template)`,
        name: overrides.name || `${template.name} (From Template)`,
        description: overrides.description || template.description || null,
        ownerId: overrides.ownerId || template.ownerId,
        workspaceId:
          overrides.workspaceId ||
          template.workspaceId ||
          'default_workspace_id',
        type: template.structureType,
        imageUrl: overrides.imageUrl || null,
        markmapShowWbs: false,
        isExpanded: true,

        elements: {
          create:
            parsed.elements?.map((el) => {
              const {
                id,
                createdAt,
                updatedAt,
                deletedAt,
                structureId,
                parentId,
                recordId,
                elementLinkId,
                ...rest
              } = el;

              return {
                ...rest,
                parent: parentId ? { connect: { id: parentId } } : undefined,
                Record: recordId ? { connect: { id: recordId } } : undefined,
                ElementLink: elementLinkId
                  ? { connect: { id: elementLinkId } }
                  : undefined,
              };
            }) || [],
        },

        renderers: {
          create:
            parsed.renderers?.map((r) => {
              const { id, createdAt, updatedAt, structureId, ...rest } = r;
              return { ...rest };
            }) || [],
        },

        parsedData: {
          create:
            parsed.parsedData?.map((d) => {
              const { id, createdAt, updatedAt, structureId, ...rest } = d;
              return { ...rest };
            }) || [],
        },

        StructureMap: {
          create:
            parsed.maps?.map((m) => {
              const { id, createdAt, updatedAt, structureId, ...rest } = m;
              return { ...rest };
            }) || [],
        },
      },
      include: {
        elements: true,
        renderers: true,
        parsedData: true,
        StructureMap: true,
      },
    });

    return newStructure;
  }
}
