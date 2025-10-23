import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Plan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Response } from 'express';
import { generateFromEmail } from 'unique-username-generator';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InvitationService } from 'src/invitations/invitations.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private configService: ConfigService,
    private invitationService: InvitationService,
  ) {}
  private readonly TOKEN_KEYS = {
    ADMIN: 'admin_access_token',
    USER: 'user_access_token',
  };

  private getTokenKey(user: { isAdmin: boolean }): string {
    return user.isAdmin ? this.TOKEN_KEYS.ADMIN : this.TOKEN_KEYS.USER;
  }

  private sanitizeBaseUsername(input: string) {
    if (!input) return '';
    let base = input
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '_')
      .replace(/^[._-]+|[._-]+$/g, '');
    if (!base) base = `user${Math.floor(1000 + Math.random() * 9000)}`;
    return base;
  }

  private async ensureUniqueUsername(prisma, base: string) {
    let candidate = base;
    let counter = 0;
    while (counter < 100) {
      const existing = await prisma.user.findUnique({
        where: { username: candidate },
      });
      if (!existing) return candidate;
      counter += 1;
      candidate = `${base}${counter}`;
    }
    return `${base}${Date.now().toString().slice(-4)}`;
  }

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

  async register(registerDto: RegisterDto) {
    const {
      username: requestedUsername,
      displayName,
      email,
      password,
      referralCode,
    } = registerDto;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const existingUserByEmail = await prisma.user.findUnique({
          where: { email },
        });
        if (existingUserByEmail) {
          throw new ConflictException('User with this email already exists');
        }

        let finalUsername = '';
        if (requestedUsername && requestedUsername.trim()) {
          const candidate = this.sanitizeBaseUsername(requestedUsername.trim());
          const existingByUsername = await prisma.user.findUnique({
            where: { username: candidate },
          });
          if (existingByUsername) {
            throw new ConflictException('Username already exists');
          }
          finalUsername = candidate;
        } else if (displayName && displayName.trim()) {
          let baseFromDisplay = displayName.trim();
          if (baseFromDisplay.includes(' ')) {
            const parts = baseFromDisplay.split(/\s+/);
            const baseUsername = parts
              .map((word, index) =>
                index === parts.length - 1
                  ? word.toLowerCase()
                  : word.toLowerCase(),
              )
              .join('_');
            baseFromDisplay = baseUsername;
          }
          const sanitized = this.sanitizeBaseUsername(baseFromDisplay);
          finalUsername = await this.ensureUniqueUsername(prisma, sanitized);
        } else {
          const fromEmail = generateFromEmail(email, 5);
          const sanitized = this.sanitizeBaseUsername(fromEmail);
          finalUsername = await this.ensureUniqueUsername(prisma, sanitized);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultRoleName = 'User';
        const role = await prisma.role.findFirst({
          where: { name: { equals: defaultRoleName, mode: 'insensitive' } },
        });
        if (!role) {
          throw new ConflictException('Role not found');
        }

        const newWorkspace = await prisma.workspace.create({
          data: { name: `${finalUsername}'s Workspace` },
        });

        const newUser = await prisma.user.create({
          data: {
            username: finalUsername,
            displayName,
            email,
            password: hashedPassword,
            roleId: role.id,
            defaultWorkspaceId: newWorkspace.id,
          },
        });

        await prisma.team.create({
          data: {
            name: `${finalUsername}'s Team`,
            ownerId: newUser.id,
            workspaceId: newWorkspace.id,
          },
        });

        const freePlan = await prisma.plan.findFirst({
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
          username: finalUsername,
          email,
        });

        if (referralCode) {
          await this.invitationService.applyReferralCodeWithTx(
            prisma,
            newUser.id,
            email,
            referralCode,
          );
        }

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

  async validateToken(token: string) {
    if (!token) throw new BadRequestException('Token is required');

    try {
      const payload = await this.jwtService.verifyAsync(token).catch((err) => {
        if (
          err?.name === 'TokenExpiredError' ||
          /expired/i.test(err?.message)
        ) {
          throw new UnauthorizedException('Token expired');
        }
        throw new UnauthorizedException('Invalid token');
      });

      const userId = (payload as any).sub;
      if (!userId) throw new UnauthorizedException('Invalid token payload');

      const user = await this.prismaService.user.findUnique({
        where: { id: String(userId) },
        include: { role: true },
      });

      if (!user) throw new NotFoundException('User not found');
      if (user.deletedAt) {
        throw new ConflictException('This account has been deactivated');
      }

      const tokenKey = this.getTokenKey(user);
      const tokenRecord = await this.prismaService.token.findFirst({
        where: { value: token, key: tokenKey },
      });

      if (!tokenRecord)
        throw new UnauthorizedException('Token not found or revoked');

      if (
        tokenRecord.expiresAt &&
        new Date(tokenRecord.expiresAt) <= new Date()
      ) {
        throw new UnauthorizedException('Token expired');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          workspaceId: user.defaultWorkspaceId,
          role: user.role,
          isAdmin: user.isAdmin,
        },
        expiresAt: tokenRecord.expiresAt,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while validating token',
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

  // Login method (unchanged)
  async login(user: any) {
    try {
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      const tokenKey = this.getTokenKey(user);
      const existingToken = await this.prismaService.token.findUnique({
        where: {
          userId_key: {
            userId: user.id,
            key: tokenKey,
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
            key: tokenKey,
            value: accessToken,
            expiresAt,
          },
        });
      }

      await this.logAudit(
        'User Login',
        'User',
        user.id,
        { email: user.email },
        user.id,
      );

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
          displayName: user.displayName,
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
      const tokenKey = this.getTokenKey(user);
      const existingToken = await this.prismaService.token.findUnique({
        where: {
          userId_key: {
            userId: user.id,
            key: tokenKey,
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
          key: tokenKey,
          value: newAccessToken,
          expiresAt,
        },
      });

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

  async logout(user: any) {
    const tokenKey = this.getTokenKey(user);
    try {
      const existingToken = await this.prismaService.token.findUnique({
        where: {
          userId_key: {
            userId: user.id,
            key: tokenKey,
          },
        },
      });

      if (existingToken) {
        await this.prismaService.token.update({
          where: { id: existingToken.id },
          data: { expiresAt: new Date() },
        });
      }

      await this.logAudit(
        'User Logout',
        'User',
        user.id,
        { email: user.email },
        user.id,
      );
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
      const profileName = user.name || user.displayName || '';
      let base = profileName
        ? this.sanitizeBaseUsername(profileName)
        : this.sanitizeBaseUsername(generateFromEmail(user.email, 5));
      const uniqueUsername = await this.ensureUniqueUsername(
        this.prismaService,
        base,
      );

      existingUser = await this.prismaService.user.create({
        data: {
          email: user.email,
          username: uniqueUsername,
          displayName: profileName || '',
          password: '',
          roleId: '',
        },
      });

      await this.logAudit('OAuth Signup', 'User', existingUser.id, {
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

        const displayName = user.name || user.displayName || 'User';

        const baseUsername = this.sanitizeBaseUsername(
          displayName || generateFromEmail(user.email, 5),
        );
        const uniqueUsername = await this.ensureUniqueUsername(
          this.prismaService,
          baseUsername,
        );

        if (!role) {
          throw new ConflictException(
            `Default role '${defaultRoleName}' not found`,
          );
        }

        const newWorkspace = await this.prismaService.workspace.create({
          data: {
            name: `${uniqueUsername}'s Workspace`,
          },
        });

        existingUser = await this.prismaService.user.create({
          data: {
            email: user.email,
            username: uniqueUsername,
            displayName: displayName,
            password: '',
            roleId: role.id,
            defaultWorkspaceId: newWorkspace.id,
          },
        });

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

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      if (!frontendUrl) {
        throw new InternalServerErrorException(
          'Frontend URL is not set in environment variables',
        );
      }

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
        workspaceId: existingUser.defaultWorkspaceId,
      });

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

      let encryptedData = cipher.update(userData, 'utf-8', 'base64');
      encryptedData += cipher.final('base64');

      const encryptedPayload = `${iv.toString('hex')}:${encryptedData}`;

      return res.redirect(
        `${frontendUrl}/app/google-callback?token=${encodeURIComponent(encryptedPayload)}`,
      );
    } catch (error) {
      console.log(error);
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

        const profileName = user.name || user.displayName || 'User';
        const baseUsername = this.sanitizeBaseUsername(
          profileName || generateFromEmail(user.email, 5),
        );
        const uniqueUsername = await this.ensureUniqueUsername(
          this.prismaService,
          baseUsername,
        );

        const newWorkspace = await this.prismaService.workspace.create({
          data: {
            name: `${uniqueUsername}'s Workspace`,
          },
        });

        existingUser = await this.prismaService.user.create({
          data: {
            email: user.email,
            username: uniqueUsername,
            displayName: profileName,
            password: '',
            roleId: role.id,
            defaultWorkspaceId: newWorkspace.id,
          },
        });

        const freePlan = await this.prismaService.plan.findFirst({
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
        workspaceId: existingUser.defaultWorkspaceId,
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
