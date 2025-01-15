import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Attachment } from '@prisma/client';
import fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileUploadService {
  constructor(private readonly prisma: PrismaService) {}

  async createAttachment(
    userId: string,
    file: Express.Multer.File,
    fileUrl: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this.prisma.attachment.create({
        data: {
          userId,
          fileUrl,
          fileType: file.mimetype,
          data: {},
        },
      });
    } catch (error) {
      console.error('Error creating attachment:', error.message);
      throw new InternalServerErrorException('Failed to create attachment.');
    }
  }

  async saveParsedContent(parsedContent: any) {
    try {
      return await this.prisma.parsedContent.create({ data: parsedContent });
    } catch (error) {
      console.error('Error saving parsed content:', error.message);
      throw new InternalServerErrorException('Failed to save parsed content.');
    }
  }

  async findOne(id: string): Promise<Attachment> {
    try {
      const attachment = await this.prisma.attachment.findUnique({
        where: { id },
      });

      if (!attachment) {
        throw new NotFoundException('File not found');
      }

      return attachment;
    } catch (error) {
      console.error('Error finding file:', error.message);
      throw new InternalServerErrorException('Failed to retrieve file.');
    }
  }

  async findAll(): Promise<Attachment[]> {
    try {
      return await this.prisma.attachment.findMany();
    } catch (error) {
      console.error('Error fetching all files:', error.message);
      throw new InternalServerErrorException('Failed to retrieve files.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const attachment = await this.prisma.attachment.findUnique({
        where: { id },
      });

      if (!attachment) {
        throw new NotFoundException('File not found');
      }

      const filePath = `public/${attachment.fileUrl.split('/').pop()}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await this.prisma.attachment.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw new InternalServerErrorException('Failed to delete file.');
    }
  }

  async logAudit(
    action: string,
    element: string,
    elementid: string,
    details: object,
    userId?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          element,
          elementId: elementid,
          details: details,
          userId: userId || null,
        },
      });
    } catch (error) {
      console.error('Error logging audit:', error.message);
      throw new InternalServerErrorException('Failed to log audit.');
    }
  }
}
