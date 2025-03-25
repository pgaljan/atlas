import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async inviteMember(
    teamId: string,
    email: string,
    role: string,
    ownerId: string,
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }
    if (team.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this team');
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          fullName: '',
          username: email.split('@')[0],
          password: '',
          role: {
            connect: { id: role },
          },
        },
      });
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
        teamId,
        userId: user.id,
        workspaceId: team.workspaceId,
        role,
      },
    });

    return { message: 'Invitation sent', verificationCode };
  }

  async verifyCode(code: string, password: string) {
    const token = await this.prisma.token.findFirst({
      where: { value: code },
      include: { user: true },
    });

    if (!token) {
      throw new BadRequestException('Invalid or expired code');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await this.prisma.user.update({
      where: { id: token.userId },
      data: { password: hashedPassword },
    });

    // Delete the verification token
    await this.prisma.token.delete({ where: { id: token.id } });

    return { message: 'Account activated, you can now log in' };
  }

  async listMembers(teamId: string) {
    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: { user: true },
    });
  }
}
