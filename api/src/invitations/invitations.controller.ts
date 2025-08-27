import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvitationService } from './invitations.service';

@Controller('workspaces/:workspaceId/invitations')
@UseGuards(JwtAuthGuard)
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  async createInvitation(
    @Param('workspaceId') workspaceId: string,
    @Body('email') email: string,
    @Body('userId') userId: string,
  ) {
    try {
      return await this.invitationService.createInvitation(
        workspaceId,
        email,
        userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send invitation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('link')
  async createInvitationLink(
    @Param('workspaceId') workspaceId: string,
    @Body('userId') userId: string,
  ) {
    try {
      return await this.invitationService.createInvitationLink(
        workspaceId,
        userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create invitation link',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async listInvitations(@Param('workspaceId') workspaceId: string) {
    try {
      return await this.invitationService.listInvitations(workspaceId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to list invitations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify')
  async verifyInvitation(
    @Body('token') token: string,
    @Body('referralCode') referralCode: string,
  ) {
    try {
      return await this.invitationService.verifyInvitation(token, referralCode);
    } catch (error) {
      throw new HttpException(
        error.message || 'Invalid or expired token',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':invitationId')
  async deleteInvitation(
    @Param('workspaceId') workspaceId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.invitationService.deleteInvitation(invitationId, workspaceId);
  }
}
