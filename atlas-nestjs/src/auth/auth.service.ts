import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Plan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  // Audit log method
  private async logAudit(
    action: string,
    element: string,
    elementId: number | string,
    details: object,
    userId?: number,
  ) {
    await this.prismaService.auditLog.create({
      data: {
        action,
        element,
        elementId: elementId.toString(),
        details: details,
        userId: userId || null,
      },
    });
  }

  // Register method
  async register(registerDto: RegisterDto) {
    const { username, email, password, roleName } = registerDto;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const role = await prisma.role.findFirst({
          where: {
            name: {
              equals: roleName,
              mode: 'insensitive',
            },
          },
        });

        if (!role) {
          throw new ConflictException('Role not found');
        }

        const newUser = await prisma.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            roleId: role.id,
          },
        });

        const freePlan: Plan = await prisma.plan.findFirst({
          where: { name: 'Personal' },
        });

        if (!freePlan) {
          throw new ConflictException('Free plan not found');
        }

        const subscriptionEndDate = new Date();
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

        await prisma.subscription.create({
          data: {
            userId: newUser.id,
            planId: freePlan.id,
            features: freePlan.features,
            startDate: new Date(),
            endDate: subscriptionEndDate,
            status: 'active',
          },
        });

        const payload = { email: newUser.email, sub: newUser.id };

        // Log the audit action for registration
        await this.logAudit('User Registration', 'User', newUser.id, {
          username,
          email,
        });

        return { user: payload };
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred during registration',
      );
    }
  }

  // Validate user method
  async validateUser(email: string, password: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.deletedAt) {
        throw new ConflictException('This account has been deactivated');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      return isPasswordValid ? user : null;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while validating user credentials',
      );
    }
  }

  // Login method
  async login(user: any) {
    try {
      // Validate password
      const isPasswordValid = await bcrypt.compare(
        user.password,
        user.storedPassword,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException(
          'Invalid credentials. Please check your password.',
        );
      }

      // Generate JWT token if password is valid
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const existingToken = await this.prismaService.token.findUnique({
        where: {
          userId_key: {
            userId: user.id,
            key: 'access_token',
          },
        },
      });

      if (existingToken) {
        await this.prismaService.token.update({
          where: { id: existingToken.id },
          data: { value: accessToken, expiresAt },
        });
      } else {
        await this.prismaService.token.create({
          data: {
            userId: user.id,
            key: 'access_token',
            value: accessToken,
            expiresAt,
          },
        });
      }

      // Log the audit action for login
      await this.logAudit('User Login', 'User', user.id, { email: user.email });

      // Return user data and the access token
      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        access_token: accessToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred during login',
      );
    }
  }

  // Reset Password method
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword } = resetPasswordDto;

    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prismaService.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      const existingToken = await this.prismaService.token.findUnique({
        where: {
          userId_key: {
            userId: user.id,
            key: 'access_token',
          },
        },
      });

      if (existingToken) {
        await this.prismaService.token.update({
          where: { id: existingToken.id },
          data: { expiresAt: new Date() },
        });
      }

      const payload = { email: user.email, sub: user.id };
      const newAccessToken = this.jwtService.sign(payload);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await this.prismaService.token.create({
        data: {
          userId: user.id,
          key: 'access_token',
          value: newAccessToken,
          expiresAt,
        },
      });

      // Log the audit action for password reset
      await this.logAudit('Password Reset', 'User', user.id, {
        email: user.email,
      });

      return {
        message: 'Password reset successfully',
        access_token: newAccessToken,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred during password reset',
      );
    }
  }

  // Logout method
  async logout(user: any) {
    try {
      // Find and delete the access token for the user
      const existingToken = await this.prismaService.token.findUnique({
        where: {
          userId_key: {
            userId: user.id,
            key: 'access_token',
          },
        },
      });

      if (existingToken) {
        // Mark the token as expired or delete it from the database
        await this.prismaService.token.update({
          where: { id: existingToken.id },
          data: { expiresAt: new Date() },
        });
      }

      // Optionally, you can also log the audit for logout
      await this.logAudit('User Logout', 'User', user.id, {
        email: user.email,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred during logout',
      );
    }
  }
}
