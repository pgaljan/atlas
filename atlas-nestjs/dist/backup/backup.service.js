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
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const AdmZip = require("adm-zip");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
const xlsx = require("xlsx");
const prisma_service_1 = require("../prisma/prisma.service");
let BackupService = class BackupService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    encrypt(data) {
        try {
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), Buffer.from(process.env.IV, 'hex'));
            return Buffer.concat([cipher.update(data), cipher.final()]);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to encrypt the backup data', error.message);
        }
    }
    async logAudit(action, element, elementId, details, userId) {
        await this.prisma.auditLog.create({
            data: {
                action,
                element,
                elementId: elementId.toString(),
                details: details,
                userId: userId || null,
            },
        });
    }
    async createBackup(userId, structureId) {
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
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            if (structureId && user.structures.length === 0) {
                throw new common_1.NotFoundException(`Structure with ID ${structureId} not found for the user`);
            }
            const structuresSheet = user.structures.map((structure) => ({
                id: structure.id,
                name: structure.name,
                ownerId: structure.ownerId,
                createdAt: structure.createdAt,
                updatedAt: structure.updatedAt,
                visibility: structure.visibility,
            }));
            const elementsSheet = user.structures.flatMap((structure) => structure.elements.map((element) => ({
                id: element.id,
                structureId: element.structureId,
                recordId: element.recordId,
                type: element.type,
                createdAt: element.createdAt,
                updatedAt: element.updatedAt,
                Record: element.Record ? element.Record.id : null,
            })));
            const recordsSheet = user.structures.flatMap((structure) => structure.elements.flatMap((element) => element.Record
                ? [
                    {
                        id: element.Record.id,
                        metadata: JSON.stringify(element.Record.metadata),
                        createdAt: element.Record.createdAt,
                        updatedAt: element.Record.updatedAt,
                    },
                ]
                : []));
            const backupDir = path.resolve(__dirname, '../../public/backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(structuresSheet), 'Structures');
            xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(elementsSheet), 'Elements');
            xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(recordsSheet), 'Records');
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            const encryptedBuffer = this.encrypt(buffer);
            const filename = `backup-${(0, uuid_1.v4)()}.zip`;
            const encryptedFilePath = path.resolve(backupDir, `backup-${(0, uuid_1.v4)()}.enc`);
            fs.writeFileSync(encryptedFilePath, encryptedBuffer);
            const zip = new AdmZip();
            const zipFilePath = path.resolve(backupDir, filename);
            zip.addLocalFile(encryptedFilePath);
            zip.writeZip(zipFilePath);
            fs.unlinkSync(encryptedFilePath);
            const protocol = process.env.PROTOCOL || 'http';
            const baseUrl = process.env.BASE_URL || 'localhost:4001';
            const fileUrl = `${protocol}://${baseUrl}/public/backups/${filename}`;
            const backup = await this.prisma.backup.create({
                data: {
                    userId,
                    backupData: { filePath: zipFilePath },
                    fileUrl,
                },
            });
            await this.logAudit('create', 'backup', backup.id, {
                fileUrl,
                userId,
            });
            return {
                message: 'Backup created successfully',
                fileUrl,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('Unexpected error during backup creation:', error);
            throw new common_1.InternalServerErrorException('Failed to create backup');
        }
    }
    async getBackup(backupId) {
        try {
            const backup = await this.prisma.backup.findUnique({
                where: { id: backupId },
            });
            if (!backup) {
                throw new common_1.NotFoundException(`Backup with ID ${backupId} not found`);
            }
            return {
                ...backup,
                publicUrl: backup.fileUrl,
            };
        }
        catch (error) {
            console.error('Error fetching backup:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve the backup');
        }
    }
    async deleteBackup(backupId) {
        try {
            const backup = await this.prisma.backup.findUnique({
                where: { id: backupId },
            });
            if (!backup) {
                throw new common_1.NotFoundException(`Backup with ID ${backupId} not found`);
            }
            const backupData = backup.backupData;
            if (fs.existsSync(backupData.filePath)) {
                fs.unlinkSync(backupData.filePath);
            }
            await this.prisma.backup.delete({ where: { id: backupId } });
            await this.logAudit('delete', 'backup', backupId, {
                userId: backup.userId,
            });
            return { message: `Backup with ID ${backupId} deleted successfully` };
        }
        catch (error) {
            console.error('Error deleting backup:', error);
            throw new common_1.InternalServerErrorException('Failed to delete the backup');
        }
    }
    async getAllBackups(userId) {
        try {
            const backups = userId
                ? await this.prisma.backup.findMany({ where: { userId } })
                : await this.prisma.backup.findMany();
            return backups;
        }
        catch (error) {
            console.error('Error fetching backups:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve backups');
        }
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupService);
//# sourceMappingURL=backup.service.js.map