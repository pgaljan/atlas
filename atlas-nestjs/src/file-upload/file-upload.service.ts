import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  async createStructureAndElements(
    userId: string,
    parsedData: any[],
    structureId?: string,
  ) {
    try {
      let structure;

      // Check if structureId is provided, otherwise create a new structure
      if (structureId) {
        structure = await this.prisma.structure.findUnique({
          where: { id: structureId },
          include: {
            elements: true,
          },
        });

        if (!structure) {
          throw new NotFoundException('Structure not found');
        }
      } else {
        // Create new structure if no structureId provided
        structure = await this.prisma.structure.create({
          data: {
            name: `Imported Structure ${new Date().toISOString()}`,
            ownerId: userId,
            elements: {
              create: [],
            },
          },
          include: {
            elements: true,
          },
        });
      }

      const elementNames = parsedData.map((row) => row.element);

      // Create elements and map parentId by name
      for (const row of parsedData) {
        let parentId = null;
        if (row.parentId) {
          // Find parent element by name
          const parentElement = await this.prisma.element.findFirst({
            where: { name: row.parentId },
          });
          if (parentElement) {
            parentId = parentElement.id;
          }
        }

        const element = await this.prisma.element.create({
          data: {
            name: row.element || '',
            structureId: structure.id,
            parentId: parentId || null,
            // Record: {
            //   create: {
            //     metadata: JSON.parse(row.additionalData || '{}'),
            //   },
            // },
          },
        });

        await this.prisma.structure.update({
          where: { id: structure.id },
          data: {
            elements: {
              connect: { id: element.id },
            },
          },
        });
      }

      return structure;
    } catch (error) {
      console.error('Error creating structure and elements:', error.message);
      throw new InternalServerErrorException(
        'Failed to create structure and elements.',
      );
    }
  }

  async logAudit(
    action: string,
    element: string,
    elementId: string,
    details: object,
    userId?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          element,
          elementId,
          details,
          userId: userId || null, 
        },
      });
    } catch (error) {
      console.error('Error logging audit:', error.message);
      throw new InternalServerErrorException('Failed to log audit.');
    }
  }

  async getMediaByUserId(userId: string) {
    try {
      return await this.prisma.attachment.findMany({
        where: { userId },
      });
    } catch (error) {
      console.error('Error fetching media by user ID:', error.message);
      throw new InternalServerErrorException(
        'Failed to fetch media by user ID.',
      );
    }
  }

  async updateMedia(id: string, newFileUrl: string) {
    try {
      const media = await this.prisma.attachment.findUnique({
        where: { id },
      });

      if (!media) {
        throw new NotFoundException('Media not found.');
      }

      return await this.prisma.attachment.update({
        where: { id },
        data: {
          fileUrl: newFileUrl,
        },
      });
    } catch (error) {
      console.error('Error updating media:', error.message);
      throw new InternalServerErrorException('Failed to update media.');
    }
  }

  async deleteMedia(id: string) {
    try {
      const media = await this.prisma.attachment.findUnique({
        where: { id },
      });

      if (!media) {
        throw new NotFoundException('Media not found.');
      }

      await this.prisma.attachment.delete({
        where: { id },
      });

      return { message: 'Media deleted successfully.' };
    } catch (error) {
      console.error('Error deleting media:', error.message);
      throw new InternalServerErrorException('Failed to delete media.');
    }
  }
}
