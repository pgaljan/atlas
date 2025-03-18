import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  AdminRegisterDto,
  AdminForgotPasswordDto,
  AdminResetPasswordDto,
  AdminChangePasswordDto,
  AdminProfileUpdateDto,
} from './dto';

@Injectable()
export class AdministratorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Register a new administrator (SuperAdmin)
  async register(adminRegisterDto: AdminRegisterDto) {
    const { firstName, lastName, email, password, address } = adminRegisterDto;
    try {
      const existingAdmin = await this.prisma.superAdmin.findUnique({
        where: { email },
      });
      if (existingAdmin) {
        throw new ConflictException(
          'Administrator with this email already exists',
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = await this.prisma.superAdmin.create({
        data: {
          firstName,
          lastName,
          email,
          address,
          password: hashedPassword,
        },
      });
      return {
        id: newAdmin.id,
        message: 'Administrator registered successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to register administrator: ${error.message}`,
      );
    }
  }

  // Login administrator: generate a JWT token and return administrator details
  async login(admin: any) {
    try {
      const payload = { email: admin.email, sub: admin.id };
      const access_token = this.jwtService.sign(payload);
      return { admin, access_token };
    } catch (error) {
      throw new InternalServerErrorException('Failed to login administrator');
    }
  }

  // Forgot password: typically sends a reset link
  async forgotPassword(adminForgotPasswordDto: AdminForgotPasswordDto) {
    const { email } = adminForgotPasswordDto;
    try {
      const admin = await this.prisma.superAdmin.findUnique({
        where: { email },
      });
      if (!admin) {
        throw new NotFoundException('Administrator not found');
      }
      // TODO: Implement sending a reset password email or token
      return {
        message: 'Password reset link has been sent to your email',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to process forgot password: ${error.message}`,
      );
    }
  }

  // Reset password for administrator
  async resetPassword(adminResetPasswordDto: AdminResetPasswordDto) {
    const { email, newPassword } = adminResetPasswordDto;
    try {
      const admin = await this.prisma.superAdmin.findUnique({
        where: { email },
      });
      if (!admin) {
        throw new NotFoundException('Administrator not found');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.superAdmin.update({
        where: { email },
        data: { password: hashedPassword },
      });
      const payload = { email: admin.email, sub: admin.id };
      const newAccessToken = this.jwtService.sign(payload);
      return {
        message: 'Password reset successfully',
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to reset password: ${error.message}`,
      );
    }
  }

  // Change password for administrator
  async changePassword(
    admin: any,
    adminChangePasswordDto: AdminChangePasswordDto,
  ) {
    const { oldPassword, newPassword } = adminChangePasswordDto;
    try {
      // Verify old password
      const isValid = await bcrypt.compare(oldPassword, admin.password);
      if (!isValid) {
        throw new ConflictException('Old password is incorrect');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedAdmin = await this.prisma.superAdmin.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      });
      return {
        message: 'Password changed successfully',
        administrator: updatedAdmin,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to change password: ${error.message}`,
      );
    }
  }

  // Update administrator profile
  async updateProfile(
    admin: any,
    adminProfileUpdateDto: AdminProfileUpdateDto,
  ) {
    try {
      const updatedAdmin = await this.prisma.superAdmin.update({
        where: { id: admin.id },
        data: adminProfileUpdateDto,
      });
      return {
        message: 'Profile updated successfully',
        administrator: updatedAdmin,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update profile: ${error.message}`,
      );
    }
  }

  // Get administrator profile
  async getProfile(admin: any) {
    try {
      const profile = await this.prisma.superAdmin.findUnique({
        where: { id: admin.id },
      });
      if (!profile) {
        throw new NotFoundException('Administrator not found');
      }
      return profile;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch profile: ${error.message}`,
      );
    }
  }

  // Get all administrators (exclude sensitive info)
  async getAllAdmins() {
    try {
      return await this.prisma.superAdmin.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          address: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch all administrators: ${error.message}`,
      );
    }
  }
}
