import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StructureCataloguesService } from './structure-catalogues.service';
import { CreateStructureCatalogDto } from './dto/create-structure-catalog.dto';
import { UpdateStructureCatalogDto } from './dto/update-structure-catalog.dto';

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

  @Delete('delete/:id')
  async deleteCatalog(@Param('id') id: string) {
    try {
      return await this.catalogService.deleteCatalog(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error deleting structure catalog');
    }
  }
}
