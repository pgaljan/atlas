import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../utils/mailer.util';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class TeamMemberService {
  private mailer: MailerService;

  constructor(private readonly prisma: PrismaService) {
    this.mailer = new MailerService();
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  }

  async inviteMember(workspaceId: string, email: string, ownerId: string) {
    try {
      if (!this.validateEmail(email)) {
        throw new BadRequestException('Invalid email format');
      }

      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const team = await this.prisma.team.findFirst({
        where: {
          workspaceId,
          ownerId,
        },
      });

      if (!team) {
        throw new ForbiddenException('You do not own a team in this workspace');
      }

      const defaultRoleName = 'User';

      const role = await this.prisma.role.findFirst({
        where: {
          name: {
            equals: defaultRoleName,
            mode: 'insensitive',
          },
        },
      });

      if (!role) {
        throw new ConflictException('Role not found');
      }

      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            fullName: '',
            username: email.split('@')[0],
            password: '',
            role: { connect: { id: role.id } },
          },
        });
      }

      const existingTeamMember = await this.prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: user.id,
          },
        },
      });

      if (existingTeamMember) {
        throw new BadRequestException('User is already a member of this team');
      }

      const verificationCode = randomUUID();

      await this.prisma.token.create({
        data: {
          userId: user.id,
          key: 'verification_code',
          value: verificationCode,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

      await this.prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
          workspaceId,
          role: role.id,
        },
      });

      await this.mailer.sendInvitationEmail(
        email,
        verificationCode,
        workspaceId,
      );

      return { message: 'Invitation sent' };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to invite member',
      );
    }
  }

  async verifyCode(code: string, password: string) {
    try {
      const token = await this.prisma.token.findFirst({
        where: { value: code },
        include: { user: true },
      });

      if (!token) {
        throw new BadRequestException('Invalid or expired code');
      }

      if (new Date() > token.expiresAt) {
        await this.prisma.token.delete({ where: { id: token.id } });
        throw new BadRequestException('Verification code has expired');
      }

      if (!password || password.trim().length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.user.update({
        where: { id: token.userId },
        data: { password: hashedPassword },
      });

      await this.prisma.token.delete({ where: { id: token.id } });

      return { message: 'Account activated, you can now log in' };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to verify code',
      );
    }
  }

  async listMembers(workspaceId: string) {
    try {
      const members = await this.prisma.teamMember.findMany({
        where: { workspaceId },
        include: {
          user: true,
        },
      });

      if (!members || members.length === 0) {
        throw new NotFoundException('No members found for this workspace');
      }

      // Map over the members and include the role as a string from the WorkspaceRole enum
      const membersWithRoles = members.map((member) => ({
        ...member,
        role: WorkspaceRole[member.role as keyof typeof WorkspaceRole],
      }));

      return membersWithRoles;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to list members',
      );
    }
  }
}
