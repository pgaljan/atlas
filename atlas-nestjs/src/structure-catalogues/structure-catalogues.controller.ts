import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Structure } from '@prisma/client';
import { StructureCataloguesService } from './structure-catalogues.service';
import { UpdateStructureCatalogDto } from './dto/update-structure-catalog.dto';
import { UpdateStructureCatalogOrderDto } from './dto/update-structure-catalog-order.dto';

@Controller('structure-catalogs')
export class StructureCataloguesController {
  constructor(private readonly catalogService: StructureCataloguesService) {}

  @Get()
  async getAllCatalogs() {
    try {
      return await this.catalogService.getAllCatalogs();
    } catch (error) {
      throw new BadRequestException('Error fetching structure catalogs');
    }
  }

  @Get(':id')
  async getCatalogById(@Param('id') id: string) {
    try {
      return await this.catalogService.getCatalogById(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error retrieving structure catalog');
    }
  }

  @Get('tier/:userTier')
  async getCatalogsByUserTier(@Param('userTier') userTier: string) {
    try {
      return await this.catalogService.getCatalogsByUserTier(userTier);
    } catch (error) {
      throw new BadRequestException('Error fetching catalogs by user tier');
    }
  }

  @Post('create')
  async createCatalog(@Body() createDto: any) {
    try {
      if (!createDto.userTier && createDto.userTier) {
        createDto.userTier = createDto.userTier;
      }

      return await this.catalogService.createCatalog(createDto);
    } catch (error) {
      throw new BadRequestException('Error creating structure catalog');
    }
  }

  @Patch('update/:id')
  async updateCatalog(
    @Param('id') id: string,
    @Body() updateDto: UpdateStructureCatalogDto,
  ) {
    try {
      return await this.catalogService.updateCatalog(id, updateDto);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error updating structure catalog');
    }
  }

  @Patch('reorder')
  async reorderCatalogs(@Body() catalogs: { id: string; order: number }[]) {
    try {
      return await this.catalogService.reorderCatalogs(catalogs);
    } catch (error) {
      throw new BadRequestException('Error reordering structure catalogs');
    }
  }

  @Put(':id/order')
  async updateCatalogOrder(
    @Param('id') id: string,
    @Body() dto: UpdateStructureCatalogOrderDto,
  ) {
    try {
      return await this.catalogService.updateCatalogOrder(id, dto.order);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error updating catalog order');
    }
  }

  @Delete('delete/:id')
  async deleteCatalog(@Param('id') id: string) {
    try {
      return await this.catalogService.deleteCatalog(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error deleting structure catalog');
    }
  }

  @Post(':id/use')
  async useCatalog(
    @Param('id') catalogId: string,
    @Body() overrides: Partial<Structure>,
  ) {
    try {
      const structure = await this.catalogService.useCatalogAsStructure(
        catalogId,
        overrides,
      );
      return {
        message: 'Structure created from catalog successfully',
        structure,
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
