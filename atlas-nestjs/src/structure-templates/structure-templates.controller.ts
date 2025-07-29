import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StructureTemplateService } from './structure-templates.service';
import { CreateStructureTemplateDto } from './dto/create-structure-template.dto';
import { Structure } from '@prisma/client';

@Controller('structure-templates')
export class StructureTemplateController {
  constructor(private readonly service: StructureTemplateService) {}

  @Post('create-template')
  async create(@Body() dto: CreateStructureTemplateDto) {
    try {
      const result = await this.service.createTemplate(dto);
      return {
        message: 'Structure template created with full data',
        template: result,
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('duplicate/:id')
  async duplicateTemplate(
    @Param('id') templateId: string,
    @Body() body: Partial<CreateStructureTemplateDto>,
  ) {
    try {
      const duplicated = await this.service.duplicateTemplate(templateId, body);
      return {
        message: 'Template duplicated successfully',
        template: duplicated,
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('workspace/:workspaceId')
  async getByWorkspace(@Param('workspaceId') workspaceId: string) {
    try {
      const templates =
        await this.service.getAllTemplatesByWorkspace(workspaceId);
      return { message: 'Templates fetched', templates };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      return await this.service.getTemplateById(id);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() update: Partial<CreateStructureTemplateDto>,
  ) {
    try {
      await this.service.updateTemplate(id, update);
      return { message: 'Template updated' };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.service.deleteTemplate(id);
      return { message: 'Template deleted' };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post(':id/use')
  async useTemplate(
    @Param('id') templateId: string,
    @Body() overrides: Partial<Structure>,
  ) {
    try {
      const structure = await this.service.useTemplateAsStructure(
        templateId,
        overrides,
      );
      return {
        message: 'Structure created from template',
        structure,
      };
    } catch (err) {
      console.log(err)
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
