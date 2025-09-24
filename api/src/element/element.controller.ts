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
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateElementDto } from './dto/create-element.dto';
import { ReparentElementsDto } from './dto/reparent-elements.dto';
import { UpdateElementDto } from './dto/update-element.dto';
import { ElementService } from './element.service';
import { UpdateIsExpandedDto } from './dto/update-is-expanded.dto';
import { UpdateOrderIndexDto } from './dto/update-order-index.dto';
import { StructurePermissionGuard } from 'src/auth/guards/structure-permission.guard';

@Controller('element')
@UseGuards(JwtAuthGuard, StructurePermissionGuard)
export class ElementController {
  constructor(private readonly elementService: ElementService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createElement(
    @Body() createElementDto: CreateElementDto,
    @Req() req: any,
  ) {
    try {
      const { parentId, structureId } = createElementDto;

      if (!structureId) {
        throw new BadRequestException('structureId is required');
      }

      const userId = req.user?.id;

      // If parentId is provided, treat it as nested element creation
      if (parentId) {
        const elementsArray = Array.isArray(createElementDto)
          ? createElementDto
          : [createElementDto];
        await this.elementService.createNestedElements(
          parentId,
          elementsArray,
          userId,
        );
        return { message: 'Nested elements created successfully' };
      }

      // Otherwise, create a standalone element
      await this.elementService.createElement(createElementDto, userId);
      return {
        message: 'Element created successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error creating element');
    }
  }

  @Get()
  async getAllElements() {
    return this.elementService.getAllElements();
  }

  @Get(':id')
  async getElement(@Param('id') id: string) {
    try {
      return await this.elementService.getElement(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Element with id ${id} not found`);
      }
      throw new BadRequestException('Error retrieving element');
    }
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async updateElement(
    @Param('id') id: string,
    @Body() updateElementDto: UpdateElementDto,
    @Req() req: any,
  ) {
    try {
      const userId = req.user?.id;
      await this.elementService.updateElement(id, updateElementDto, userId);
      return { message: 'Element updated successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error updating element');
    }
  }

  @Post('reparent')
  @UseGuards(JwtAuthGuard)
  async reparentElements(
    @Body() reparentElementsDto: ReparentElementsDto,
    @Req() req: any,
  ) {
    try {
      const userId = req.user?.id;
      await this.elementService.reparentElements(reparentElementsDto, userId);
      return { message: 'Elements reparented successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error reparenting elements');
    }
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteElement(@Param('id') id: string, @Req() req: any) {
    try {
      const userId = req.user?.id;
      await this.elementService.deleteElement(id, userId);
      return { message: 'Element deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error deleting element');
    }
  }

  @Put('expand-state/:id')
  @UseGuards(JwtAuthGuard)
  async updateIsExpanded(
    @Param('id') id: string,
    @Body() dto: UpdateIsExpandedDto,
    @Req() req: any,
  ) {
    try {
      const userId = req.user?.id;
      await this.elementService.updateIsExpandedOnly(
        id,
        dto.isExpanded,
        userId,
      );
      return { message: 'Expand state updated successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error updating expand state');
    }
  }

  @Put('order-index/:id')
  @UseGuards(JwtAuthGuard)
  async updateOrderIndex(
    @Param('id') id: string,
    @Body() dto: UpdateOrderIndexDto,
    @Req() req: any,
  ) {
    try {
      const userId = req.user?.id;
      await this.elementService.updateOrderIndex(id, dto.orderIndex, userId);
      return { message: 'Order index updated successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error updating order index');
    }
  }
}
