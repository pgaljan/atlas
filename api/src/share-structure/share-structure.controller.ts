import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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

  @Post('accept-invitation/:id')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@Param('id') id: string, @Req() req: any) {
    const currentUserId = req.user?.id;
    if (!currentUserId)
      throw new BadRequestException('Authenticated user required');
    return this.sharesService.acceptInvitationById(id, currentUserId);
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

  @Get('shared-structures')
  @UseGuards(JwtAuthGuard)
  async getSharedStructures(@Req() req: any) {
    const currentUserId = req.user?.id;

    return this.sharesService.getSharedStructures(currentUserId);
  }

  @Delete('collaborator/:structureId/:userId')
  @UseGuards(JwtAuthGuard)
  async removeCollaboratorByUser(
    @Param('structureId') structureId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    return this.sharesService.removeCollaboratorByUser(
      structureId,
      userId,
      currentUserId,
    );
  }
}
