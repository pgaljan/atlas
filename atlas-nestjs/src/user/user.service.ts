import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // fetch all users
  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          createdAt: true,
          deletedAt: true,
          status: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  // Fetch user by ID
  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch user with ID ${id}: ${error.message}`,
      );
    }
  }

  // Update user details and log action
  async updateUser(id: string, updateUserDto: UpdateUserDto, userId: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      // Log the update action in the AuditLog
      await this.prisma.auditLog.create({
        data: {
          action: 'User update',
          element: 'User',
          details: JSON.stringify(updateUserDto),
          userId: userId,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user with ID ${id}: ${error.message}`,
      );
    }
  }

  // Soft delete user (mark as deleted) and log the deletion
  async deleteUser(id: string, reason: string, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      // Log the deletion action in the AuditLog
      await this.prisma.auditLog.create({
        data: {
          action: 'User soft delete',
          element: 'User',
          details: JSON.stringify({ reason }),
          userId: userId,
        },
      });

      // Soft delete the user (mark as deleted)
      return await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete user with ID ${id}: ${error.message}`,
      );
    }
  }

  // Change user password and log the action
  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
    userId: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Compare the old password with the current password in the database
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        throw new ForbiddenException('Old password is incorrect');
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update the password
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { password: hashedNewPassword },
      });

      // Log the password change action in the AuditLog
      await this.prisma.auditLog.create({
        data: {
          action: 'Password change',
          element: 'User',
          details: JSON.stringify({ changedFields: ['password'] }),
          userId: userId,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to change password for user with ID ${id}: ${error.message}`,
      );
    }
  }
  async exportUsersAsExcel(): Promise<Buffer> {
    try {
      // Get users data
      const users = await this.getAllUsers();

      // Prepare data for export
      const data = users.map((user) => ({
        ID: user.id,
        'Full Name': user.fullName,
        Username: user.username,
        Email: user.email,
        Status: user.status,
        Role: user.role ? user.role.name : '',
      }));

      // Create a new workbook and worksheet
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Write workbook to buffer
      const buffer: Buffer = xlsx.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });
      return buffer;
    } catch (error) {
      console.error(
        'Error in exportUsersAsExcel:',
        error,
        error?.message,
        error?.stack,
      );
      throw new InternalServerErrorException(
        `Failed to export users: ${error?.message || error?.toString()}`,
      );
    }
  }
}
