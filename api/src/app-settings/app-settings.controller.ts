import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { CreateUpdateAppSettingsDto } from './dto/create-update-app-settings.dto';
import { SendTestEmailDto } from './dto/send-test-email.dto';

@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Post('save')
  async saveSettings(@Body() dto: CreateUpdateAppSettingsDto) {
    const settings = await this.appSettingsService.createOrUpdateSettings(dto);
    return { message: 'App settings saved successfully', settings };
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

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    try {
      return await this.appSettingsService.sendTestEmail(dto.email);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message:
            (error && error.message) ||
            'An unexpected error occurred while sending the test email',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
