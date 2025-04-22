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

  async updateCatalog(id: string, updateDto: UpdateStructureCatalogDto) {
    const catalog = await this.prisma.structureCatalog.findUnique({
      where: { id },
      include: { userTier: true },
    });

    if (!catalog) {
      throw new NotFoundException(`StructureCatalog with ID ${id} not found`);
    }

    const { userTier, ...catalogData } = updateDto;

    try {
      return await this.prisma
        .$transaction([
          this.prisma.catalogTier.deleteMany({
            where: { catalogId: id },
          }),
          this.prisma.structureCatalog.update({
            where: { id },
            data: {
              ...catalogData,
              userTier: {
                create: (userTier ?? []).map((tier) => ({
                  tier,
                })),
              },
            },
            include: { userTier: true },
          }),
        ])
        .then(([, updatedCatalog]) => updatedCatalog);
    } catch (error) {
      console.error('Update Error:', error);
      throw new BadRequestException('Error updating structure catalog');
    }
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
}
