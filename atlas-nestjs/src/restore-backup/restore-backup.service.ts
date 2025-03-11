import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as crypto from 'crypto';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestoreService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function to safely parse JSON.
  private safeParseJSON(data: string, fieldName: string): any {
    try {
      if (!data || data.trim() === '') return {};
      return JSON.parse(data);
    } catch (error) {
      console.error(
        `Error parsing ${fieldName}:`,
        error.message,
        'Original data:',
        data,
      );
      return fieldName === 'tags' ? [] : {};
    }
  }

  private decrypt(data: Buffer): Buffer {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
        Buffer.from(process.env.IV, 'hex'),
      );
      return Buffer.concat([decipher.update(data), decipher.final()]);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to decrypt the backup file.',
      );
    }
  }

  async restoreBackup(
    fileBuffer: Buffer,
    providedStructureId: string,
    currentUserId: string,
  ) {
    try {
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries();
      const encFile = zipEntries.find((entry) =>
        entry.entryName.includes('.enc'),
      );
      if (!encFile) {
        throw new InternalServerErrorException('No .enc file found in the ZIP');
      }
      const decryptedBuffer = this.decrypt(encFile.getData());
      const workbook = xlsx.read(decryptedBuffer, { type: 'buffer' });

      // Extract sheets.
      const structuresSheet = xlsx.utils.sheet_to_json<any>(
        workbook.Sheets['Structures'],
      );
      const elementsSheet = xlsx.utils.sheet_to_json<any>(
        workbook.Sheets['Elements'],
      );
      const structureMapsSheet = xlsx.utils.sheet_to_json<any>(
        workbook.Sheets['StructureMaps'],
      );
      const recordsSheet = xlsx.utils.sheet_to_json<any>(
        workbook.Sheets['Records'],
      );

      if (!structuresSheet.length) {
        throw new InternalServerErrorException(
          'No data found in the uploaded file.',
        );
      }

      let foundBackupStructure = structuresSheet.find(
        (s) => s.id === providedStructureId,
      );
      let backupStructure: any;
      let originalBackupStructureId: string;
      if (!foundBackupStructure) {
        backupStructure = structuresSheet[0];
        originalBackupStructureId = backupStructure.id;
        backupStructure = {
          ...backupStructure,
          id: providedStructureId,
          ownerId: currentUserId,
        };
      } else {
        backupStructure = foundBackupStructure;
        originalBackupStructureId = backupStructure.id;
      }

      // Decide on update vs. new record based on ownership.
      let targetStructureId: string;
      if (backupStructure.ownerId === currentUserId) {
        targetStructureId = providedStructureId;
      } else {
        targetStructureId = crypto.randomUUID
          ? crypto.randomUUID()
          : crypto.randomBytes(16).toString('hex');
        backupStructure = {
          ...backupStructure,
          id: targetStructureId,
          ownerId: currentUserId,
        };
      }

      // Restore records (structure-agnostic).
      for (const recordData of recordsSheet) {
        try {
          const metadata = recordData.metadata || '{}';
          const tags = recordData.tags || '[]';
          const parsedMetadata = this.safeParseJSON(metadata, 'metadata');
          const parsedTags = this.safeParseJSON(tags, 'tags');

          await this.prisma.record.upsert({
            where: { id: recordData.id },
            update: { metadata: parsedMetadata, tags: parsedTags },
            create: {
              id: recordData.id,
              metadata: parsedMetadata,
              tags: parsedTags,
            },
          });
        } catch (error) {
          console.error('Error processing record:', recordData, error.message);
          throw new InternalServerErrorException(
            `Failed to restore record with ID ${recordData.id}: ${error.message}`,
          );
        }
      }

      // Restore the structure.
      if (targetStructureId === providedStructureId) {
        await this.prisma.structure.upsert({
          where: { id: providedStructureId },
          update: {
            name: backupStructure.name,
            description: backupStructure.description,
            ownerId: backupStructure.ownerId,
            title: backupStructure.title,
            visibility: backupStructure.visibility,
          },
          create: {
            id: providedStructureId,
            name: backupStructure.name,
            title: backupStructure.title,
            description: backupStructure.description,
            ownerId: backupStructure.ownerId,
            visibility: backupStructure.visibility,
          },
        });
      } else {
        await this.prisma.structure.create({
          data: {
            id: targetStructureId,
            name: backupStructure.name,
            title: backupStructure.title,
            description: backupStructure.description,
            ownerId: backupStructure.ownerId,
            visibility: backupStructure.visibility,
          },
        });
      }

      const filteredElements = elementsSheet.filter(
        (e) => e.structureId === originalBackupStructureId,
      );
      const backupElementIds = new Set(filteredElements.map((el) => el.id));
      for (const elementData of filteredElements) {
        if (
          elementData.parentId &&
          !backupElementIds.has(elementData.parentId)
        ) {
          elementData.parentId = null;
        }
        elementData.structureId = targetStructureId;
        await this.prisma.element.upsert({
          where: { id: elementData.id },
          update: {
            structureId: elementData.structureId,
            recordId: elementData.recordId,
            name: elementData.name,
            parentId: elementData.parentId,
          },
          create: {
            id: elementData.id,
            name: elementData.name,
            structureId: elementData.structureId,
            recordId: elementData.recordId,
            parentId: elementData.parentId,
          },
        });
      }

      const filteredMaps = structureMapsSheet.filter(
        (m) => m.structureId === originalBackupStructureId,
      );
      for (const mapData of filteredMaps) {
        mapData.structureId = targetStructureId;
        await this.prisma.structureMap.upsert({
          where: { id: mapData.id },
          update: {
            structureId: mapData.structureId,
            name: mapData.name,
            description: mapData.description,
          },
          create: {
            id: mapData.id,
            structureId: mapData.structureId,
            name: mapData.name,
            description: mapData.description,
          },
        });
      }

      return { message: 'Backup restored successfully' };
    } catch (error) {
      console.error('Error during restore operation:', error);
      throw new InternalServerErrorException(
        'Failed to restore backup: ' + error.message,
      );
    }
  }

  async restoreFullBackup(fileBuffer: Buffer, currentUserId: string) {
    try {
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries();
      const encFile = zipEntries.find((entry) =>
        entry.entryName.endsWith('.enc'),
      );
      if (!encFile) {
        throw new InternalServerErrorException(
          'No encrypted backup file found in the ZIP.',
        );
      }
      const decryptedBuffer = this.decrypt(encFile.getData());

      // Attempt to parse as JSON; if it fails, try as an Excel workbook.
      let backupData: any;
      try {
        backupData = JSON.parse(decryptedBuffer.toString());
      } catch (parseError) {
        try {
          const workbook = xlsx.read(decryptedBuffer, { type: 'buffer' });
          backupData = {};
          backupData.structures = xlsx.utils.sheet_to_json<any>(
            workbook.Sheets['Structures'],
          );
          backupData.elements = xlsx.utils.sheet_to_json<any>(
            workbook.Sheets['Elements'],
          );
          backupData.StructureMap = xlsx.utils.sheet_to_json<any>(
            workbook.Sheets['StructureMaps'],
          );
        } catch (excelError) {
          throw new InternalServerErrorException(
            'Failed to parse decrypted backup data as JSON or Excel.',
          );
        }
      }

      if (!backupData || !backupData.structures) {
        throw new InternalServerErrorException(
          'Invalid backup data: missing structures.',
        );
      }

      // Process each structure from the full backup.
      for (const structureData of backupData.structures) {
        const originalStructureId = structureData.id;
        let targetStructureId: string;
        if (structureData.ownerId === currentUserId) {
          targetStructureId = originalStructureId;
        } else {
          targetStructureId = crypto.randomUUID
            ? crypto.randomUUID()
            : crypto.randomBytes(16).toString('hex');
          structureData.ownerId = currentUserId;
          structureData.id = targetStructureId;
        }

        await this.prisma.structure.upsert({
          where: { id: targetStructureId },
          update: {
            name: structureData.name,
            title: structureData.title,
            description: structureData.description,
            ownerId: structureData.ownerId,
            visibility: structureData.visibility,
          },
          create: {
            id: targetStructureId,
            name: structureData.name,
            title: structureData.title,
            description: structureData.description,
            ownerId: structureData.ownerId,
            visibility: structureData.visibility,
          },
        });

        // Process structure maps.
        if (structureData.StructureMap) {
          if (Array.isArray(structureData.StructureMap)) {
            for (const mapData of structureData.StructureMap) {
              if (mapData.structureId === originalStructureId) {
                mapData.structureId = targetStructureId;
              }
              await this.prisma.structureMap.upsert({
                where: { id: mapData.id },
                update: {
                  structureId: mapData.structureId,
                  name: mapData.name,
                  description: mapData.description,
                  createdAt: new Date(mapData.createdAt),
                  updatedAt: new Date(mapData.updatedAt),
                },
                create: {
                  id: mapData.id,
                  structureId: mapData.structureId,
                  name: mapData.name,
                  description: mapData.description,
                },
              });
            }
          } else {
            const mapData = structureData.StructureMap;
            if (mapData.structureId === originalStructureId) {
              mapData.structureId = targetStructureId;
            }
            await this.prisma.structureMap.upsert({
              where: { id: mapData.id },
              update: {
                structureId: mapData.structureId,
                name: mapData.name,
                description: mapData.description,
              },
              create: {
                id: mapData.id,
                structureId: mapData.structureId,
                name: mapData.name,
                description: mapData.description,
              },
            });
          }
        }

        if (structureData.elements && Array.isArray(structureData.elements)) {
          for (const elementData of structureData.elements) {
            if (elementData.structureId === originalStructureId) {
              elementData.structureId = targetStructureId;
            }
            const origParentId = elementData.parentId;
            elementData.parentId = null;
            await this.prisma.element.upsert({
              where: { id: elementData.id },
              update: {
                name: elementData.name,
                structureId: elementData.structureId,
                recordId: elementData.recordId,
                parentId: null,
              },
              create: {
                id: elementData.id,
                name: elementData.name,
                structureId: elementData.structureId,
                recordId: elementData.recordId,
                parentId: null,
              },
            });
            elementData._originalParentId = origParentId;
          }
          const elementIds = new Set(structureData.elements.map((el) => el.id));
          for (const elementData of structureData.elements) {
            const newParentId = elementData._originalParentId;
            if (newParentId && elementIds.has(newParentId)) {
              await this.prisma.element.update({
                where: { id: elementData.id },
                data: { parentId: newParentId },
              });
            }
          }
        }

        // Process records.
        if (structureData.records && Array.isArray(structureData.records)) {
          for (const recordData of structureData.records) {
            const metadata = recordData.metadata || '{}';
            const tags = recordData.tags || '[]';
            const parsedMetadata = this.safeParseJSON(metadata, 'metadata');
            const parsedTags = this.safeParseJSON(tags, 'tags');
            await this.prisma.record.upsert({
              where: { id: recordData.id },
              update: { metadata: parsedMetadata, tags: parsedTags },
              create: {
                id: recordData.id,
                metadata: parsedMetadata,
                tags: parsedTags,
              },
            });
          }
        }
      }

      return { message: 'Backup restored successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to restore backup: ' + error.message,
      );
    }
  }
}
