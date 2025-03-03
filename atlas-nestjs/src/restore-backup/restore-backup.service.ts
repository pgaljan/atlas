import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as crypto from 'crypto';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestoreService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function to safely parse JSON
  private safeParseJSON(data: string, fieldName: string): any {
    try {
      if (data === undefined || data === null || data.trim() === '') {
        return {};
      }
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

  async restoreBackup(fileBuffer: Buffer) {
    try {
      // Unzip the file
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries();
      const encFile = zipEntries.find((entry) =>
        entry.entryName.includes('.enc'),
      );

      if (!encFile) {
        throw new InternalServerErrorException('No .enc file found in the ZIP');
      }

      // Decrypt the file
      const decryptedBuffer = this.decrypt(encFile.getData());
      const workbook = xlsx.read(decryptedBuffer, { type: 'buffer' });
      const sheets = ['Structures', 'Elements', 'StructureMaps', 'Records'];
      const data = {};

      for (const sheet of sheets) {
        data[sheet] = workbook.Sheets[sheet]
          ? xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheet])
          : [];
      }

      // Extract data from sheets
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

      // Restore records first
      for (const recordData of recordsSheet) {
        try {
          // Handle undefined or null metadata/tags
          const metadata = recordData.metadata ? recordData.metadata : '{}';
          const tags = recordData.tags ? recordData.tags : '[]';

          // Parse metadata and tags only if they are valid
          const parsedMetadata = this.safeParseJSON(metadata, 'metadata');
          const parsedTags = this.safeParseJSON(tags, 'tags');

          await this.prisma.record.upsert({
            where: { id: recordData.id },
            update: {
              metadata: parsedMetadata,
              tags: parsedTags,
            },
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

      // Restore structures
      for (const structureData of structuresSheet) {
        try {
          await this.prisma.structure.upsert({
            where: { id: structureData.id },
            update: {
              name: structureData.name,
              description: structureData.description,
              ownerId: structureData.ownerId,
              title: structureData.title,
              visibility: structureData.visibility,
            },
            create: {
              id: structureData.id,
              name: structureData.name,
              title: structureData.title,
              description: structureData.description,
              ownerId: structureData.ownerId,
              visibility: structureData.visibility,
            },
          });
        } catch (error) {
          throw new InternalServerErrorException(
            `Failed to restore structure with ID ${structureData.id}: ${error.message}`,
          );
        }
      }

      // Restore elements
      for (const elementData of elementsSheet) {
        try {
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
        } catch (error) {
          throw new InternalServerErrorException(
            `Failed to restore element with ID ${elementData.id}: ${error.message}`,
          );
        }
      }

      // Restore structure maps
      for (const mapData of structureMapsSheet) {
        try {
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
        } catch (error) {
          throw new InternalServerErrorException(
            `Failed to restore structure map with ID ${mapData.id}: ${error.message}`,
          );
        }
      }

      return { message: 'Backup restored successfully' };
    } catch (error) {
      console.error('Error during restore operation:', error);
      throw new InternalServerErrorException(
        'Failed to restore backup: ' + error.message,
      );
    }
  }

  // Restores a full backup from a ZIP file buffer
  async restoreFullBackup(fileBuffer: Buffer) {
    try {
      // Unzip the file buffer
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries();

      // Find the encrypted file (should have a .enc extension)
      const encFile = zipEntries.find((entry) =>
        entry.entryName.endsWith('.enc'),
      );
      if (!encFile) {
        throw new InternalServerErrorException(
          'No encrypted backup file found in the ZIP.',
        );
      }

      // Decrypt the encrypted file
      const decryptedBuffer = this.decrypt(encFile.getData());

      // Parse the decrypted buffer as JSON backup data
      let backupData: any;
      try {
        backupData = JSON.parse(decryptedBuffer.toString());
      } catch (parseError) {
        throw new InternalServerErrorException(
          'Failed to parse decrypted backup data as JSON.',
        );
      }

      if (!backupData || !backupData.structures) {
        throw new InternalServerErrorException(
          'Invalid backup data: missing structures.',
        );
      }

      // Restore each structure and its nested data
      for (const structureData of backupData.structures) {
        // Upsert the structure
        await this.prisma.structure.upsert({
          where: { id: structureData.id },
          update: {
            name: structureData.name,
            title: structureData.title,
            description: structureData.description,
            ownerId: structureData.ownerId,
            visibility: structureData.visibility,
            createdAt: new Date(structureData.createdAt),
            updatedAt: new Date(structureData.updatedAt),
          },
          create: {
            id: structureData.id,
            name: structureData.name,
            title: structureData.title,
            description: structureData.description,
            ownerId: structureData.ownerId,
            visibility: structureData.visibility,
            createdAt: new Date(structureData.createdAt),
            updatedAt: new Date(structureData.updatedAt),
          },
        });

        // Restore structure map(s) if present
        if (structureData.StructureMap) {
          if (Array.isArray(structureData.StructureMap)) {
            for (const mapData of structureData.StructureMap) {
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
                  createdAt: new Date(mapData.createdAt),
                  updatedAt: new Date(mapData.updatedAt),
                },
              });
            }
          } else {
            await this.prisma.structureMap.upsert({
              where: { id: structureData.StructureMap.id },
              update: {
                structureId: structureData.StructureMap.structureId,
                name: structureData.StructureMap.name,
                description: structureData.StructureMap.description,
                createdAt: new Date(structureData.StructureMap.createdAt),
                updatedAt: new Date(structureData.StructureMap.updatedAt),
              },
              create: {
                id: structureData.StructureMap.id,
                structureId: structureData.StructureMap.structureId,
                name: structureData.StructureMap.name,
                description: structureData.StructureMap.description,
                createdAt: new Date(structureData.StructureMap.createdAt),
                updatedAt: new Date(structureData.StructureMap.updatedAt),
              },
            });
          }
        }

        // Restore nested elements and their associated records
        if (structureData.elements && Array.isArray(structureData.elements)) {
          for (const elementData of structureData.elements) {
            // Restore record data (if any) first
            if (elementData.Record) {
              await this.prisma.record.upsert({
                where: { id: elementData.Record.id },
                update: {
                  metadata: elementData.Record.metadata,
                  createdAt: new Date(elementData.Record.createdAt),
                  updatedAt: new Date(elementData.Record.updatedAt),
                },
                create: {
                  id: elementData.Record.id,
                  metadata: elementData.Record.metadata,
                  createdAt: new Date(elementData.Record.createdAt),
                  updatedAt: new Date(elementData.Record.updatedAt),
                },
              });
            }

            // Restore the element itself
            await this.prisma.element.upsert({
              where: { id: elementData.id },
              update: {
                name: elementData.name,
                structureId: elementData.structureId,
                recordId: elementData.recordId,
                parentId: elementData.parentId,
                createdAt: new Date(elementData.createdAt),
                updatedAt: new Date(elementData.updatedAt),
              },
              create: {
                id: elementData.id,
                name: elementData.name,
                structureId: elementData.structureId,
                recordId: elementData.recordId,
                parentId: elementData.parentId,
                createdAt: new Date(elementData.createdAt),
                updatedAt: new Date(elementData.updatedAt),
              },
            });
          }
        }
      }

      return { message: 'Backup restored successfully' };
    } catch (error) {
      console.error('Error during restore operation:', error);
      throw new InternalServerErrorException(
        'Failed to restore backup: ' + error.message,
      );
    }
  }
}
