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
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as Papa from 'papaparse';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { FileUploadService } from './file-upload.service';

@Controller('file')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'public/',
        filename: (req, file, callback) => {
          const uniqueName = uuidv4() + extname(file.originalname);
          callback(null, uniqueName);
        },
      }),
    }),
  )
  async uploadFileAndParse(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Request() req: Request,
    @Body('structureId') structureId?: string,
  ) {
    // Check if file is uploaded
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

    if (
      !allowedParseTypes.includes(fileType) &&
      !imageAndVideoTypes.includes(fileType)
    ) {
      throw new BadRequestException('Unsupported file type.');
    }

    const fileUrl = `${this.configService.get('PROTOCOL', 'http')}://${
      (req.headers as any).host
    }/api/public/${file.filename}`;
    const filePath = join('public', file.filename);

    try {
      if (allowedParseTypes.includes(fileType)) {
        let parsedData: any[];

        if (fileType === 'text/csv') {
          parsedData = await this.parseCSV(filePath);
        } else if (fileType === 'application/json') {
          parsedData = this.parseJSON(filePath);
        } else {
          parsedData = this.parseExcel(filePath);
        }

        const structure =
          await this.fileUploadService.createStructureAndElements(
            userId,
            parsedData,
            structureId,
          );

        // Log audit
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
        await this.fileUploadService.createAttachment(userId, file, fileUrl);
        return {
          message: 'File uploaded successfully as an attachment.',
          fileUrl,
        };
      } else {
        await this.fileUploadService.createAttachment(userId, file, fileUrl);
        return {
          message: 'File uploaded successfully as an attachment.',
          fileUrl,
        };
      }
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      throw error;
    }
  }

  private async parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: (error: any) => reject(error),
      });
    });
  }

  private parseExcel(filePath: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }
  private parseJSON(filePath: string): any[] {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
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
}
