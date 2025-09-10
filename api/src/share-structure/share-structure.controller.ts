import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateShareLinkDto } from './dto/create-share-link-structure.dto';
import { CreateShareDto } from './dto/create-share-structure.dto';
import { InviteShareDto } from './dto/invite-share-structure.dto';
import { UpdateShareDto } from './dto/update-share-structure.dto';
import { StructureSharesService } from './share-structure.service';

@Controller('structure-shares')
export class StructureSharesController {
  constructor(private readonly sharesService: StructureSharesService) {}

  @Get('structure/:structureId')
  @UseGuards(JwtAuthGuard)
  async listForStructure(
    @Param('structureId') structureId: string,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    return this.sharesService.listShares(structureId, currentUserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createShare(@Body() dto: CreateShareDto, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.sharesService.createOrUpdateShare(dto, currentUserId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateShare(
    @Param('id') id: string,
    @Body() dto: UpdateShareDto,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    return this.sharesService.updateShare(id, dto, currentUserId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeShare(@Param('id') id: string, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.sharesService.removeShare(id, currentUserId);
  }

  @Post('transfer-owner')
  @UseGuards(JwtAuthGuard)
  async transferOwner(
    @Body() body: { structureId: string; newOwnerUserId: string },
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    return this.sharesService.transferOwnership(
      body.structureId,
      body.newOwnerUserId,
      currentUserId,
    );
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  async invite(@Body() dto: InviteShareDto, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.sharesService.createInvitation(dto, currentUserId);
  }

  @Post('accept-invitation/:token')
  async acceptInvitation(
    @Param('token') token: string,
    @Query('email') email: string,
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.sharesService.acceptInvitation(token, email);
  }

  @Post('links')
  @UseGuards(JwtAuthGuard)
  async createShareLink(@Body() dto: CreateShareLinkDto, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.sharesService.createShareLink(dto, currentUserId);
  }

  @Get('links/validate/:token')
  async validateLink(@Param('token') token: string) {
    return this.sharesService.validateShareLink(token);
  }

  @Patch('links/revoke/:id')
  @UseGuards(JwtAuthGuard)
  async revokeLink(@Param('id') id: string, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.sharesService.revokeShareLink(id, currentUserId);
  }

  @Get('pending/:structureId')
  @UseGuards(JwtAuthGuard)
  async listPendingInvitations(
    @Param('structureId') structureId: string,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    return this.sharesService.getPendingInvitations(structureId, currentUserId);
  }

  @Get('collaborators/:structureId')
  @UseGuards(JwtAuthGuard)
  async listCollaborators(
    @Param('structureId') structureId: string,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    return this.sharesService.getCollaborators(structureId, currentUserId);
  }

  @Get('links/:structureId')
  @UseGuards(JwtAuthGuard)
  async listShareableLinks(
    @Param('structureId') structureId: string,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    return this.sharesService.getShareableLinks(structureId, currentUserId);
  }
  @Delete('invitation/:id')
  @UseGuards(JwtAuthGuard)
  async removeInvitation(@Param('id') id: string, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.sharesService.removeInvitation(id, currentUserId);
  }
  @Get('my-structures')
  @UseGuards(JwtAuthGuard)
  async listMyStructures(@Req() req: any) {
    return this.sharesService.listAccessibleStructures(req.user.id);
  }
}
