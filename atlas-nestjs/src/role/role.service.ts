import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  // Create a new role
  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });
    if (existingRole) {
      throw new ConflictException(
        `Role with name "${createRoleDto.name}" already exists.`,
      );
    }

    await this.prisma.role.create({
      data: createRoleDto,
    });
    return { message: `Role "${createRoleDto.name}" created successfully.` };
  }

  // Get all roles
  async findAll() {
    try {
      return await this.prisma.role.findMany();
    } catch (error) {
      throw new Error('Error fetching roles');
    }
  }

  // Get a single role by ID
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }
    return role;
  }

  // Update a role
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    if (updateRoleDto.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(
          `Role with name "${updateRoleDto.name}" already exists.`,
        );
      }
    }

    await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    return { message: `Role with ID ${id} updated successfully.` };
  }

  // Delete a role
  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: `Role with ID ${id} deleted successfully.` };
  }
}
