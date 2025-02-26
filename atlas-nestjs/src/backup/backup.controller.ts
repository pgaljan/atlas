import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  private handleException(error: any, defaultMessage: string) {
    if (error instanceof HttpException) {
      throw error;
    }
    console.error('Unexpected error:', error);
    throw new HttpException(
      error.message || defaultMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post('create')
  async createBackup(
    @Query('userId') userId: string,
    @Query('structureId') structureId?: string,
  ) {
    try {
      if (!userId || !this.isValidUUID(userId)) {
        throw new HttpException(
          'Invalid or missing userId provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (structureId && !this.isValidUUID(structureId)) {
        throw new HttpException(
          'Invalid structureId provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.backupService.createBackup(userId, structureId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Unexpected error during backup creation:', error);
      throw new HttpException(
        error.message || 'Failed to create backup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  @Get('user/:userId')
  async getBackupByUserId(@Param('userId') userId: string) {
    return await this.backupService.getBackupByUserId(userId);
  }

  @Get(':id')
  async getBackup(@Param('id') backupId: string) {
    try {
      const parsedBackupId = parseInt(backupId, 10);

      return await this.backupService.getBackup(parsedBackupId.toString());
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Unexpected error during fetching backup:', error);
      throw new HttpException(
        error.message || 'Failed to retrieve the backup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete/:id')
  async deleteBackup(@Param('id') backupId: string) {
    try {
      const parsedBackupId = parseInt(backupId, 10);
      if (isNaN(parsedBackupId)) {
        throw new HttpException(
          'Invalid backupId provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.backupService.deleteBackup(parsedBackupId.toString());
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Unexpected error during backup deletion:', error);
      throw new HttpException(
        error.message || 'Failed to delete the backup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId/full-backup')
  async createFullUserBackup(@Param('userId') userId: string) {
    try {
      if (!this.isValidUUID(userId)) {
        throw new HttpException(
          'Invalid userId provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.backupService.createFullUserBackup(userId);
    } catch (error) {
      this.handleException(error, 'Failed to create full user backup');
    }
  }

  @Get()
  async getAllBackups(@Query('userId') userId?: string) {
    try {
      const parsedUserId = userId ? parseInt(userId, 10) : undefined;

      if (userId && isNaN(parsedUserId)) {
        throw new HttpException(
          'Invalid userId provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.backupService.getAllBackups(parsedUserId?.toString());
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Unexpected error during fetching backups:', error);
      throw new HttpException(
        error.message || 'Failed to retrieve the backups',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
