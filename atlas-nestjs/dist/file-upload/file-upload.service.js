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
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const prisma_service_1 = require("../prisma/prisma.service");
let FileUploadService = class FileUploadService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAttachment(userId, file, fileUrl) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return await this.prisma.attachment.create({
                data: {
                    userId,
                    fileUrl,
                    fileType: file.mimetype,
                    data: {},
                },
            });
        }
        catch (error) {
            console.error('Error creating attachment:', error.message);
            throw new common_1.InternalServerErrorException('Failed to create attachment.');
        }
    }
    async saveParsedContent(parsedContent) {
        try {
            return await this.prisma.parsedContent.create({ data: parsedContent });
        }
        catch (error) {
            console.error('Error saving parsed content:', error.message);
            throw new common_1.InternalServerErrorException('Failed to save parsed content.');
        }
    }
    async findOne(id) {
        try {
            const attachment = await this.prisma.attachment.findUnique({
                where: { id },
            });
            if (!attachment) {
                throw new common_1.NotFoundException('File not found');
            }
            return attachment;
        }
        catch (error) {
            console.error('Error finding file:', error.message);
            throw new common_1.InternalServerErrorException('Failed to retrieve file.');
        }
    }
    async findAll() {
        try {
            return await this.prisma.attachment.findMany();
        }
        catch (error) {
            console.error('Error fetching all files:', error.message);
            throw new common_1.InternalServerErrorException('Failed to retrieve files.');
        }
    }
    async remove(id) {
        try {
            const attachment = await this.prisma.attachment.findUnique({
                where: { id },
            });
            if (!attachment) {
                throw new common_1.NotFoundException('File not found');
            }
            const filePath = `public/${attachment.fileUrl.split('/').pop()}`;
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            await this.prisma.attachment.delete({
                where: { id },
            });
        }
        catch (error) {
            console.error('Error deleting file:', error.message);
            throw new common_1.InternalServerErrorException('Failed to delete file.');
        }
    }
    async logAudit(action, element, elementId, details, userId) {
        try {
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
        catch (error) {
            console.error('Error logging audit:', error.message);
            throw new common_1.InternalServerErrorException('Failed to log audit.');
        }
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map