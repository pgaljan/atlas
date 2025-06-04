import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStructureCatalogDto } from './dto/create-structure-catalog.dto';
import { UpdateStructureCatalogDto } from './dto/update-structure-catalog.dto';

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
      console.error(error);
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
}
