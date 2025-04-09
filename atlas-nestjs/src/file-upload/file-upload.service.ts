import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileUploadService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper method to get the next order index for a given structure and parent element.
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

  async updateStructureTitle(structureId: string, parsedData: any[]) {
    try {
      // Find the first element where level is 1 (#)
      const titleRow = parsedData.find((row) => /^#\s*(.+)$/.test(row.element));

      if (!titleRow) {
        throw new NotFoundException(
          'No level 1 title found in the uploaded data.',
        );
      }

      // Extract the title text
      const titleMatch = titleRow.element.match(/^#\s*(.+)$/);
      const name = titleMatch ? titleMatch[1].trim() : null;

      if (!name) {
        throw new NotFoundException('Invalid title format in uploaded data.');
      }

      // Update the Structure title
      return await this.prisma.structure.update({
        where: { id: structureId },
        data: { name, title: name },
      });
    } catch (error) {
      console.error('Error updating structure title:', error.message);
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

      // If a structure ID is provided, fetch it; otherwise create a new one.
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

      // Stack to track the last element at each heading level.
      const levelStack: { level: number; id: string }[] = [];

      // Iterate through parsed data rows to create elements.
      for (const row of parsedData) {
        const match = row.element.match(/^(#+)\s*(.*)$/);
        if (!match) continue;

        const level = match[1].length;
        const name = match[2].trim();

        // **Skip elements where there is only a single `#` (level 1)**
        if (level === 1) continue;

        // Find the correct parent by popping levels that are equal or higher.
        while (
          levelStack.length &&
          levelStack[levelStack.length - 1].level >= level
        ) {
          levelStack.pop();
        }

        const parentId = levelStack.length
          ? levelStack[levelStack.length - 1].id
          : null;

        // Determine the next order index for the new element.
        const orderIndex = await this.getNextOrderIndex(structure.id, parentId);

        const element = await this.prisma.element.create({
          data: {
            name,
            structureId: structure.id,
            parentId,
            orderIndex, // set the auto-incremented orderIndex
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

        // Push the created element into the level stack.
        levelStack.push({ level, id: element.id });
      }

      // Update the structure title based on the level 1 element.
      await this.updateStructureTitle(structure.id, parsedData);

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
