import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  private encrypt(data: Buffer): Buffer {
    try {
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
        Buffer.from(process.env.IV, 'hex'),
      );
      return Buffer.concat([cipher.update(data), cipher.final()]);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to encrypt the backup data',
        error.message,
      );
    }
  }

  private async logAudit(
    action: string,
    element: string,
    elementid: string,
    details: object,
    userId?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        element,
        elementId: elementid,
        details: details,
        userId: userId || null,
      },
    });
  }

  async createBackup(userId: string, structureId?: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          structures: {
            where: structureId ? { id: structureId } : {},
            include: {
              elements: {
                include: {
                  Record: true,
                },
              },
              StructureMap: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (structureId && user.structures.length === 0) {
        throw new NotFoundException(
          `Structure with ID ${structureId} not found for the user`,
        );
      }

      // Prepare data for backup
      const structuresSheet = user.structures.map((structure: any) => ({
        id: structure.id,
        name: structure.name,
        title: structure.title,
        description: structure.description,
        ownerId: structure.ownerId,
        createdAt: structure.createdAt,
        updatedAt: structure.updatedAt,
        visibility: structure.visibility,
      }));

      const elementsSheet = user.structures.flatMap((structure: any) =>
        structure.elements.map((element: any) => ({
          id: element.id,
          name: element.name,
          structureId: element.structureId,
          recordId: element.recordId,
          parentId: element.parentId,
          type: element.type,
          createdAt: element.createdAt,
          updatedAt: element.updatedAt,
          Record: element.Record ? element.Record.id : null,
        })),
      );

      const recordsSheet = user.structures.flatMap((structure: any) =>
        structure.elements.flatMap((element: any) =>
          element.Record
            ? [
                {
                  id: element.Record.id,
                  metadata: JSON.stringify(element.Record.metadata),
                  tags: element.Record.tags
                    ? JSON.stringify(element.Record.tags)
                    : null,
                  createdAt: element.Record.createdAt,
                  updatedAt: element.Record.updatedAt,
                },
              ]
            : [],
        ),
      );

      // Rest of the backup logic remains unchanged
      const backupDir = path.resolve(__dirname, '../../public/backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(
        workbook,
        xlsx.utils.json_to_sheet(structuresSheet),
        'Structures',
      );
      xlsx.utils.book_append_sheet(
        workbook,
        xlsx.utils.json_to_sheet(elementsSheet),
        'Elements',
      );
      xlsx.utils.book_append_sheet(
        workbook,
        xlsx.utils.json_to_sheet(recordsSheet),
        'Records',
      );

      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const encryptedBuffer = this.encrypt(buffer);

      const structure = user.structures[0];

      // Generate file name using structure name and timestamp
      const timestamp = new Date();
      const filename = `${structure.title || structure.name}.${timestamp}.zip`;

      const encryptedFilePath = path.resolve(
        backupDir,
        `backup-${uuidv4()}.enc`,
      );
      fs.writeFileSync(encryptedFilePath, encryptedBuffer);

      const zip = new AdmZip();
      const zipFilePath = path.resolve(backupDir, filename);
      zip.addLocalFile(encryptedFilePath);
      zip.writeZip(zipFilePath);

      fs.unlinkSync(encryptedFilePath);

      const protocol = (process.env.PROTOCOL || 'http')?.replace(/:\/*$/, '');
      const baseUrl = (process.env.BASE_URL || 'localhost:4001')
        .replace(/^https?:\/+/, '')
        .replace(/^\/|\/$/, '');

      const fileUrl = `${protocol}://${baseUrl}/public/backups/${filename}`;
      const title = `${structure.title || structure.name}-${timestamp}`;

      const backup = await this.prisma.backup.create({
        data: {
          userId,
          title,
          backupData: { filePath: zipFilePath },
          fileUrl,
        },
      });

      // Log the audit for backup creation
      await this.logAudit('create', 'backup', backup.id, {
        fileUrl,
        userId,
      });

      return {
        message: 'Backup created successfully',
        fileUrl,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Unexpected error during backup creation:', error);
      throw new InternalServerErrorException('Failed to create backup');
    }
  }

  async createFullUserBackup(userId: string) {
    try {
      // Fetch user along with all structures, elements, and related records
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          structures: {
            include: {
              elements: {
                include: { Record: true },
              },
              StructureMap: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Prepare the backup data (all structures for the user)
      const backupData = {
        structures: user.structures,
      };

      // Convert backup data to JSON and encrypt it
      const jsonData = JSON.stringify(backupData, null, 2);
      const jsonBuffer = Buffer.from(jsonData);
      const encryptedBuffer = this.encrypt(jsonBuffer);

      // Prepare backup directory
      const backupDir = path.resolve(__dirname, '../../public/backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Generate filenames
      const timestamp = new Date()
        .toISOString()
        .replace('T', '_')
        .replace(/\..+/, '')
        .replace(/:/g, '-');
      const encryptedFilePath = path.resolve(
        backupDir,
        `backup-${uuidv4()}.enc`,
      );
      const filePrefix = user.username || user.email || 'user';
      const zipFilePath = path.resolve(
        backupDir,
        `${filePrefix}-${timestamp}.zip`,
      );

      // Write encrypted data to a temporary file
      fs.writeFileSync(encryptedFilePath, encryptedBuffer);

      // Compress the encrypted backup into a ZIP file
      const zip = new AdmZip();
      zip.addLocalFile(encryptedFilePath);
      zip.writeZip(zipFilePath);

      // Remove the temporary encrypted file
      fs.unlinkSync(encryptedFilePath);

      // Construct public URL for the backup file
      const protocol = (process.env.PROTOCOL || 'http').replace(/:\/*$/, '');
      const baseUrl = (process.env.BASE_URL || 'localhost:4001')
        .replace(/^https?:\/+/, '')
        .replace(/^\/|\/$/, '');
      const fileUrl = `${protocol}://${baseUrl}/public/backups/${path.basename(zipFilePath)}`;

      // Create a backup record in the database
      const title = `${filePrefix}-${timestamp}`;
      const backup = await this.prisma.backup.create({
        data: {
          userId,
          title,
          backupData: { filePath: zipFilePath },
          fileUrl,
        },
      });

      // Log the audit for full backup creation
      await this.logAudit('create', 'full-user-backup', backup.id, {
        fileUrl,
        userId,
      });

      return {
        message: 'Full user backup created successfully',
        fileUrl,
      };
    } catch (error) {
      console.error('Error creating full user backup:', error);
      throw new InternalServerErrorException(
        'Failed to create full user backup',
      );
    }
  }

  async getBackupByUserId(userId: string) {
    return await this.prisma.backup.findMany({ where: { userId } });
  }

  async getBackup(backupId: string) {
    try {
      const backup = await this.prisma.backup.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        throw new NotFoundException(`Backup with ID ${backupId} not found`);
      }

      return {
        ...backup,
        publicUrl: backup.fileUrl,
      };
    } catch (error) {
      console.error('Error fetching backup:', error);
      throw new InternalServerErrorException('Failed to retrieve the backup');
    }
  }

  async deleteBackup(backupId: string) {
    try {
      const backup = await this.prisma.backup.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        throw new NotFoundException(`Backup with ID ${backupId} not found`);
      }

      const backupData = backup.backupData as { filePath: string };
      if (fs.existsSync(backupData.filePath)) {
        fs.unlinkSync(backupData.filePath);
      }

      await this.prisma.backup.delete({ where: { id: backupId } });

      // Log the audit for backup deletion
      await this.logAudit('delete', 'backup', backupId, {
        userId: backup.userId,
      });

      return { message: `Backup with ID ${backupId} deleted successfully` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete the backup');
    }
  }

  async getAllBackups(userId?: string) {
    try {
      const backups = userId
        ? await this.prisma.backup.findMany({ where: { userId } })
        : await this.prisma.backup.findMany();

      return backups;
    } catch (error) {
      console.error('Error fetching backups:', error);
      throw new InternalServerErrorException('Failed to retrieve backups');
    }
  }
}
