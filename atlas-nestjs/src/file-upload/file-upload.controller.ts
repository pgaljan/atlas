import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Attachment } from '@prisma/client';
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
  ) {
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      throw new BadRequestException('Invalid userId. It must be a number.');
    }

    const fileType = file.mimetype;
    const allowedParseTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    const allowedImageTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/bmp',
    ];

    const protocol = process.env.PROTOCOL || 'http';
    const host =
      this.configService.get('APP_HOST') || (req.headers as any).host;
    const fileUrl = `${protocol}://${host}/public/${file.filename}`;
    const filePath = join('public', file.filename);

    try {
      if (allowedParseTypes.includes(fileType)) {
        let parsedData: any[];

        if (fileType === 'text/csv') {
          parsedData = await this.parseCSV(filePath);
        } else {
          parsedData = this.parseExcel(filePath);
        }

        const insertedRecords = await this.saveParsedDataToDB(parsedData);

        // Log audit for file upload
        await this.fileUploadService.logAudit(
          'CREATE',
          'File',
          file.filename,
          { type: fileType, recordsCount: insertedRecords.length },
          userIdInt,
        );

        return {
          message:
            'File uploaded, parsed, and data saved to ParsedContent successfully',
          parsedFileUrl: fileUrl,
          insertedRecordsCount: insertedRecords.length,
        };
      } else if (allowedImageTypes.includes(fileType)) {
        await this.fileUploadService.createAttachment(userIdInt, file, fileUrl);

        // Log audit for image upload
        await this.fileUploadService.logAudit(
          'CREATE',
          'Attachment',
          file.filename,
          { type: fileType },
          userIdInt,
        );

        return {
          message: 'Image uploaded successfully',
          fileUrl: fileUrl,
        };
      } else {
        throw new BadRequestException(
          'Unsupported file type. Only CSV, Excel, or image files (PNG, JPEG, etc.) are allowed.',
        );
      }
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('File processing failed.');
    }
  }

  private async parseCSV(filePath: string): Promise<any[]> {
    try {
      return new Promise((resolve, reject) => {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => resolve(result.data),
          error: (error: any) => reject(error),
        });
      });
    } catch (error) {
      throw new BadRequestException('Failed to parse CSV file.');
    }
  }

  private parseExcel(filePath: string): any[] {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(sheet);
    } catch (error) {
      throw new BadRequestException('Failed to parse Excel file.');
    }
  }

  private async saveParsedDataToDB(parsedData: any[]): Promise<any[]> {
    try {
      const createdRecords = [];

      for (const row of parsedData) {
        const {
          type,
          wbs,
          level,
          element,
          uniqWBS,
          markmapMM,
          additionalData,
        } = row;

        const record = await this.fileUploadService.saveParsedContent({
          type: type || 'unknown',
          wbs: wbs || '',
          level: level ? parseInt(level) : 0,
          element: element || '',
          uniqWBS: uniqWBS || '',
          markmapMM: markmapMM || '',
          additionalData: additionalData ? JSON.parse(additionalData) : {},
        });

        createdRecords.push(record);
      }

      return createdRecords;
    } catch (error) {
      throw new InternalServerErrorException('Failed to save parsed data.');
    }
  }

  @Get(':id')
  async getFile(@Param('id') id: number): Promise<Attachment> {
    try {
      return await this.fileUploadService.findOne(id);
    } catch (error) {
      console.error('Error fetching file:', error.message);
      throw error;
    }
  }

  @Get()
  async getAllFiles(): Promise<Attachment[]> {
    try {
      return await this.fileUploadService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve files.');
    }
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: number): Promise<void> {
    try {
      const file = await this.fileUploadService.findOne(id);

      // Log audit for file deletion
      await this.fileUploadService.logAudit('DELETE', 'Attachment', id, {
        fileName: file.fileUrl,
      });

      await this.fileUploadService.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
