import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { RestoreService } from './restore-backup.service';

@Controller('restore')
export class RestoreController {
  constructor(private readonly restoreService: RestoreService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async restoreBackup(
    @UploadedFile() file: Express.Multer.File,
    @Body('structureId') structureId: string,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    if (
      !structureId ||
      typeof structureId !== 'string' ||
      structureId.trim() === ''
    ) {
      throw new HttpException('Invalid structureId', HttpStatus.BAD_REQUEST);
    }
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new HttpException('Invalid userId', HttpStatus.BAD_REQUEST);
    }

    try {
      // Check file extension
      if (!file.originalname.endsWith('.zip')) {
        throw new HttpException(
          'Invalid file type. Expected .zip file.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.restoreService.restoreBackup(
        file.buffer,
        structureId,
        userId,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to restore backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Updated full backup endpoint to accept userId as well.
  @Post('full')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async restoreFullBackup(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new HttpException('Invalid userId', HttpStatus.BAD_REQUEST);
    }

    try {
      if (!file.originalname.endsWith('.zip')) {
        throw new HttpException(
          'Invalid file type. Expected .zip file.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.restoreService.restoreFullBackup(file.buffer, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to restore backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
