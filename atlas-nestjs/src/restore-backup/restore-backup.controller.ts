import {
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
  async restoreBackup(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      // Check if the file has the `.zip` extension
      if (!file.originalname.endsWith('.zip')) {
        throw new HttpException(
          'Invalid file type. Expected .zip file.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Restore the backup using the RestoreService
      return await this.restoreService.restoreBackup(file.buffer);
    } catch (error) {
      throw new HttpException(
        `Failed to restore backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('full')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async restoreFullBackup(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      // Check if the file has the .zip extension
      if (!file.originalname.endsWith('.zip')) {
        throw new HttpException(
          'Invalid file type. Expected .zip file.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.restoreService.restoreFullBackup(file.buffer);
    } catch (error) {
      throw new HttpException(
        `Failed to restore backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
