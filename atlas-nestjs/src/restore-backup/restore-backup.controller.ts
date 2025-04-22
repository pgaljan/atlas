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
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

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
    // Ensure file has a .zip extension
    if (!file.originalname.endsWith('.zip')) {
      throw new HttpException(
        'Invalid file type. Expected a .zip file.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.restoreService.restoreBackup(
        file.buffer,
        structureId,
        userId,
      );
    } catch (error) {
      console.error(error);
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
    if (!file.originalname.endsWith('.zip')) {
      throw new HttpException(
        'Invalid file type. Expected a .zip file.',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.restoreService.restoreFullBackup(file.buffer, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to restore full backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('full-from-url')
  async restoreFullBackupFromUrl(
    @Body('url') url: string,
    @Body('userId') userId: string,
    @Body('workspaceId') workspaceId: string,
  ) {
    // 1) Validate inputs
    if (!url || typeof url !== 'string') {
      throw new HttpException('No URL provided', HttpStatus.BAD_REQUEST);
    }
    if (!url.toLowerCase().endsWith('.zip')) {
      throw new HttpException(
        'Invalid file URL. Expected a .zip file.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!userId || typeof userId !== 'string') {
      throw new HttpException('Invalid userId', HttpStatus.BAD_REQUEST);
    }

    try {
      // 2) Fetch ZIP over HTTP
      const response = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
      });
      const buffer = Buffer.from(response.data);

      const { structureId } = await this.restoreService.createNewStructure(
        userId,
        workspaceId,
      );

      // 3) Call your existing service
      const result = await this.restoreService.restoreBackupfromURL(
        buffer,
        structureId,
        userId,
      );
      return { result };
    } catch (err: any) {
      throw new HttpException(
        `Failed to restore from URL: ${err.message}`,
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
