import {
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
  UploadedFile,
  UseInterceptors,
  Res,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CleansheetService } from './cleansheet.service';
import { CreateLearnerProfileDto } from './create-learner-profile.dto';
import { UpdateLearnerProfileDto } from './update-learner-profile.dto';

@Controller('cleansheet')
@UseGuards(JwtAuthGuard)
export class CleansheetController {
  constructor(private readonly service: CleansheetService) {}

  @Post('profile')
  async createOrUpdateProfile(
    @Req() req: any,
    @Body() dto: CreateLearnerProfileDto,
    @Query('userId') userId?: string,
  ) {
    return this.service.upsertProfile(req.user, dto, userId);
  }

  @Get('profile/:userId')
  async getProfile(@Req() req: any, @Param('userId') userId: string) {
    return this.service.getProfile(req.user, userId);
  }

  @Patch('profile/:userId')
  async updateProfile(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() dto: UpdateLearnerProfileDto,
  ) {
    return this.service.updateProfile(req.user, userId, dto);
  }

  @Delete('profile/:userId')
  async deleteProfile(@Req() req: any, @Param('userId') userId: string) {
    return this.service.deleteProfile(req.user, userId);
  }

  @Post('profile/import')
  @UseInterceptors(FileInterceptor('file'))
  async importProfile(
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: any,
    @Query('userId') userId?: string,
  ) {
    const json = file ? JSON.parse(file.buffer.toString('utf8')) : body;
    return this.service.importProfileFromJson(req.user, json, userId);
  }

  @Get('profile/:userId/export')
  async exportProfile(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('download') download?: string,
    @Res() res?: Response,
  ) {
    const json = await this.service.exportProfileAsJson(req.user, userId);

    if (download === 'true' && res) {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=cleansheet_profile_${userId}.json`,
      );
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(json, null, 2));
    }

    return json;
  }
}
