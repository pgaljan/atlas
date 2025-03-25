import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Plan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { Response } from 'express';
import { generateFromEmail } from 'unique-username-generator';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  // Audit log method
  private async logAudit(
    action: string,
    element: string,
    elementid: string,
    details: object,
    userId?: string,
  ) {
    await this.prismaService.auditLog.create({
      data: {
        action,
        element,
        elementId: elementid,
        details: details,
        userId: userId || null,
      },
    });
  }

  // Register method in AuthService
  async register(registerDto: RegisterDto) {
    const { fullName, email, password, roleName } = registerDto;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }

        // Generate a modified username based on fullName
        let modifiedUsername = fullName;
        if (fullName.includes(' ')) {
          const parts = fullName.split(' ');
          const baseUsername = parts
            .map((word, index) =>
              index === parts.length - 1 ? word : word.toLowerCase(),
            )
            .join('_');
          const suffix = new Date().getFullYear() - 2000;
          modifiedUsername = `${baseUsername}${suffix}`;
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

        // Create a new workspace record for the user
        const newWorkspace = await prisma.workspace.create({
          data: {
            name: `${modifiedUsername}'s Workspace`,
          },
        });

        // Create the new user with the new workspace id as defaultWorkspaceId
        const newUser = await prisma.user.create({
          data: {
            username: modifiedUsername,
            fullName,
            email,
            password: hashedPassword,
            roleId: role.id,
            defaultWorkspaceId: newWorkspace.id,
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

        await this.logAudit('User Registration', 'User', newUser.id, {
          username: modifiedUsername,
          email,
        });

        return {
          id: newUser.id,
          message: 'User registered successfully',
        };
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
      await this.logAudit('User Login', 'User', user.id, { email: user.email });
      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
          workspaceId: user.defaultWorkspaceId,
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

  async signIn(user: any) {
    if (!user || !user.email) {
      throw new BadRequestException('Invalid user data');
    }

    let existingUser = await this.prismaService.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      existingUser = await this.prismaService.user.create({
        data: {
          email: user.email,
          username: generateFromEmail(user.email, 5),
          fullName: user.name || user.displayName,
          password: '',
          roleId: '',
        },
      });

      await this.logAudit('Google Signup', 'User', existingUser.id, {
        email: user.email,
      });
    }

    const payload = { email: existingUser.email, sub: existingUser.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Google authentication successful',
      user: existingUser,
      access_token: accessToken,
    };
  }

  async googleLogin(user: any, res: Response) {
    if (!user || !user.email) {
      throw new BadRequestException('Google authentication failed');
    }

    try {
      let existingUser = await this.prismaService.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        const defaultRoleName = 'User';

        const role = await this.prismaService.role.findFirst({
          where: { name: { equals: defaultRoleName, mode: 'insensitive' } },
        });

        if (!role) {
          throw new ConflictException(
            `Default role '${defaultRoleName}' not found`,
          );
        }

        existingUser = await this.prismaService.user.create({
          data: {
            email: user.email,
            username: generateFromEmail(user.email, 5),
            fullName: user.name || user.displayName,
            password: '',
            roleId: role.id,
          },
        });

        // Assign a default payment plan (e.g., "Personal")
        const freePlan: Plan = await this.prismaService.plan.findFirst({
          where: { name: 'Personal' },
        });

        if (!freePlan) {
          throw new ConflictException('Free plan not found');
        }

        const subscriptionEndDate = new Date();
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

        await this.prismaService.subscription.create({
          data: {
            userId: existingUser.id,
            planId: freePlan.id,
            features: freePlan.features,
            startDate: new Date(),
            endDate: subscriptionEndDate,
            status: 'active',
          },
        });

        await this.logAudit('Google Signup', 'User', existingUser.id, {
          email: user.email,
        });
      }

      const payload = { email: existingUser.email, sub: existingUser.id };
      const accessToken = this.jwtService.sign(payload);

      // Get frontend URL from ConfigService
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      if (!frontendUrl) {
        throw new InternalServerErrorException(
          'Frontend URL is not set in environment variables',
        );
      }

      // ✅ Convert Hex Key to a 32-byte Buffer
      const secretKeyHex = process.env.ENCRYPTION_SECRET;
      if (!secretKeyHex || secretKeyHex.length !== 64) {
        throw new InternalServerErrorException(
          'Invalid ENCRYPTION_SECRET. Must be a 64-character hex string (32 bytes).',
        );
      }
      const secretKey = Buffer.from(secretKeyHex, 'hex');

      const userData = JSON.stringify({
        token: accessToken,
        userId: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
      });

      // Generate IV
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

      // Encrypt and encode in base64
      let encryptedData = cipher.update(userData, 'utf-8', 'base64');
      encryptedData += cipher.final('base64');

      const encryptedPayload = `${iv.toString('hex')}:${encryptedData}`;

      return res.redirect(
        `${frontendUrl}/app/google-callback?token=${encodeURIComponent(encryptedPayload)}`,
      );
    } catch (error) {
      throw new InternalServerErrorException('Google login failed');
    }
  }

  async githubLogin(user: any, res: Response) {
    if (!user || !user.email) {
      throw new BadRequestException('GitHub authentication failed');
    }

    try {
      let existingUser = await this.prismaService.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        const defaultRoleName = 'User';

        const role = await this.prismaService.role.findFirst({
          where: { name: { equals: defaultRoleName, mode: 'insensitive' } },
        });

        if (!role) {
          throw new ConflictException(
            `Default role '${defaultRoleName}' not found`,
          );
        }

        existingUser = await this.prismaService.user.create({
          data: {
            email: user.email,
            username: generateFromEmail(user.email, 5),
            fullName: user.name,
            password: '',
            roleId: role.id,
          },
        });

        // Assign a default payment plan (e.g., "Personal")
        const freePlan: Plan = await this.prismaService.plan.findFirst({
          where: { name: 'Personal' },
        });

        if (!freePlan) {
          throw new ConflictException('Free plan not found');
        }

        const subscriptionEndDate = new Date();
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

        await this.prismaService.subscription.create({
          data: {
            userId: existingUser.id,
            planId: freePlan.id,
            features: freePlan.features,
            startDate: new Date(),
            endDate: subscriptionEndDate,
            status: 'active',
          },
        });
      }

      const payload = { email: existingUser.email, sub: existingUser.id };
      const accessToken = this.jwtService.sign(payload);

      // Redirect to frontend with encrypted data
      const frontendUrl = process.env.FRONTEND_URL;
      const secretKeyHex = process.env.ENCRYPTION_SECRET;
      if (!secretKeyHex || secretKeyHex.length !== 64) {
        throw new InternalServerErrorException('Invalid ENCRYPTION_SECRET');
      }
      const secretKey = Buffer.from(secretKeyHex, 'hex');
      const userData = JSON.stringify({
        token: accessToken,
        userId: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
      });

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
      let encryptedData = cipher.update(userData, 'utf-8', 'base64');
      encryptedData += cipher.final('base64');
      const encryptedPayload = `${iv.toString('hex')}:${encryptedData}`;

      return res.redirect(
        `${frontendUrl}/app/github-callback?token=${encodeURIComponent(encryptedPayload)}`,
      );
    } catch (error) {
      throw new InternalServerErrorException('GitHub login failed');
    }
  }
}
