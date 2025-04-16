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
      return await this.prisma.structureCatalog.findMany();
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
        where: { userTier },
      });
    } catch (error) {
      throw new BadRequestException('Error fetching catalogs by user tier');
    }
  }

  async createCatalog(createDto: CreateStructureCatalogDto) {
    try {
      return await this.prisma.structureCatalog.create({
        data: createDto,
      });
    } catch (error) {
      console.log('Prisma Error:', error);
      throw new BadRequestException('Error creating structure catalog');
    }
  }
  
  async updateCatalog(id: string, updateDto: UpdateStructureCatalogDto) {
    const catalog = await this.prisma.structureCatalog.findUnique({
      where: { id },
    });

    if (!catalog) {
      throw new NotFoundException(`StructureCatalog with ID ${id} not found`);
    }

    try {
      return await this.prisma.structureCatalog.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      throw new BadRequestException('Error updating structure catalog');
    }
  }

  async deleteCatalog(id: string) {
    const catalog = await this.prisma.structureCatalog.findUnique({
      where: { id },
    });

    if (!catalog) {
      throw new NotFoundException(`StructureCatalog with ID ${id} not found`);
    }

    try {
      return await this.prisma.structureCatalog.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Error deleting structure catalog');
    }
  }
}
