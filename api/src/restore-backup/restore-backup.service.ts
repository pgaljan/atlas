import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as crypto from 'crypto';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestoreService {
  constructor(private readonly prisma: PrismaService) {}

  private safeParseJSON(data: string, fieldName: string): any {
    try {
      if (!data || data.trim() === '') return fieldName === 'tags' ? [] : {};

      if (fieldName === 'recordSvg' && data.trim().startsWith('<svg')) {
        return data;
      }

      return JSON.parse(data);
    } catch (error) {
      if (fieldName === 'tags') return [];
      if (fieldName === 'recordSvg') return data;
      return {};
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
      const recordIdMapping = new Map<string, string>();

      // Phase 1: Generate new IDs and create ID mapping
      const elementsToRestore = elementsSheet.filter(
        (e) => e.structureId === originalBackupStructureId,
      );

      for (const elementData of elementsToRestore) {
        const originalId = elementData.id;
        const newId = crypto.randomUUID
          ? crypto.randomUUID()
          : crypto.randomBytes(16).toString('hex');

        // Map old ID to new ID
        elementIdMapping.set(originalId, newId);

        // Store original relationships for Phase 2
        elementData._originalId = originalId;
        elementData._originalParentId = elementData.parentId || null;
        elementData._originalElementLinkId = elementData.elementLinkId || null;
        elementData._originalRecordId = elementData.recordId || null;
      }

      // Phase 2: Create/Update records first (if they don't exist)
      for (const elementData of elementsToRestore) {
        if (elementData._originalRecordId) {
          const recordExists = await this.prisma.record.findUnique({
            where: { id: elementData._originalRecordId },
          });

          if (recordExists) {
            recordIdMapping.set(elementData._originalRecordId, recordExists.id);
          } else {
            // Create a new record with new ID if it doesn't exist
            const newRecordId = crypto.randomUUID
              ? crypto.randomUUID()
              : crypto.randomBytes(16).toString('hex');

            const newRecord = await this.prisma.record.create({
              data: {
                id: newRecordId,
                metadata: {},
                tags: [],
                editorType: 'vscode',
                recordSvg: {},
              },
            });
            recordIdMapping.set(elementData._originalRecordId, newRecord.id);
          }
        }
      }

      // Phase 3: Create elements with new IDs and no parent relationships yet
      for (const elementData of elementsToRestore) {
        const originalId = elementData._originalId;
        const newId = elementIdMapping.get(originalId);
        const mappedRecordId = elementData._originalRecordId
          ? recordIdMapping.get(elementData._originalRecordId) || null
          : null;

        const {
          name,
          orderIndex,
          isExpanded,
          type,
          eventType,
          gateType,
          eventValue,
          eventValueType,
          mttr,
          missionTime,
          inputK,
          outputN,
          description,
          deletedAt,
          createdAt,
          updatedAt,
        } = elementData;

        await this.prisma.element.upsert({
          where: { id: newId },
          update: {
            name,
            structureId: targetStructureId,
            recordId: mappedRecordId,
            orderIndex,
            parentId: null, // Will be set in Phase 4
            elementLinkId: null, // Will be set in Phase 5
            isExpanded: isExpanded ?? true,
            type: type || null,
            eventType: eventType || null,
            gateType: gateType || null,
            eventValue: eventValue ?? null,
            eventValueType: eventValueType || null,
            mttr: mttr ?? null,
            missionTime: missionTime ?? null,
            inputK: inputK ?? null,
            outputN: outputN ?? null,
            description: description || null,
            deletedAt: deletedAt ? new Date(deletedAt) : null,
            updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
          },
          create: {
            id: newId,
            name,
            structureId: targetStructureId,
            recordId: mappedRecordId,
            orderIndex,
            parentId: null, // Will be set in Phase 4
            elementLinkId: null, // Will be set in Phase 5
            isExpanded: isExpanded ?? true,
            type: type || null,
            eventType: eventType || null,
            gateType: gateType || null,
            eventValue: eventValue ?? null,
            eventValueType: eventValueType || null,
            mttr: mttr ?? null,
            missionTime: missionTime ?? null,
            inputK: inputK ?? null,
            outputN: outputN ?? null,
            description: description || null,
            deletedAt: deletedAt ? new Date(deletedAt) : null,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
          },
        });
      }

      // Phase 4: Update parentId with mapped IDs
      for (const elementData of elementsToRestore) {
        const newId = elementIdMapping.get(elementData._originalId);
        const originalParentId = elementData._originalParentId;

        if (originalParentId && elementIdMapping.has(originalParentId)) {
          const newParentId = elementIdMapping.get(originalParentId);
          await this.prisma.element.update({
            where: { id: newId },
            data: { parentId: newParentId },
          });
        }
      }

      // Phase 5: Update elementLinkId with mapped IDs
      for (const elementData of elementsToRestore) {
        const newId = elementIdMapping.get(elementData._originalId);
        const originalLinkId = elementData._originalElementLinkId;

        if (originalLinkId && elementIdMapping.has(originalLinkId)) {
          const newLinkId = elementIdMapping.get(originalLinkId);
          await this.prisma.element.update({
            where: { id: newId },
            data: { elementLinkId: newLinkId },
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
          update: {
            metadata: parsedMetadata,
            tags: parsedTags,
            editorType: recordData.editorType || 'vscode',
            recordSvg: this.safeParseJSON(
              recordData.recordSvg || '{}',
              'recordSvg',
            ),
          },
          create: {
            id: recordData.id,
            metadata: parsedMetadata,
            tags: parsedTags,
            editorType: recordData.editorType || 'vscode',
            recordSvg: this.safeParseJSON(
              recordData.recordSvg || '{}',
              'recordSvg',
            ),
            createdAt: recordData.createdAt
              ? new Date(recordData.createdAt)
              : undefined,
            updatedAt: recordData.updatedAt
              ? new Date(recordData.updatedAt)
              : undefined,
          },
        });
      }

      // ------------------ STRUCTURE MAPS ------------------
      const filteredMaps = structureMapsSheet.filter(
        (m) => m.structureId === originalBackupStructureId,
      );
      for (const mapData of filteredMaps) {
        const originalMapId = mapData.id;
        const newMapId = crypto.randomUUID
          ? crypto.randomUUID()
          : crypto.randomBytes(16).toString('hex');

        mapData.structureId = targetStructureId;
        await this.prisma.structureMap.upsert({
          where: { id: newMapId },
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
            id: newMapId,
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
        });
      }

      return { message: 'Backup restored successfully' };
    } catch (error) {
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
          const fullRecordMapping = new Map<string, string>();

          // Phase 1: Generate new IDs and create mappings
          for (const elementData of structureData.elements) {
            if (elementData.structureId === originalStructureId) {
              elementData.structureId = targetStructureId;
            }

            const originalId = elementData.id;
            const newId = crypto.randomUUID
              ? crypto.randomUUID()
              : crypto.randomBytes(16).toString('hex');

            // Map old ID to new ID
            fullElementMapping.set(originalId, newId);

            // Store original relationships
            elementData._originalId = originalId;
            elementData._originalParentId = elementData.parentId || null;
            elementData._originalElementLinkId =
              elementData.elementLinkId || null;
            elementData._originalRecordId = elementData.recordId || null;
          }

          // Phase 2: Handle records
          for (const elementData of structureData.elements) {
            if (elementData._originalRecordId) {
              const recordExists = await this.prisma.record.findUnique({
                where: { id: elementData._originalRecordId },
              });

              if (recordExists) {
                fullRecordMapping.set(
                  elementData._originalRecordId,
                  recordExists.id,
                );
              } else {
                const newRecordId = crypto.randomUUID
                  ? crypto.randomUUID()
                  : crypto.randomBytes(16).toString('hex');

                const newRecord = await this.prisma.record.create({
                  data: {
                    id: newRecordId,
                    metadata: {},
                    tags: [],
                    editorType: 'vscode',
                    recordSvg: {},
                  },
                });
                fullRecordMapping.set(
                  elementData._originalRecordId,
                  newRecord.id,
                );
              }
            }
          }

          // Phase 3: Create elements with new IDs
          for (const elementData of structureData.elements) {
            const originalId = elementData._originalId;
            const newId = fullElementMapping.get(originalId);
            const mappedRecordId = elementData._originalRecordId
              ? fullRecordMapping.get(elementData._originalRecordId) || null
              : null;

            await this.prisma.element.upsert({
              where: { id: newId },
              update: {
                name: elementData.name,
                structureId: elementData.structureId,
                recordId: mappedRecordId,
                parentId: null, // Will be set in Phase 4
                elementLinkId: null, // Will be set in Phase 5
                orderIndex: elementData.orderIndex,
                isExpanded: elementData.isExpanded ?? true,
                type: elementData.type || null,
                eventType: elementData.eventType || null,
                gateType: elementData.gateType || null,
                eventValue: elementData.eventValue ?? null,
                eventValueType: elementData.eventValueType || null,
                mttr: elementData.mttr ?? null,
                missionTime: elementData.missionTime ?? null,
                inputK: elementData.inputK ?? null,
                outputN: elementData.outputN ?? null,
                description: elementData.description || null,
                deletedAt: elementData.deletedAt
                  ? new Date(elementData.deletedAt)
                  : null,
                updatedAt: elementData.updatedAt
                  ? new Date(elementData.updatedAt)
                  : new Date(),
              },
              create: {
                id: newId,
                name: elementData.name,
                structureId: elementData.structureId,
                recordId: mappedRecordId,
                parentId: null, // Will be set in Phase 4
                elementLinkId: null, // Will be set in Phase 5
                orderIndex: elementData.orderIndex,
                isExpanded: elementData.isExpanded ?? true,
                type: elementData.type || null,
                eventType: elementData.eventType || null,
                gateType: elementData.gateType || null,
                eventValue: elementData.eventValue ?? null,
                eventValueType: elementData.eventValueType || null,
                mttr: elementData.mttr ?? null,
                missionTime: elementData.missionTime ?? null,
                inputK: elementData.inputK ?? null,
                outputN: elementData.outputN ?? null,
                description: elementData.description || null,
                deletedAt: elementData.deletedAt
                  ? new Date(elementData.deletedAt)
                  : null,
                createdAt: elementData.createdAt
                  ? new Date(elementData.createdAt)
                  : new Date(),
                updatedAt: elementData.updatedAt
                  ? new Date(elementData.updatedAt)
                  : new Date(),
              },
            });
          }

          // Phase 4: Update elementLinkId with mapped IDs
          for (const elementData of structureData.elements) {
            const newId = fullElementMapping.get(elementData._originalId);
            const originalLinkId = elementData._originalElementLinkId;

            if (originalLinkId && fullElementMapping.has(originalLinkId)) {
              const newLinkId = fullElementMapping.get(originalLinkId);
              await this.prisma.element.update({
                where: { id: newId },
                data: { elementLinkId: newLinkId },
              });
            }
          }

          // Phase 5: Update parent-child relationships with mapped IDs
          for (const elementData of structureData.elements) {
            const newId = fullElementMapping.get(elementData._originalId);
            const originalParentId = elementData._originalParentId;

            if (originalParentId && fullElementMapping.has(originalParentId)) {
              const newParentId = fullElementMapping.get(originalParentId);
              await this.prisma.element.update({
                where: { id: newId },
                data: { parentId: newParentId },
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
              update: {
                metadata: parsedMetadata,
                tags: parsedTags,
                editorType: recordData.editorType || 'vscode',
                recordSvg: this.safeParseJSON(
                  recordData.recordSvg || '{}',
                  'recordSvg',
                ),
              },
              create: {
                id: recordData.id,
                metadata: parsedMetadata,
                tags: parsedTags,
                editorType: recordData.editorType || 'vscode',
                recordSvg: this.safeParseJSON(
                  recordData.recordSvg || '{}',
                  'recordSvg',
                ),
                createdAt: recordData.createdAt
                  ? new Date(recordData.createdAt)
                  : undefined,
                updatedAt: recordData.updatedAt
                  ? new Date(recordData.updatedAt)
                  : undefined,
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
          title: backupStructure.title,
          description: backupStructure.description,
          ownerId: backupStructure.ownerId,
          workspaceId: validWorkspaceId,
          imageUrl: backupStructure.imageUrl || null,
          isExpanded: backupStructure.isExpanded ?? true,
          markmapShowWbs: backupStructure.markmapShowWbs,
          wbsStart: backupStructure.wbsStart ?? 1,
          visibility: backupStructure.visibility,
          type: backupStructure.type ?? 'default',
          deletedAt: backupStructure.deletedAt
            ? new Date(backupStructure.deletedAt)
            : null,
        },
        create: {
          id: targetStructureId,
          name: backupStructure.name,
          title: backupStructure.title,
          description: backupStructure.description,
          ownerId: backupStructure.ownerId,
          workspaceId: validWorkspaceId,
          imageUrl: backupStructure.imageUrl || null,
          isExpanded: backupStructure.isExpanded ?? true,
          markmapShowWbs: backupStructure.markmapShowWbs,
          wbsStart: backupStructure.wbsStart ?? 1,
          visibility: backupStructure.visibility,
          type: backupStructure.type ?? 'default',
          deletedAt: backupStructure.deletedAt
            ? new Date(backupStructure.deletedAt)
            : null,
          createdAt: backupStructure.createdAt
            ? new Date(backupStructure.createdAt)
            : undefined,
          updatedAt: backupStructure.updatedAt
            ? new Date(backupStructure.updatedAt)
            : undefined,
        },
      });

      // ---------- Elements Restoration with Proper ID Remapping ----------
      const elementIdMapping = new Map<string, string>();
      const recordIdMapping = new Map<string, string>();

      // Phase 1: Generate new IDs and create mappings
      const urlElementsToRestore = elementsSheet.filter(
        (e) => e.structureId === originalBackupStructureId,
      );

      for (const elementData of urlElementsToRestore) {
        const originalId = elementData.id;
        const newId = crypto.randomUUID
          ? crypto.randomUUID()
          : crypto.randomBytes(16).toString('hex');

        // Map old ID to new ID
        elementIdMapping.set(originalId, newId);

        // Store original relationships
        elementData._originalId = originalId;
        elementData._originalParentId = elementData.parentId || null;
        elementData._originalElementLinkId = elementData.elementLinkId || null;
        elementData._originalRecordId = elementData.recordId || null;
        elementData.structureId = targetStructureId;
      }

      // Phase 2: Handle records first
      for (const elementData of urlElementsToRestore) {
        if (elementData._originalRecordId) {
          const recordExists = await this.prisma.record.findUnique({
            where: { id: elementData._originalRecordId },
          });

          if (recordExists) {
            recordIdMapping.set(elementData._originalRecordId, recordExists.id);
          } else {
            const newRecordId = crypto.randomUUID
              ? crypto.randomUUID()
              : crypto.randomBytes(16).toString('hex');

            const newRecord = await this.prisma.record.create({
              data: {
                id: newRecordId,
                metadata: {},
                tags: [],
                editorType: 'vscode',
                recordSvg: {},
              },
            });
            recordIdMapping.set(elementData._originalRecordId, newRecord.id);
          }
        }
      }

      // Phase 3: Create elements with new IDs
      for (const elementData of urlElementsToRestore) {
        const originalId = elementData._originalId;
        const newId = elementIdMapping.get(originalId);
        const mappedRecordId = elementData._originalRecordId
          ? recordIdMapping.get(elementData._originalRecordId) || null
          : null;

        await this.prisma.element.upsert({
          where: { id: newId },
          update: {
            name: elementData.name,
            structureId: targetStructureId,
            recordId: mappedRecordId,
            orderIndex: elementData.orderIndex,
            parentId: null, // Will be set in Phase 4
            elementLinkId: null, // Will be set in Phase 5
            isExpanded: elementData.isExpanded ?? true,
            type: elementData.type || null,
            eventType: elementData.eventType || null,
            gateType: elementData.gateType || null,
            eventValue: elementData.eventValue ?? null,
            eventValueType: elementData.eventValueType || null,
            mttr: elementData.mttr ?? null,
            missionTime: elementData.missionTime ?? null,
            inputK: elementData.inputK ?? null,
            outputN: elementData.outputN ?? null,
            description: elementData.description || null,
            deletedAt: elementData.deletedAt
              ? new Date(elementData.deletedAt)
              : null,
            updatedAt: elementData.updatedAt
              ? new Date(elementData.updatedAt)
              : new Date(),
          },
          create: {
            id: newId,
            name: elementData.name,
            structureId: targetStructureId,
            recordId: mappedRecordId,
            orderIndex: elementData.orderIndex,
            parentId: null, // Will be set in Phase 4
            elementLinkId: null, // Will be set in Phase 5
            isExpanded: elementData.isExpanded ?? true,
            type: elementData.type || null,
            eventType: elementData.eventType || null,
            gateType: elementData.gateType || null,
            eventValue: elementData.eventValue ?? null,
            eventValueType: elementData.eventValueType || null,
            mttr: elementData.mttr ?? null,
            missionTime: elementData.missionTime ?? null,
            inputK: elementData.inputK ?? null,
            outputN: elementData.outputN ?? null,
            description: elementData.description || null,
            deletedAt: elementData.deletedAt
              ? new Date(elementData.deletedAt)
              : null,
            createdAt: elementData.createdAt
              ? new Date(elementData.createdAt)
              : new Date(),
            updatedAt: elementData.updatedAt
              ? new Date(elementData.updatedAt)
              : new Date(),
          },
        });
      }

      // Phase 4: Update elementLinkId with mapped IDs
      for (const elementData of urlElementsToRestore) {
        const newId = elementIdMapping.get(elementData._originalId);
        const originalLinkId = elementData._originalElementLinkId;

        if (originalLinkId && elementIdMapping.has(originalLinkId)) {
          const newLinkId = elementIdMapping.get(originalLinkId);
          await this.prisma.element.update({
            where: { id: newId },
            data: { elementLinkId: newLinkId },
          });
        }
      }

      // Phase 5: Update parentId with mapped IDs
      for (const elementData of urlElementsToRestore) {
        const newId = elementIdMapping.get(elementData._originalId);
        const originalParentId = elementData._originalParentId;

        if (originalParentId && elementIdMapping.has(originalParentId)) {
          const newParentId = elementIdMapping.get(originalParentId);
          await this.prisma.element.update({
            where: { id: newId },
            data: { parentId: newParentId },
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

      // Restore Structure Maps with new IDs.
      const filteredMaps = structureMapsSheet.filter(
        (m) => m.structureId === originalBackupStructureId,
      );
      for (const mapData of filteredMaps) {
        const originalMapId = mapData.id;
        const newMapId = crypto.randomUUID
          ? crypto.randomUUID()
          : crypto.randomBytes(16).toString('hex');

        mapData.structureId = targetStructureId;
        await this.prisma.structureMap.upsert({
          where: { id: newMapId },
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
            id: newMapId,
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
