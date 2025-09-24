import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageAccountingService } from 'src/storage/storage-accounting.service';
import { getAttachmentBytesBigInt } from 'src/storage/storage-size.util';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageAccounting: StorageAccountingService,
  ) {}

  private async getNextOrderIndex(
    structureId: string,
    parentId: string | null,
  ): Promise<number> {
    const maxElement = await this.prisma.element.findFirst({
      where: {
        structureId,
        parentId,
      },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    return maxElement ? maxElement.orderIndex + 1 : 0;
  }

  private async recalcStoredBytesForUser(userId: string) {
    try {
      const backups = await this.prisma.backup.findMany({
        where: { userId },
        select: { sizeBytes: true },
      });
      let totalBytes = backups.reduce(
        (acc, b) => acc + (b.sizeBytes ? BigInt(b.sizeBytes) : 0n),
        0n,
      );

      const attachments = await this.prisma.attachment.findMany({
        where: { userId },
        select: { sizeBytes: true },
      });
      totalBytes += attachments.reduce(
        (acc, a) => acc + (a.sizeBytes ? BigInt(a.sizeBytes) : 0n),
        0n,
      );

      await this.storageAccounting.adjustStoredBytes(userId, totalBytes);

      return totalBytes;
    } catch (err) {
      this.logger.error(
        `Failed to recalc stored bytes for user ${userId}: ${err}`,
      );
      throw new InternalServerErrorException(
        'Failed to recalculate user stored bytes.',
      );
    }
  }

  async saveRawFile(
    userId: string,
    file: Express.Multer.File,
    fileUrl: string,
  ) {
    try {
      const bytes = BigInt(file?.size ?? 0);

      const attachment = await this.prisma.attachment.create({
        data: {
          userId,
          fileUrl,
          fileType: file.mimetype,
          sizeBytes: bytes,
          data: {},
        },
      });

      try {
        await this.storageAccounting.adjustStoredBytes(userId, bytes);
      } catch (err) {
        this.logger.error(
          `Failed to adjust storedBytes after saveRawFile: ${err}`,
        );
        throw err;
      }

      try {
        await this.prisma.storageEvent.create({
          data: {
            userId,
            type: 'attachment-create',
            bytes: bytes,
            sign: 1,
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to create storageEvent for attachment create: ${err}`,
        );
        // do not block the operation
      }

      return attachment;
    } catch (error) {
      this.logger.error('Error saving raw file:', error as any);
      throw new InternalServerErrorException('Failed to save raw file.');
    }
  }

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

      const bytes = BigInt(file?.size ?? 0);

      const attachment = await this.prisma.attachment.create({
        data: {
          userId,
          fileUrl,
          fileType: file.mimetype,
          sizeBytes: bytes,
          data: {},
        },
      });

      try {
         await this.recalcStoredBytesForUser(userId);
      } catch (err) {
        this.logger.error(
          `Failed to adjust storedBytes after createAttachment: ${err}`,
        );
        throw err;
      }

      try {
        await this.prisma.storageEvent.create({
          data: {
            userId,
            type: 'attachment-create',
            bytes: bytes,
            sign: 1,
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to create storageEvent for attachment create: ${err}`,
        );
        // do not block the operation
      }

      return attachment;
    } catch (error) {
      this.logger.error('Error creating attachment:', error as any);
      throw new InternalServerErrorException('Failed to create attachment.');
    }
  }

  async updateStructureTitle(structureId: string, parsedData: any[]) {
    try {
      const titleRow = parsedData.find((row) => /^#\s*(.+)$/.test(row.element));

      if (!titleRow) {
        throw new NotFoundException(
          'No level 1 title found in the uploaded data.',
        );
      }

      const titleMatch = titleRow.element.match(/^#\s*(.+)$/);
      const name = titleMatch ? titleMatch[1].trim() : null;

      if (!name) {
        throw new NotFoundException('Invalid title format in uploaded data.');
      }

      return await this.prisma.structure.update({
        where: { id: structureId },
        data: { name, title: name },
      });
    } catch (error) {
      this.logger.error('Error updating structure title:', error as any);
      throw new InternalServerErrorException(
        'Failed to update structure title.',
      );
    }
  }

  async createStructureAndElements(
    userId: string,
    parsedData: any[],
    structureId?: string,
  ) {
    try {
      let structure: any;

      if (structureId) {
        structure = await this.prisma.structure.findUnique({
          where: { id: structureId },
          include: { elements: true },
        });

        if (!structure) {
          throw new NotFoundException('Structure not found');
        }
      } else {
        structure = await this.prisma.structure.create({
          data: {
            name: `Imported Structure ${new Date().toISOString()}`,
            ownerId: userId,
          },
        });
      }

      const levelStack: { level: number; id: string }[] = [];

      for (const row of parsedData) {
        const match = row.element.match(/^(#+)\s*(.*)$/);
        if (!match) continue;

        const level = match[1].length;
        const name = match[2].trim();

        if (level === 1) continue;

        while (
          levelStack.length &&
          levelStack[levelStack.length - 1].level >= level
        ) {
          levelStack.pop();
        }

        const parentId = levelStack.length
          ? levelStack[levelStack.length - 1].id
          : null;

        const orderIndex = await this.getNextOrderIndex(structure.id, parentId);

        const element = await this.prisma.element.create({
          data: {
            name,
            structureId: structure.id,
            parentId,
            orderIndex,
          },
        });

        if (row['Record Data']) {
          const metadata = {
            content: `<p>${row['Record Data']}</p>`,
          };

          const tags = row['Tags']
            ? row['Tags'].split(',').map((tag: string, index: number) => ({
                id: Date.now() + index,
                key: tag.trim().toLowerCase().replace(/\s+/g, '_'),
                value: tag.trim(),
              }))
            : [];

          await this.prisma.record.create({
            data: {
              metadata,
              tags,
              Element: { connect: { id: element.id } },
            },
          });
        }

        levelStack.push({ level, id: element.id });
      }

      await this.updateStructureTitle(structure.id, parsedData);

      return structure;
    } catch (error) {
      this.logger.error('Error creating structure and elements:', error as any);
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
      this.logger.error('Error logging audit:', error as any);
      throw new InternalServerErrorException('Failed to log audit.');
    }
  }

  async getMediaByUserId(userId: string) {
    try {
      const media = await this.prisma.attachment.findMany({
        where: { userId },
      });
      return media;
    } catch (error) {
      this.logger.error('Error fetching media by user ID:', error as any);
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

      const updated = await this.prisma.attachment.update({
        where: { id },
        data: {
          fileUrl: newFileUrl,
        },
      });

      return updated;
    } catch (error) {
      this.logger.error('Error updating media:', error as any);
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

      let sizeBytesBigInt: bigint = 0n;
      if (media.sizeBytes !== null && media.sizeBytes !== undefined) {
        sizeBytesBigInt = BigInt(media.sizeBytes as any);
      } else {
        sizeBytesBigInt = getAttachmentBytesBigInt(media);
      }

      await this.prisma.attachment.delete({ where: { id } });

      if (media.userId) {
        try {
          await this.recalcStoredBytesForUser(media.userId);
        } catch (err) {
          this.logger.error(
            `Failed to recalc storedBytes after deleteMedia (userId=${media.userId}): ${err}`,
          );
        }

        // 2) create a storageEvent for delete (non-fatal)
        try {
          await this.prisma.storageEvent.create({
            data: {
              userId: media.userId,
              type: 'attachment-delete',
              bytes: sizeBytesBigInt,
              sign: -1,
            },
          });
        } catch (err) {
          this.logger.error(
            `Failed to create storageEvent for attachment delete: ${err}`,
          );
        }
      }

      return { message: 'Media deleted successfully.' };
    } catch (error) {
      this.logger.error('Error deleting media:', error as any);
      throw new InternalServerErrorException('Failed to delete media.');
    }
  }

  async uploadAnonymousFile(file: Express.Multer.File, fileUrl: string) {
    const defaultAdmin = await this.prisma.user.findFirst({
      where: { isAdmin: true },
    });

    if (!defaultAdmin) {
      throw new Error('No default admin found for anonymous uploads.');
    }

    try {
      const bytes = BigInt(file.size ?? 0);
      const attachment = await this.prisma.attachment.create({
        data: {
          userId: defaultAdmin.id,
          fileUrl,
          fileType: file.mimetype,
          sizeBytes: bytes,
          data: {},
        },
      });

      // bump storedBytes for default admin
      try {
       await this.recalcStoredBytesForUser(defaultAdmin.id);
      } catch (err) {
        this.logger.error(
          `Failed to adjust storedBytes for anonymous upload: ${err}`,
        );
        throw err;
      }

      // create a storageEvent for anonymous upload (non-fatal)
      try {
        await this.prisma.storageEvent.create({
          data: {
            userId: defaultAdmin.id,
            type: 'attachment-create',
            bytes: bytes,
            sign: 1,
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to create storageEvent for anonymous attachment create: ${err}`,
        );
        // do not block the operation
      }

      return attachment;
    } catch (error) {
      this.logger.error('Error uploading anonymous file:', error as any);
      throw new InternalServerErrorException(
        'Failed to upload anonymous file.',
      );
    }
  }
}
