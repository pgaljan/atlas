import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUpdateAppSettingsDto } from './dto/create-update-app-settings.dto';

@Injectable()
export class AppSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateSettings(data: CreateUpdateAppSettingsDto) {
    try {
      const existing = await this.prisma.appSettings.findFirst();

      const updateData = {
        appName: data.appName || '',
        primaryColor: data.primaryColor || '',
        secondaryColor: data.secondaryColor || '',
        supportEmail: data.supportEmail || '',
        feedbackLink: data.feedbackLink || '',
        logoUrl: data.logoUrl || '',
        inviteCodeOption: data.inviteCodeOption || 'disabled',
        authProviders: data.authProviders || {
          local: true,
          google: true,
          github: true,
        },
      };

      if (existing) {
        return await this.prisma.appSettings.update({
          where: { id: existing.id },
          data: updateData,
        });
      }

      return await this.prisma.appSettings.create({
        data: updateData,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to save app settings: ${error.message}`,
      );
    }
  }

  async getSettings() {
    try {
      const settings = await this.prisma.appSettings.findFirst();
      if (!settings) throw new NotFoundException('No app settings found');
      return settings;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve app settings: ${error.message}`,
      );
    }
  }

  async removeSettings(id: string) {
    try {
      const settings = await this.prisma.appSettings.findUnique({
        where: { id },
      });
      if (!settings) throw new NotFoundException('Settings not found');
      await this.prisma.appSettings.delete({ where: { id } });
      return { message: 'App settings deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete settings: ${error.message}`,
      );
    }
  }
}
