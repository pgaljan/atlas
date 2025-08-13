import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Structure } from '@prisma/client';
import * as crypto from 'crypto';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStructureCatalogDto } from './dto/create-structure-catalog.dto';
import { UpdateStructureCatalogDto } from './dto/update-structure-catalog.dto';
import { RestoreService } from '../restore-backup/restore-backup.service';

@Injectable()
export class StructureCataloguesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCatalogs() {
    try {
      return await this.prisma.structureCatalog.findMany({
        include: {
          userTier: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Error fetching structure catalogs');
    }
  }

  async getCatalogById(id: string) {
    const catalog = await this.prisma.structureCatalog.findUnique({
      where: { id },
    });

    if (!catalog) {
      throw new NotFoundException(`StructureCatalog with ID ${id} not found`);
    }

    return catalog;
  }

  async getCatalogsByUserTier(userTier: string) {
    try {
      return await this.prisma.structureCatalog.findMany({
        where: {
          userTier: {
            some: {
              tier: userTier,
            },
          },
        },
        include: {
          userTier: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Error fetching catalogs by user tier');
    }
  }

  async createCatalog(createDto: CreateStructureCatalogDto) {
    try {
      const { userTier, ...catalogData } = createDto;

      if (!Array.isArray(userTier)) {
        throw new BadRequestException('Invalid userTier array');
      }

      return this.prisma.structureCatalog.create({
        data: {
          ...catalogData,
          userTier: {
            create: userTier.map((tier) => ({ tier })),
          },
        },
        include: { userTier: true },
      });
    } catch (error) {
      throw new BadRequestException('Error creating structure catalog');
    }
  }

  async reorderCatalogs(catalogs: { id: string; order: number }[]) {
    const updatePromises = catalogs.map((catalog) =>
      this.prisma.structureCatalog.update({
        where: { id: catalog.id },
        data: { order: catalog.order },
      }),
    );
    return Promise.all(updatePromises);
  }

  async updateCatalog(id: string, dto: UpdateStructureCatalogDto) {
    const catalog = await this.prisma.structureCatalog.findUnique({
      where: { id },
    });
    if (!catalog) throw new NotFoundException(`Catalog ${id} not found`);

    const { userTier, ...data } = dto;

    if (userTier !== undefined) {
      return this.prisma.$transaction(async (tx) => {
        await tx.catalogTier.deleteMany({ where: { catalogId: id } });
        return tx.structureCatalog.update({
          where: { id },
          data: {
            ...data,
            userTier: { create: userTier.map((tier) => ({ tier })) },
          },
          include: { userTier: true },
        });
      });
    }

    // Otherwise, just update the catalog itself
    return this.prisma.structureCatalog.update({
      where: { id },
      data,
      include: { userTier: true },
    });
  }

  async deleteCatalog(id: string) {
    const catalog = await this.prisma.structureCatalog.findUnique({
      where: { id },
      include: { userTier: true },
    });

    if (!catalog) {
      throw new NotFoundException(`StructureCatalog with ID ${id} not found`);
    }

    try {
      await this.prisma.catalogTier.deleteMany({
        where: {
          catalogId: id,
        },
      });

      // Step 2: Delete the StructureCatalog
      return await this.prisma.structureCatalog.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Error deleting structure catalog');
    }
  }

  async updateCatalogOrder(id: string, order: number) {
    const existing = await this.prisma.structureCatalog.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`StructureCatalog with ID ${id} not found`);
    }

    return this.prisma.structureCatalog.update({
      where: { id },
      data: { order },
    });
  }

  async useCatalogAsStructure(
    catalogId: string,
    overrides: Partial<Structure>,
  ) {
    try {
      // 1. Get the catalog entry
      const catalog = await this.prisma.structureCatalog.findUnique({
        where: { id: catalogId },
      });

      if (!catalog) {
        throw new NotFoundException(`Catalog with ID ${catalogId} not found`);
      }

      if (!catalog.fileUrl) {
        throw new BadRequestException(
          'Catalog does not have a backup file URL',
        );
      }

      // 2. Download the backup file from the URL
      let fileBuffer: Buffer;
      try {
        const response = await axios.get<ArrayBuffer>(catalog.fileUrl, {
          responseType: 'arraybuffer',
        });
        fileBuffer = Buffer.from(response.data);
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to download backup file from URL: ${catalog.fileUrl}`,
        );
      }

      // 3. Get user information for workspace
      const user = await this.prisma.user.findUnique({
        where: { id: overrides.ownerId },
      });
      if (!user || !user.defaultWorkspaceId) {
        throw new InternalServerErrorException(
          'No valid workspaceId found for the user',
        );
      }

      // 4. Create a new structure using the same name pattern as templates
      const newStructureId = crypto.randomUUID
        ? crypto.randomUUID()
        : crypto.randomBytes(16).toString('hex');

      // 5. Use RestoreService to restore the backup with proper ID remapping
      const restoreService = new RestoreService(this.prisma);

      try {
        await restoreService.restoreBackupfromURL(
          fileBuffer,
          newStructureId,
          overrides.ownerId,
        );
      } catch (restoreError) {
        throw new InternalServerErrorException(
          `Failed to restore catalog backup: ${restoreError.message}`,
        );
      }

      // 6. Update the created structure with the provided overrides
      const updatedStructure = await this.prisma.structure.update({
        where: { id: newStructureId },
        data: {
          name: overrides.name || `${catalog.name} (From Catalog)`,
          title: overrides.name || `${catalog.name} (From Catalog)`,
          description: overrides.description || catalog.description || null,
          ownerId: overrides.ownerId,
          workspaceId: overrides.workspaceId || user.defaultWorkspaceId,
          imageUrl: overrides.imageUrl || null,
        },
      });

      // 7. Return the complete structure with all elements
      return await this.prisma.structure.findUnique({
        where: { id: newStructureId },
        include: {
          elements: {
            include: {
              Record: true,
            },
          },
          renderers: true,
          parsedData: true,
          StructureMap: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to use catalog as structure: ${error.message}`,
      );
    }
  }
}
