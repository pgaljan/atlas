import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { CreateUpdateAppSettingsDto } from './dto/create-update-app-settings.dto';

@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Post('save')
  async saveSettings(@Body() dto: CreateUpdateAppSettingsDto) {
    try {
      const settings =
        await this.appSettingsService.createOrUpdateSettings(dto);
      return { message: 'App settings saved successfully', settings };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getSettings() {
    try {
      const settings = await this.appSettingsService.getSettings();
      return { message: 'App settings retrieved successfully', settings };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('remove/:id')
  async removeSettings(@Param('id') id: string) {
    try {
      return await this.appSettingsService.removeSettings(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
