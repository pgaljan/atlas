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

  @Post('create')
  async createBackup(
    @Query('userId') userId: string,
    @Query('structureId') structureId?: string,
  ) {
    try {
      const parsedUserId = parseInt(userId, 10);
      const parsedStructureId = structureId
        ? parseInt(structureId, 10)
        : undefined;

      if (isNaN(parsedUserId)) {
        throw new HttpException(
          'Invalid userId provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (structureId && isNaN(parsedStructureId)) {
        throw new HttpException(
          'Invalid structureId provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.backupService.createBackup(
        parsedUserId,
        parsedStructureId,
      );
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

  @Get(':id')
  async getBackup(@Param('id') backupId: string) {
    try {
      const parsedBackupId = parseInt(backupId, 10);
      if (isNaN(parsedBackupId)) {
        throw new HttpException(
          'Invalid backupId provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.backupService.getBackup(parsedBackupId);
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

      return await this.backupService.deleteBackup(parsedBackupId);
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

      return await this.backupService.getAllBackups(parsedUserId);
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
