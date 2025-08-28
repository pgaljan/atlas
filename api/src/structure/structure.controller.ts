import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateStructureDto, UpdateIsExpandedDto } from './dto';
import { StructureService } from './structure.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('structure')
export class StructureController {
  constructor(private readonly structureService: StructureService) {}

  @Post('create')
  async createStructure(@Body() createStructureDto: CreateStructureDto) {
    try {
      const createdStructure =
        await this.structureService.createStructure(createStructureDto);
      return {
        message: 'Structure created successfully',
        structure: createdStructure,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create structure: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // structure.controller.ts
  @Get('workspace/:workspaceId')
  @UseGuards(JwtAuthGuard)
  async getAccessibleStructuresForUser(
    @Param('workspaceId') workspaceId: string,
    @Req() req: any,
  ) {
    try {
      const structures =
        await this.structureService.getAccessibleStructuresForUser(req.user.id);
      return {
        message: 'Accessible structures retrieved successfully',
        structures,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve accessible structures: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':id')
  async getStructure(@Param('id') id: string) {
    try {
      return await this.structureService.getStructure(id);
    } catch (error) {
      throw new HttpException(
        `Structure not found: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch('update/:id')
  async updateStructure(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateStructureDto>,
  ) {
    try {
      await this.structureService.updateStructure(id, updateData);
      return { message: 'Structure updated successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to update structure: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete/:id')
  async deleteStructure(@Param('id') id: string) {
    try {
      await this.structureService.deleteStructure(id);
      return { message: 'Structure deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete structure: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('batch-create')
  async createBatchStructures(@Body() structures: CreateStructureDto[]) {
    try {
      await this.structureService.createBatchStructures(structures);
      return { message: 'Structures created successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to batch create structures: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('batch-update')
  async updateBatchStructures(
    @Body() structures: Partial<CreateStructureDto>[],
  ) {
    try {
      await this.structureService.updateBatchStructures(structures);
      return { message: 'Structures updated successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to batch update structures: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('batch-delete')
  async deleteBatchStructures(@Body() ids: string[]) {
    try {
      await this.structureService.deleteBatchStructures(ids);
      return { message: 'Structures deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to batch delete structures: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('expand-state/:id')
  async updateStructureExpandState(
    @Param('id') id: string,
    @Body() dto: UpdateIsExpandedDto,
  ) {
    try {
      await this.structureService.updateIsExpandedOnly(id, dto.isExpanded);
      return { message: 'Expand state updated successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating expand state');
    }
  }

  @Put('wbs-start/:id')
  async updateWbsStart(
    @Param('id') id: string,
    @Body() body: { wbsStart: number },
  ) {
    try {
      const updated = await this.structureService.updateWbsStart(
        id,
        body.wbsStart,
      );
      return {
        message: 'WBS Start updated successfully',
        structure: updated,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to update WBS Start: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('workspace/:workspaceId/summary')
  async getStructureSummariesByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ) {
    try {
      const summaries =
        await this.structureService.getStructureSummariesByWorkspace(
          workspaceId,
        );
      return {
        message: 'Structure summaries retrieved successfully',
        summaries,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve structure summaries: ${error?.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
