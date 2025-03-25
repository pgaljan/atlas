import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateStructureDto } from './dto';
import { StructureService } from './structure.service';

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

  @Get('workspace/:workspaceId')
  async getStructuresByUserId(@Param('workspaceId') workspaceId: string) {
    try {
      const structures =
        await this.structureService.getStructuresByWorkspaceId(workspaceId);
      return {
        message: 'Structures retrieved successfully',
        structures,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve structures: ${error.message}`,
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

  // Batch operations
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
}
