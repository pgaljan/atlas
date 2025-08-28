import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  async createSubRoute(@Body() createRoleDto: CreateRoleDto) {
    try {
      const response = await this.roleService.create(createRoleDto);
      return response;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(
          `Role with name "${createRoleDto.name}" already exists.`,
        );
      }
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.roleService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: string) {
    try {
      return await this.roleService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }
      throw error;
    }
  }

  @Patch('update/:id')
  async updateSubRoute(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    try {
      const response = await this.roleService.update(id, updateRoleDto);
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      } else if (error instanceof ConflictException) {
        throw new ConflictException(
          `Role with name "${updateRoleDto.name}" already exists.`,
        );
      }
      throw error;
    }
  }

  @Delete('delete/:id')
  async deleteSubRoute(@Param('id', ParseIntPipe) id: string) {
    try {
      const response = await this.roleService.remove(id);
      return response;
    } catch (error) { 
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }
      throw error;
    }
  }
}
