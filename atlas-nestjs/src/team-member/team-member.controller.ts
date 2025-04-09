import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberService } from './team-member.service';

@Controller('workspaces/:workspaceId/members')
@UseGuards(JwtAuthGuard)
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Post('invite')
  async inviteMember(
    @Param('workspaceId') workspaceId: string,
    @Body('email') email: string,
    @Body('role') role: string,
    @Request() req,
  ) {
    try {
      return await this.teamMemberService.inviteMember(
        workspaceId,
        email,
        req.user.id,
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message || 'Failed to invite member',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify')
  async verifyCode(
    @Body('code') code: string,
    @Body('password') password: string,
  ) {
    try {
      return await this.teamMemberService.verifyCode(code, password);
    } catch (error) {
      throw new HttpException(
        error.message || 'Invalid or expired code',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async listMembers(@Param('workspaceId') workspaceId: string) {
    try {
      return await this.teamMemberService.listMembers(workspaceId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to list members',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
