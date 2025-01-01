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
import { CreateElementDto } from './dto/create-element.dto';
import { ReparentElementsDto } from './dto/reparent-elements.dto';
import { UpdateElementDto } from './dto/update-element.dto';
import { ElementService } from './element.service';

@Controller('element')
export class ElementController {
  constructor(private readonly elementService: ElementService) {}

  @Post('create')
  async createElement(@Body() createElementDto: CreateElementDto) {
    try {
      await this.elementService.createElement(createElementDto);
      return { message: 'Element created successfully' };
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

  @Post('create-nested/:parentId')
  async createNestedElements(
    @Param('parentId') parentId: string,
    @Body() nestedElements: CreateElementDto | CreateElementDto[],
  ) {
    try {
      const elementsArray = Array.isArray(nestedElements)
        ? nestedElements
        : [nestedElements];

      await this.elementService.createNestedElements(
        parseInt(parentId),
        elementsArray,
      );
      return { message: 'Nested elements created successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error creating nested elements');
    }
  }

  @Get()
  async getAllElements() {
    return this.elementService.getAllElements();
  }

  @Get(':id')
  async getElement(@Param('id') id: string) {
    try {
      return await this.elementService.getElement(parseInt(id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Element with id ${id} not found`);
      }
      throw new BadRequestException('Error retrieving element');
    }
  }

  @Patch('update/:id')
  async updateElement(
    @Param('id') id: string,
    @Body() updateElementDto: UpdateElementDto,
  ) {
    try {
      await this.elementService.updateElement(parseInt(id), updateElementDto);
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
  async reparentElements(@Body() reparentElementsDto: ReparentElementsDto) {
    try {
      await this.elementService.reparentElements(reparentElementsDto);
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
  async deleteElement(@Param('id') id: string) {
    try {
      await this.elementService.deleteElement(parseInt(id));
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
}
