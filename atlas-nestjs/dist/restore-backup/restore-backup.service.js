"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreService = void 0;
const common_1 = require("@nestjs/common");
const AdmZip = require("adm-zip");
const crypto = require("crypto");
const xlsx = require("xlsx");
const prisma_service_1 = require("../prisma/prisma.service");
let RestoreService = class RestoreService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    safeParseJSON(data, fieldName) {
        try {
            if (data === undefined || data === null || data.trim() === '') {
                return {};
            }
            return JSON.parse(data);
        }
        catch (error) {
            console.error(`Error parsing ${fieldName}:`, error.message, 'Original data:', data);
            return fieldName === 'tags' ? [] : {};
        }
    }
    decrypt(data) {
        try {
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), Buffer.from(process.env.IV, 'hex'));
            return Buffer.concat([decipher.update(data), decipher.final()]);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to decrypt the backup file.');
        }
    }
    async restoreBackup(fileBuffer) {
        try {
            const zip = new AdmZip(fileBuffer);
            const zipEntries = zip.getEntries();
            const encFile = zipEntries.find((entry) => entry.entryName.endsWith('.enc'));
            if (!encFile) {
                throw new common_1.InternalServerErrorException('No .enc file found in the ZIP');
            }
            const decryptedBuffer = this.decrypt(encFile.getData());
            const workbook = xlsx.read(decryptedBuffer, { type: 'buffer' });
            const structuresSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Structures']);
            const elementsSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Elements']);
            const structureMapsSheet = xlsx.utils.sheet_to_json(workbook.Sheets['StructureMaps']);
            const recordsSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Records']);
            if (!structuresSheet.length) {
                throw new common_1.InternalServerErrorException('No data found in the uploaded file.');
            }
            for (const recordData of recordsSheet) {
                try {
                    const metadata = recordData.metadata ? recordData.metadata : '{}';
                    const tags = recordData.tags ? recordData.tags : '[]';
                    const parsedMetadata = this.safeParseJSON(metadata, 'metadata');
                    const parsedTags = this.safeParseJSON(tags, 'tags');
                    await this.prisma.record.upsert({
                        where: { id: recordData.id },
                        update: {
                            metadata: parsedMetadata,
                            tags: parsedTags,
                            createdAt: new Date(recordData.createdAt),
                            updatedAt: new Date(recordData.updatedAt),
                        },
                        create: {
                            id: recordData.id,
                            metadata: parsedMetadata,
                            tags: parsedTags,
                            createdAt: new Date(recordData.createdAt),
                            updatedAt: new Date(recordData.updatedAt),
                        },
                    });
                }
                catch (error) {
                    console.error('Error processing record:', recordData, error.message);
                    throw new common_1.InternalServerErrorException(`Failed to restore record with ID ${recordData.id}: ${error.message}`);
                }
            }
            for (const structureData of structuresSheet) {
                try {
                    await this.prisma.structure.upsert({
                        where: { id: structureData.id },
                        update: {
                            name: structureData.name,
                            description: structureData.description,
                            ownerId: structureData.ownerId,
                            visibility: structureData.visibility,
                            createdAt: new Date(structureData.createdAt),
                            updatedAt: new Date(structureData.updatedAt),
                        },
                        create: {
                            id: structureData.id,
                            name: structureData.name,
                            description: structureData.description,
                            ownerId: structureData.ownerId,
                            visibility: structureData.visibility,
                            createdAt: new Date(structureData.createdAt),
                            updatedAt: new Date(structureData.updatedAt),
                        },
                    });
                }
                catch (error) {
                    throw new common_1.InternalServerErrorException(`Failed to restore structure with ID ${structureData.id}: ${error.message}`);
                }
            }
            for (const elementData of elementsSheet) {
                try {
                    await this.prisma.element.upsert({
                        where: { id: elementData.id },
                        update: {
                            structureId: elementData.structureId,
                            recordId: elementData.recordId,
                            type: elementData.type,
                            Guid: elementData.Guid,
                            wbsLevel: elementData.wbsLevel,
                            createdAt: new Date(elementData.createdAt),
                            updatedAt: new Date(elementData.updatedAt),
                        },
                        create: {
                            id: elementData.id,
                            structureId: elementData.structureId,
                            recordId: elementData.recordId,
                            type: elementData.type,
                            Guid: elementData.Guid,
                            wbsLevel: elementData.wbsLevel,
                            createdAt: new Date(elementData.createdAt),
                            updatedAt: new Date(elementData.updatedAt),
                        },
                    });
                }
                catch (error) {
                    throw new common_1.InternalServerErrorException(`Failed to restore element with ID ${elementData.id}: ${error.message}`);
                }
            }
            for (const mapData of structureMapsSheet) {
                try {
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
                catch (error) {
                    throw new common_1.InternalServerErrorException(`Failed to restore structure map with ID ${mapData.id}: ${error.message}`);
                }
            }
            return { message: 'Backup restored successfully' };
        }
        catch (error) {
            console.error('Error during restore operation:', error);
            throw new common_1.InternalServerErrorException('Failed to restore backup: ' + error.message);
        }
    }
};
exports.RestoreService = RestoreService;
exports.RestoreService = RestoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RestoreService);
//# sourceMappingURL=restore-backup.service.js.map