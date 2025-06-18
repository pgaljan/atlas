import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as crypto from 'crypto';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestoreService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to safely parse JSON from a string.
  private safeParseJSON(data: string, fieldName: string): any {
    try {
      if (!data || data.trim() === '') return fieldName === 'tags' ? [] : {};
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

  async createNewStructure(userId: string, workspaceId: string) {
    try {
      const newStructure = await this.prisma.structure.create({
        data: {
          name: `New Structure - ${userId}`,
          ownerId: userId,
          visibility: 'public',
          workspaceId: workspaceId,
        },
      });

      return {
        structureId: newStructure.id,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create a new structure: ' + error.message,
      );
    }
  }

  async restoreBackup(
    fileBuffer: Buffer,
    providedStructureId: string,
    currentUserId: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: currentUserId },
      });
      if (!user || !user.defaultWorkspaceId) {
        throw new InternalServerErrorException(
          'No valid workspaceId found for the user',
        );
      }
      const validWorkspaceId = user.defaultWorkspaceId;

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

      const structuresSheet = xlsx.utils.sheet_to_json<any>(
        workbook.Sheets['Structures'],
      );
      const elementsSheet = xlsx.utils.sheet_to_json<any>(
        workbook.Sheets['Elements'],
      );
      const structureMapsSheet = workbook.Sheets['StructureMaps']
        ? xlsx.utils.sheet_to_json<any>(workbook.Sheets['StructureMaps'])
        : [];
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

      await this.prisma.structure.upsert({
        where: { id: targetStructureId },
        update: {
          name: backupStructure.name,
          description: backupStructure.description,
          ownerId: backupStructure.ownerId,
          title: backupStructure.title,
          visibility: backupStructure.visibility,
          workspaceId: validWorkspaceId,
          imageUrl: backupStructure.imageUrl,
          markmapShowWbs: backupStructure.markmapShowWbs,
        },
        create: {
          id: targetStructureId,
          name: backupStructure.name,
          title: backupStructure.title,
          description: backupStructure.description,
          ownerId: backupStructure.ownerId,
          visibility: backupStructure.visibility,
          workspaceId: validWorkspaceId,
          imageUrl: backupStructure.imageUrl,
          markmapShowWbs: backupStructure.markmapShowWbs,
        },
      });

      // ------------------ ELEMENT RESTORE ------------------
      const elementIdMapping = new Map<string, string>();

      // Phase 1: Upsert elements with parentId and elementLinkId = null
      for (const elementData of elementsSheet.filter(
        (e) => e.structureId === originalBackupStructureId,
      )) {
        const originalParentId = elementData.parentId || null;
        const originalElementLinkId = elementData.elementLinkId || null;

        elementData.structureId = targetStructureId;
        elementData.parentId = null;
        elementData.elementLinkId = null;

        elementData._originalParentId = originalParentId;
        elementData._originalElementLinkId = originalElementLinkId;

        elementIdMapping.set(elementData.id, elementData.id);

        await this.prisma.element.upsert({
          where: { id: elementData.id },
          update: {
            name: elementData.name,
            structureId: elementData.structureId,
            recordId: elementData.recordId,
            parentId: null,
            orderIndex: elementData.orderIndex,
          },
          create: {
            id: elementData.id,
            name: elementData.name,
            structureId: elementData.structureId,
            recordId: elementData.recordId,
            parentId: null,
            orderIndex: elementData.orderIndex,
          },
        });
      }

      // Phase 2: Update parentId now that all elements exist
      for (const elementData of elementsSheet.filter(
        (e) => e.structureId === originalBackupStructureId,
      )) {
        const parentId = elementData._originalParentId;
        if (parentId && elementIdMapping.has(parentId)) {
          await this.prisma.element.update({
            where: { id: elementData.id },
            data: { parentId },
          });
        }
      }

      // Phase 3: Update elementLinkId now that all elements exist
      for (const elementData of elementsSheet.filter(
        (e) => e.structureId === originalBackupStructureId,
      )) {
        const linkId = elementData._originalElementLinkId;
        if (linkId && elementIdMapping.has(linkId)) {
          await this.prisma.element.update({
            where: { id: elementData.id },
            data: { elementLinkId: linkId },
          });
        }
      }

      // ------------------ RECORDS ------------------
      for (const recordData of recordsSheet) {
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

      // ------------------ STRUCTURE MAPS ------------------
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
            createdAt: mapData.createdAt
              ? new Date(mapData.createdAt)
              : new Date(),
            updatedAt: mapData.updatedAt
              ? new Date(mapData.updatedAt)
              : new Date(),
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
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to restore backup: ' + error.message,
      );
    }
  }

  async restoreFullBackup(fileBuffer: Buffer, currentUserId: string) {
    try {
      // Retrieve user to get a valid workspaceId.
      const user = await this.prisma.user.findUnique({
        where: { id: currentUserId },
      });
      if (!user || !user.defaultWorkspaceId) {
        throw new InternalServerErrorException(
          'No valid workspaceId found for the user',
        );
      }
      const validWorkspaceId = user.defaultWorkspaceId;

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
          backupData.records = xlsx.utils.sheet_to_json<any>(
            workbook.Sheets['Records'],
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

      const restoredStructureIds: string[] = [];

      // Process each structure in the full backup.
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

        restoredStructureIds.push(targetStructureId);

        await this.prisma.structure.upsert({
          where: { id: targetStructureId },
          update: {
            name: structureData.name,
            title: structureData.title,
            description: structureData.description,
            ownerId: structureData.ownerId,
            visibility: structureData.visibility,
            workspaceId: validWorkspaceId,
            imageUrl: structureData.imageUrl,
            markmapShowWbs: structureData.markmapShowWbs,
          },
          create: {
            id: targetStructureId,
            name: structureData.name,
            title: structureData.title,
            description: structureData.description,
            ownerId: structureData.ownerId,
            visibility: structureData.visibility,
            workspaceId: validWorkspaceId,
            imageUrl: structureData.imageUrl,
            markmapShowWbs: structureData.markmapShowWbs,
          },
        });

        // Process Structure Maps.
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
                  createdAt: mapData.createdAt
                    ? new Date(mapData.createdAt)
                    : new Date(),
                  updatedAt: mapData.updatedAt
                    ? new Date(mapData.updatedAt)
                    : new Date(),
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

        // Process Elements.
        if (structureData.elements && Array.isArray(structureData.elements)) {
          const fullElementMapping = new Map<string, string>();
          for (const elementData of structureData.elements) {
            if (elementData.structureId === originalStructureId) {
              elementData.structureId = targetStructureId;
            }
            const origParentId = elementData.parentId;
            elementData.parentId = null;
            const originalElementLinkId = elementData.elementLinkId || null;
            elementData.elementLinkId = null;

            fullElementMapping.set(elementData.id, elementData.id);

            await this.prisma.element.upsert({
              where: { id: elementData.id },
              update: {
                name: elementData.name,
                structureId: elementData.structureId,
                recordId: elementData.recordId,
                parentId: null,
                orderIndex: elementData.orderIndex,
              },
              create: {
                id: elementData.id,
                name: elementData.name,
                structureId: elementData.structureId,
                recordId: elementData.recordId,
                parentId: null,
                orderIndex: elementData.orderIndex,
              },
            });
            elementData._originalElementLinkId = originalElementLinkId;
            elementData._originalParentId = origParentId;
          }
          // Phase 2: Update elementLinkId and parentId.
          for (const elementData of structureData.elements) {
            const newLinkId = elementData._originalElementLinkId
              ? fullElementMapping.get(elementData._originalElementLinkId) ||
                null
              : null;
            if (newLinkId) {
              await this.prisma.element.update({
                where: { id: elementData.id },
                data: { elementLinkId: newLinkId },
              });
            }
          }
          // Update parent-child relationships.
          const elementIds = new Set(structureData.elements.map((el) => el.id));
          for (const elementData of structureData.elements) {
            const origParentId = elementData._originalParentId;
            if (origParentId && elementIds.has(origParentId)) {
              await this.prisma.element.update({
                where: { id: elementData.id },
                data: { parentId: origParentId },
              });
            }
          }
        }

        // Process Records.
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

      return {
        message: 'Backup restored successfully',
        restoredStructureIds,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to restore backup: ' + error.message,
      );
    }
  }

  async restoreBackupfromURL(
    fileBuffer: Buffer,
    providedStructureId: string,
    currentUserId: string,
  ) {
    try {
      // Retrieve user to get a valid workspaceId.
      const user = await this.prisma.user.findUnique({
        where: { id: currentUserId },
      });
      if (!user || !user.defaultWorkspaceId) {
        throw new InternalServerErrorException(
          'No valid workspaceId found for the user',
        );
      }
      const validWorkspaceId = user.defaultWorkspaceId;

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
      const structureMapsSheet = workbook.Sheets['StructureMaps']
        ? xlsx.utils.sheet_to_json<any>(workbook.Sheets['StructureMaps'])
        : [];
      const recordsSheet = xlsx.utils.sheet_to_json<any>(
        workbook.Sheets['Records'],
      );

      if (!structuresSheet.length) {
        throw new InternalServerErrorException(
          'No data found in the uploaded file.',
        );
      }

      // Retrieve the backup structure.
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

      // Determine target structure id.
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

      // Restore the structure.
      await this.prisma.structure.upsert({
        where: { id: targetStructureId },
        update: {
          name: backupStructure.name,
          description: backupStructure.description,
          ownerId: backupStructure.ownerId,
          title: backupStructure.title,
          visibility: backupStructure.visibility,
          workspaceId: validWorkspaceId,
          imageUrl: backupStructure.imageUrl,
          markmapShowWbs: backupStructure.markmapShowWbs,
        },
        create: {
          id: targetStructureId,
          name: backupStructure.name,
          title: backupStructure.title,
          description: backupStructure.description,
          ownerId: backupStructure.ownerId,
          visibility: backupStructure.visibility,
          workspaceId: validWorkspaceId,
          imageUrl: backupStructure.imageUrl,
          markmapShowWbs: backupStructure.markmapShowWbs,
        },
      });

      // ---------- Elements Restoration in Two Passes ----------
      const elementIdMapping = new Map<string, string>();
      const recordIdMapping = new Map<string, string>(); // New map to track recordId

      // First pass: Upsert elements and track recordIds.
      for (const elementData of elementsSheet.filter(
        (e) => e.structureId === originalBackupStructureId,
      )) {
        elementData.structureId = targetStructureId;

        // Map the original ID
        elementIdMapping.set(elementData.id, elementData.id);

        // Ensure the recordId exists before attempting upsert
        if (elementData.recordId) {
          const record = await this.prisma.record.findUnique({
            where: { id: elementData.recordId },
          });

          if (record) {
            recordIdMapping.set(elementData.recordId, record.id); // Store the valid recordId
          } else {
            // If record doesn't exist, create a new record or handle error
            const newRecord = await this.prisma.record.create({
              data: {
                id: elementData.recordId,
                metadata: '{}',
                tags: '[]',
              },
            });
            recordIdMapping.set(elementData.recordId, newRecord.id); // Use the new recordId
          }
        }

        await this.prisma.element.upsert({
          where: { id: elementData.id },
          update: {
            name: elementData.name,
            structureId: elementData.structureId,
            recordId:
              recordIdMapping.get(elementData.recordId) || elementData.recordId, // Use mapped recordId
            orderIndex: elementData.orderIndex,
            parentId: null,
          },
          create: {
            id: elementData.id,
            name: elementData.name,
            structureId: elementData.structureId,
            recordId:
              recordIdMapping.get(elementData.recordId) || elementData.recordId, // Use mapped recordId
            orderIndex: elementData.orderIndex,
            parentId: null,
          },
        });

        elementData._originalParentId = elementData.parentId;
      }

      // Phase 2: Update elementLinkId based on the stored mapping.
      for (const elementData of elementsSheet.filter(
        (e) => e.structureId === targetStructureId,
      )) {
        const originalLinkId = elementData._originalElementLinkId;
        if (originalLinkId) {
          const newLinkId = elementIdMapping.get(originalLinkId) || null;
          if (newLinkId) {
            await this.prisma.element.update({
              where: { id: elementData.id },
              data: { elementLinkId: newLinkId },
            });
          }
        }
      }

      // Phase 3: Update parentId for elements.
      for (const elementData of elementsSheet.filter(
        (e) => e.structureId === targetStructureId,
      )) {
        const parentId = elementData._originalParentId;
        if (parentId && elementIdMapping.has(parentId)) {
          await this.prisma.element.update({
            where: { id: elementData.id },
            data: { parentId: parentId },
          });
        }
      }

      // Restore records (structure-agnostic)
      for (const recordData of recordsSheet) {
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

      // Restore Structure Maps.
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
            createdAt: mapData.createdAt
              ? new Date(mapData.createdAt)
              : new Date(),
            updatedAt: mapData.updatedAt
              ? new Date(mapData.updatedAt)
              : new Date(),
          },
          create: {
            id: mapData.id,
            structureId: mapData.structureId,
            name: mapData.name,
            description: mapData.description,
          },
        });
      }

      return {
        message: 'Backup restored successfully',
        structureId: providedStructureId,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to restore backup: ' + error.message,
      );
    }
  }
}
