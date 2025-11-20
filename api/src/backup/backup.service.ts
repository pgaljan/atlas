import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as crypto from 'crypto';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  getAttachmentBytesBigInt,
  getBackupBytesBigInt,
  bigIntBytesToMiBNumber,
} from '../storage/storage-size.util';
import { StorageAccountingService } from '../storage/storage-accounting.service';
import { AzureBlobService } from '../azure-blob-storage/azure-blob.service';
import * as fs from 'fs';

const MAX_CELL_LENGTH = 32767;

function safeCellValue(v: any): string {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > MAX_CELL_LENGTH
    ? s.slice(0, MAX_CELL_LENGTH - 20) + '…[truncated]'
    : s;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageAccounting: StorageAccountingService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  private getDayRangeFromDateString(dateStr: string) {
    const base = new Date(dateStr);
    const start = new Date(base);
    start.setHours(0, 0, 0, 0);
    const end = new Date(base);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private encrypt(data: Buffer): Buffer {
    try {
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
        Buffer.from(process.env.IV, 'hex'),
      );
      return Buffer.concat([cipher.update(data), cipher.final()]);
    } catch (error) {
      this.logger.error('Encryption failed', error as any);
      throw new InternalServerErrorException(
        'Failed to encrypt the backup data',
      );
    }
  }

  private async logAudit(
    action: string,
    element: string,
    elementId: string,
    details: object,
    userId?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        element,
        elementId,
        details,
        userId: userId || null,
      },
    });
  }

  private async recalcStoredBytes(userId: string): Promise<bigint> {
    const [backups, attachments] = await Promise.all([
      this.prisma.backup.findMany({
        where: { userId },
        select: { sizeBytes: true },
      }),
      this.prisma.attachment.findMany({
        where: { userId },
        select: { sizeBytes: true },
      }),
    ]);

    const totalBytes =
      backups.reduce(
        (acc, b) => acc + (b.sizeBytes ? BigInt(b.sizeBytes) : 0n),
        0n,
      ) +
      attachments.reduce(
        (acc, a) => acc + (a.sizeBytes ? BigInt(a.sizeBytes) : 0n),
        0n,
      );

    await this.storageAccounting.setStoredBytes(userId, totalBytes);

    this.logger.log(
      `Recalculated storedBytes for user ${userId}: ${totalBytes} bytes`,
    );

    return totalBytes;
  }

  async createBackup(
    userId: string,
    structureId?: string,
    workspaceId?: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          structures: {
            where: structureId ? { id: structureId } : {},
            include: {
              elements: { include: { Record: true } },
              StructureMap: true,
            },
          },
        },
      });

      if (!user)
        throw new NotFoundException(`User with ID ${userId} not found`);
      if (structureId && user.structures.length === 0)
        throw new NotFoundException(
          `Structure with ID ${structureId} not found for user`,
        );

      const structuresSheet = user.structures.map((s: any) => ({
        id: s.id,
        name: s.name,
        title: s.title,
        description: s.description,
        ownerId: s.ownerId,
        workspaceId: s.workspaceId,
        imageUrl: s.imageUrl || '',
        isExpanded: s.isExpanded,
        markmapShowWbs: s.markmapShowWbs,
        wbsStart: s.wbsStart,
        visibility: s.visibility,
        type: s.type,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        deletedAt: s.deletedAt || null,
      }));

      const elementsSheet = user.structures.flatMap((s: any) =>
        s.elements.map((e: any) => ({
          id: e.id,
          name: e.name,
          structureId: e.structureId,
          recordId: e.recordId || null,
          parentId: e.parentId || null,
          elementLinkId: e.elementLinkId || null,
          orderIndex: e.orderIndex,
          isExpanded: e.isExpanded,
          type: e.type || null,
          eventType: e.eventType || null,
          gateType: e.gateType || null,
          eventValue: e.eventValue ?? null,
          eventValueType: e.eventValueType ?? null,
          mttr: e.mttr ?? null,
          missionTime: e.missionTime ?? null,
          description: e.description || null,
          inputK: e.inputK ?? null,
          outputN: e.outputN ?? null,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          deletedAt: e.deletedAt || null,
        })),
      );

      const recordsSheet = user.structures.flatMap((s: any) =>
        s.elements.flatMap((e: any) =>
          e.Record
            ? [
                {
                  id: e.Record.id,
                  metadata: safeCellValue(e.Record.metadata),
                  tags: e.Record.tags ? safeCellValue(e.Record.tags) : null,
                  editorType: e.Record.editorType,
                  recordSvg: e.Record.recordSvg
                    ? safeCellValue(e.Record.recordSvg)
                    : null,
                  createdAt: e.Record.createdAt,
                  updatedAt: e.Record.updatedAt,
                },
              ]
            : [],
        ),
      );

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

      const timestamp = new Date()
        .toISOString()
        .replace('T', '_')
        .replace(/\..+/, '')
        .replace(/:/g, '-');
      const filename = `${(structure.title || structure.name)
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_\-\.]/g, '')}.${timestamp}`;

      const zip = new AdmZip();
      zip.addFile(`${path.basename(filename, '.zip')}.enc`, encryptedBuffer);
      const zipBuffer: Buffer = zip.toBuffer();

      // Upload to Azure
      const blobName = `backups/${filename}-${uuidv4()}.zip`;
      const uploadRes = await this.azureBlobService.uploadBuffer(
        zipBuffer,
        blobName,
        'application/zip',
      );
      const fileUrl = uploadRes.url;

      const validWorkspaceId = workspaceId || user.defaultWorkspaceId;
      if (!validWorkspaceId)
        throw new InternalServerErrorException(
          'No valid workspaceId provided for backup creation',
        );

      const sizeBytes = BigInt(zipBuffer.length);

      const backup = await this.prisma.backup.create({
        data: {
          userId,
          title: `${structure.title || structure.name}-${timestamp}`,
          backupData: { blobName, container: uploadRes.container },
          fileUrl,
          workspaceId: validWorkspaceId,
          sizeBytes,
        },
      });

      try {
        await this.storageAccounting.adjustStoredBytes(userId, sizeBytes);
      } catch (err) {
        this.logger.error(
          `Failed to adjust storedBytes after creating backup: ${err}`,
        );
        throw err;
      }

      try {
        await this.prisma.storageEvent.create({
          data: {
            userId,
            type: 'backup-create',
            bytes: sizeBytes,
            sign: 1,
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to create storageEvent for backup create: ${err}`,
        );
      }

      await this.logAudit(
        'CREATE',
        'Backup',
        backup.id,
        { fileUrl, blobName },
        userId,
      );

      return { message: 'Backup created successfully', fileUrl, filename };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error('createBackup error', error as any);
      throw new InternalServerErrorException('Failed to create backup');
    }
  }

  async createFullUserBackup(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          structures: {
            include: {
              elements: { include: { Record: true } },
              StructureMap: true,
            },
          },
        },
      });
      if (!user)
        throw new NotFoundException(`User with ID ${userId} not found`);
      const validWorkspaceId = user.defaultWorkspaceId;
      if (!validWorkspaceId)
        throw new InternalServerErrorException(
          'No valid workspaceId found for the user',
        );

      const backupData = { structures: user.structures };
      const jsonBuffer = Buffer.from(JSON.stringify(backupData, null, 2));
      const encryptedBuffer = this.encrypt(jsonBuffer);

      const timestamp = new Date()
        .toISOString()
        .replace('T', '_')
        .replace(/\..+/, '')
        .replace(/:/g, '-');
      const filePrefix = user.username || user.email || 'user';
      const filename = `${filePrefix}-${timestamp}`;

      const zip = new AdmZip();
      zip.addFile(`${filePrefix}.enc`, encryptedBuffer);
      const zipBuffer = zip.toBuffer();

      const blobName = `backups/${filename}-${uuidv4()}.zip`;
      const uploadRes = await this.azureBlobService.uploadBuffer(
        zipBuffer,
        blobName,
        'application/zip',
      );
      const fileUrl = uploadRes.url;

      const sizeBytes = BigInt(zipBuffer.length);
      const title = `${filePrefix}-${timestamp}`;

      const backup = await this.prisma.backup.create({
        data: {
          userId,
          title,
          backupData: { blobName, container: uploadRes.container },
          fileUrl,
          workspaceId: validWorkspaceId,
          sizeBytes,
        },
      });

      try {
        await this.storageAccounting.adjustStoredBytes(userId, sizeBytes);
      } catch (err) {
        this.logger.error(
          `Failed to adjust storedBytes after creating full user backup: ${err}`,
        );
        throw err;
      }

      try {
        await this.prisma.storageEvent.create({
          data: {
            userId,
            type: 'backup-create',
            bytes: sizeBytes,
            sign: 1,
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to create storageEvent for full-user backup create: ${err}`,
        );
      }

      await this.logAudit(
        'CREATE',
        'Full-user-backup',
        backup.id,
        { fileUrl, blobName },
        userId,
      );
      return { message: 'Full user backup created successfully', fileUrl };
    } catch (error) {
      this.logger.error('createFullUserBackup error', error as any);
      throw new InternalServerErrorException(
        'Failed to create full user backup',
      );
    }
  }

  async getBackupByWorkspaceId(workspaceId: string) {
    return await this.prisma.backup.findMany({ where: { workspaceId } });
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

      const backupData = backup.backupData as any;

      if (backupData && backupData.blobName) {
        try {
          await this.azureBlobService.deleteBlob(backupData.blobName);
        } catch (err) {
          this.logger.error(
            `Failed to delete Azure blob for backup ${backupId}`,
            err as any,
          );
        }
      } else if (backupData && backupData.filePath) {
        if (fs.existsSync(backupData.filePath)) {
          try {
            fs.unlinkSync(backupData.filePath);
          } catch (err) {
            this.logger.error(
              `Failed to delete local backup file ${backupData.filePath}`,
              err as any,
            );
          }
        }
      }

      await this.prisma.backup.delete({ where: { id: backupId } });

      await this.recalcStoredBytes(backup.userId);

      try {
        const sizeBytes = backup.sizeBytes
          ? BigInt(backup.sizeBytes)
          : getBackupBytesBigInt(backup);
        await this.prisma.storageEvent.create({
          data: {
            userId: backup.userId,
            type: 'backup-delete',
            bytes: sizeBytes,
            sign: -1,
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to create storageEvent for backup delete: ${err}`,
        );
      }

      await this.logAudit(
        'DELETE',
        'Backup',
        backupId,
        {
          title: backup.title,
          fileUrl: backup.fileUrl,
          workspaceId: backup.workspaceId,
          sizeBytes: backup.sizeBytes?.toString() ?? null,
          deletedAt: new Date().toISOString(),
        },
        backup.userId,
      );
      return { message: `Backup with ID ${backupId} deleted successfully` };
    } catch (error) {
      this.logger.error('deleteBackup error', error as any);
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
      throw new InternalServerErrorException('Failed to retrieve backups');
    }
  }

  async searchByTitle(dto: {
    query?: string;
    sortBy?: string;
    order?: string;
  }) {
    const sortBy = dto.sortBy ?? 'createdAt';
    const order: Prisma.SortOrder = dto.order === 'asc' ? 'asc' : 'desc';

    const where: Prisma.BackupWhereInput = {
      ...(dto.query
        ? { title: { contains: dto.query, mode: Prisma.QueryMode.insensitive } }
        : {}),
    };

    try {
      const backups = await this.prisma.backup.findMany({
        where,
        orderBy: { [sortBy]: order },
      });

      return { data: backups };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to search backups by title',
      );
    }
  }

  async searchByDate(
    dateStr: string,
    dto: { sortBy?: string; order?: string },
  ) {
    const sortBy = dto.sortBy ?? 'createdAt';
    const order: Prisma.SortOrder = dto.order === 'asc' ? 'asc' : 'desc';

    const { start, end } = this.getDayRangeFromDateString(dateStr);

    const where: Prisma.BackupWhereInput = {
      createdAt: { gte: start, lt: end },
    };

    try {
      const backups = await this.prisma.backup.findMany({
        where,
        orderBy: { [sortBy]: order },
      });

      return { data: backups };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to search backups by date',
      );
    }
  }
}
