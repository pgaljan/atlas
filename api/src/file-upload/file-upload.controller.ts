import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as Papa from 'papaparse';
import { extname } from 'path';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadService } from './file-upload.service';
import { StructurePermissionGuard } from 'src/auth/guards/structure-permission.guard';

@Controller('file')
@UseGuards(StructurePermissionGuard)
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly configService: ConfigService,
  ) {}

  private async parseCSVBuffer(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const fileContent = buffer.toString('utf8');
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: (error: any) => reject(error),
      });
    });
  }

  private parseExcelBuffer(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }

  private parseJSONBuffer(buffer: Buffer): any[] {
    const fileContent = buffer.toString('utf8');
    return JSON.parse(fileContent);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        cb(null, true);
      },
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  async uploadFileAndParse(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Request() req: Request,
    @Body('structureId') structureId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    if (!userId) {
      throw new BadRequestException('UserId is required.');
    }

    const fileType = file.mimetype;
    const allowedParseTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/json',
    ];
    const imageAndVideoTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mpeg',
    ];

    try {
      if (allowedParseTypes.includes(fileType)) {
        let parsedData: any[];

        if (fileType === 'text/csv') {
          parsedData = await this.parseCSVBuffer((file as any).buffer);
        } else if (fileType === 'application/json') {
          parsedData = this.parseJSONBuffer((file as any).buffer);
        } else {
          parsedData = this.parseExcelBuffer((file as any).buffer);
        }

        const structure =
          await this.fileUploadService.createStructureAndElements(
            userId,
            parsedData,
            structureId,
          );

        await this.fileUploadService.logAudit(
          'CREATE',
          'Structure',
          structure.id,
          { fileType, recordCount: structure.elements.length },
          userId,
        );

        return {
          message: 'File parsed and structure created/updated successfully.',
          structureId: structure.id,
        };
      } else if (imageAndVideoTypes.includes(fileType)) {
        const attachment = await this.fileUploadService.createAttachment(
          userId,
          file,
        );
        return {
          message: 'File uploaded successfully as an attachment.',
          fileUrl: attachment.fileUrl,
          attachment,
        };
      } else {
        const attachment = await this.fileUploadService.createAttachment(
          userId,
          file,
        );
        return {
          message: 'File uploaded successfully as an attachment.',
          fileUrl: attachment.fileUrl,
          attachment,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  @Post('upload-raw')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  async uploadRaw(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Request() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    if (!userId) {
      throw new BadRequestException('UserId is required.');
    }

    try {
      const record = await this.fileUploadService.saveRawFile(userId, file);
      return {
        message: 'File uploaded successfully.',
        fileUrl: record.fileUrl,
        record,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('user/:userId')
  async getMediaByUserId(@Param('userId') userId: string) {
    return await this.fileUploadService.getMediaByUserId(userId);
  }

  @Patch(':id')
  async updateMedia(
    @Param('id') id: string,
    @Body('newFileUrl') newFileUrl: string,
  ) {
    if (!newFileUrl) {
      throw new BadRequestException('New file URL is required.');
    }
    return await this.fileUploadService.updateMedia(id, newFileUrl);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string) {
    return await this.fileUploadService.deleteMedia(id);
  }

  @Post('upload-anonymous')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  async uploadAnonymous(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    try {
      const record = await this.fileUploadService.uploadAnonymousFile(file);
      return {
        message: 'Anonymous file uploaded successfully.',
        fileUrl: record.fileUrl,
        record,
      };
    } catch (error) {
      throw error;
    }
  }
}
