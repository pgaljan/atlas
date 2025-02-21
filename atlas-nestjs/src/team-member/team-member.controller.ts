import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberService } from './team-member.service';

@Controller('teams/:teamId/members')
@UseGuards(JwtAuthGuard)
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Post('invite')
  async inviteMember(
    @Param('teamId') teamId: string,
    @Body('email') email: string,
    @Body('role') role: string,
    @Request() req,
  ) {
    return this.teamMemberService.inviteMember(
      teamId,
      email,
      role,
      req.user.id,
    );
  }

  @Post('verify')
  async verifyCode(
    @Body('code') code: string,
    @Body('password') password: string,
  ) {
    return this.teamMemberService.verifyCode(code, password);
  }

  @Get()
  async listMembers(@Param('teamId') teamId: string) {
    return this.teamMemberService.listMembers(teamId);
  }
}
