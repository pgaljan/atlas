import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InvitationStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../utils/mailer.util';

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper to generate a friendlier referral code.
  private generateReferralCode(inviterId: string): string {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return inviterId.slice(0, 4) + randomNumber;
  }

  private async checkInviteCredit(inviterId: string) {
    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    if (inviter.inviteCount <= 0) {
      throw new BadRequestException('Not enough invites left');
    }
  }

  async createInvitation(
    workspaceId: string,
    email: string,
    inviterId: string,
  ) {
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

      const existingInvitation = await this.prisma.invitation.findFirst({
        where: {
          inviteeEmail: email,
          workspaceId,
          status: InvitationStatus.pending,
        },
      });

      if (existingInvitation) {
        throw new ConflictException('User already has an active invitation');
      }

      await this.checkInviteCredit(inviterId);

      // Generate tokens and referral code.
      const invitationToken = randomUUID();
      const referralCode = this.generateReferralCode(inviterId);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      const invitation = await this.prisma.invitation.create({
        data: {
          inviterId,
          workspaceId,
          inviteeEmail: email,
          token: invitationToken,
          referralCode: referralCode,
          expiresAt: expirationDate,
          status: InvitationStatus.pending,
        },
      });

      await this.mailer.sendInvitationEmail(
        email,
        invitationToken,
        referralCode,
      );

      return {
        message: 'Invitation sent successfully',
        data: {
          id: invitation.id,
          expiresAt: invitation.expiresAt,
        },
      };
    } catch (error) {
      this.logger.error('Error creating invitation', error.stack);
      throw new InternalServerErrorException(
        error.message || 'Failed to create invitation',
      );
    }
  }

  async createInvitationLink(workspaceId: string, inviterId: string) {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      // Check if reusable link already exists
      let invitation = await this.prisma.invitation.findFirst({
        where: {
          workspaceId,
          inviterId,
          inviteeEmail: null,
          status: InvitationStatus.pending,
        },
      });

      if (!invitation) {
        await this.checkInviteCredit(inviterId);

        const invitationToken = randomUUID();
        const referralCode = this.generateReferralCode(inviterId);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 365);

        invitation = await this.prisma.invitation.create({
          data: {
            inviterId,
            workspaceId,
            inviteeEmail: null,
            token: invitationToken,
            referralCode,
            expiresAt: expirationDate,
            status: InvitationStatus.pending,
          },
        });
      }

      const invitationLink = `${process.env.FRONTEND_URL}/register?token=${invitation.token}&code=${invitation.referralCode}`;

      return {
        message: 'Reusable invitation link generated successfully',
        data: {
          invitationLink,
          expiresAt: invitation.expiresAt,
        },
      };
    } catch (error) {
      this.logger.error('Error creating invitation link', error.stack);
      throw new InternalServerErrorException(
        error.message || 'Failed to create invitation link',
      );
    }
  }

  async listInvitations(workspaceId: string) {
    try {
      return await this.prisma.invitation.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          inviteeEmail: true,
          status: true,
          createdAt: true,
          expiresAt: true,
          usedAt: true,
          token: true,
          user: { select: { id: true, email: true } },
        },
      });
    } catch (error) {
      this.logger.error('Error listing invitations', error.stack);
      throw new InternalServerErrorException(
        error.message || 'Failed to retrieve invitations',
      );
    }
  }

  /**
   * This method is called during registration when a new user provides a referral code.
   * It verifies the invitation by matching the invitee email and referral code.
   * If valid, it updates the invitation status, increments the inviter's commission/invite count,
   * and adds the new user to the workspace/team.
   */
  async applyReferralCodeWithTx(
    tx: Prisma.TransactionClient,
    userId: string,
    email: string,
    referralCode: string,
  ) {
    const invitation = await tx.invitation.findFirst({
      where: {
        inviteeEmail: email.toLowerCase().trim(),
        referralCode,
        status: InvitationStatus.pending,
      },
      include: { workspace: true },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid or expired referral code');
    }

    if (new Date() > invitation.expiresAt) {
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.expired },
      });
      throw new BadRequestException('Referral code has expired');
    }

    if (invitation.userId) {
      throw new BadRequestException('Referral code has already been used');
    }

    // Confirm that the referred user exists using the current transaction client.
    const confirmedUser = await tx.user.findUnique({ where: { id: userId } });
    if (!confirmedUser) {
      throw new InternalServerErrorException('Referred user not found');
    }

    await tx.user.update({
      where: { id: invitation.inviterId },
      data: {
        commissionEarned: { increment: 10 },
        inviteCount: { decrement: 1 },
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.accepted,
        usedAt: new Date(),
        userId: userId,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { referredBy: invitation.inviterId },
    });

    return { message: 'Referral applied successfully' };
  }

  // Existing method using token & referralCode – if needed.
  async verifyInvitation(token: string, referralCode: string) {
    try {
      const invitation = await this.prisma.invitation.findFirst({
        where: { token, status: InvitationStatus.pending, referralCode },
        include: { workspace: true },
      });

      if (!invitation) {
        throw new BadRequestException('Invalid or expired invitation');
      }

      if (new Date() > invitation.expiresAt) {
        await this.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.expired },
        });
        throw new BadRequestException('Invitation has expired');
      }

      const user = await this.prisma.user.findUnique({
        where: { email: invitation.inviteeEmail },
      });

      if (user) {
        await this.prisma.user.update({
          where: { id: invitation.inviterId },
          data: {
            commissionEarned: { increment: 10 },
            inviteCount: { decrement: 1 },
          },
        });
      }

      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.accepted,
          usedAt: new Date(),
          userId: user.id,
        },
      });

      return { message: 'Invitation verified successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to verify invitation',
      );
    }
  }

  async deleteInvitation(invitationId: string, workspaceId: string) {
    try {
      const invitation = await this.prisma.invitation.findFirst({
        where: {
          id: invitationId,
          workspaceId,
        },
      });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      await this.prisma.invitation.delete({
        where: { id: invitationId },
      });

      return { message: 'Invitation deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting invitation', error.stack);
      throw new InternalServerErrorException(
        error.message || 'Failed to delete invitation',
      );
    }
  }
}
