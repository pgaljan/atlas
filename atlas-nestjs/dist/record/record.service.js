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
exports.RecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecordService = class RecordService {
    constructor(prisma) {
        this.prisma = prisma;
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
    async createRecord(elementId, createRecordDto) {
        const element = await this.prisma.element.findUnique({
            where: { id: elementId },
        });
        if (!element)
            throw new common_1.NotFoundException('Element not found');
        try {
            const newRecord = await this.prisma.record.create({
                data: {
                    ...createRecordDto,
                    tags: createRecordDto.tags ?? null,
                    Element: { connect: { id: elementId } },
                },
            });
            await this.logAudit('CREATE', 'Record', newRecord.id, {
                data: createRecordDto,
            });
            return newRecord;
        }
        catch (error) {
            throw new common_1.BadRequestException('Error creating record');
        }
    }
    async updateRecord(recordId, updateRecordDto) {
        const record = await this.prisma.record.findUnique({
            where: { id: recordId },
        });
        if (!record)
            throw new common_1.NotFoundException('Record not found');
        try {
            const updatedRecord = await this.prisma.record.update({
                where: { id: recordId },
                data: {
                    ...updateRecordDto,
                },
            });
            await this.logAudit('UPDATE', 'Record', updatedRecord.id, {
                updatedFields: updateRecordDto,
            });
            return updatedRecord;
        }
        catch (error) {
            throw new common_1.BadRequestException('Error updating record');
        }
    }
    async getRecordById(recordId) {
        if (!recordId || isNaN(recordId)) {
            throw new common_1.BadRequestException('Invalid record ID');
        }
        const record = await this.prisma.record.findUnique({
            where: { id: recordId },
            include: { Element: true },
        });
        if (!record) {
            throw new common_1.NotFoundException('Record not found');
        }
        return record;
    }
    async getAllRecords(elementId) {
        if (isNaN(elementId)) {
            throw new common_1.BadRequestException('Invalid element ID');
        }
        return this.prisma.record.findMany({
            where: { Element: { some: { id: elementId } } },
            include: { Element: true },
        });
    }
    async deleteRecord(recordId) {
        const record = await this.prisma.record.findUnique({
            where: { id: recordId },
        });
        if (!record) {
            throw new common_1.NotFoundException('Record not found');
        }
        try {
            const deletedRecord = await this.prisma.record.delete({
                where: { id: recordId },
            });
            await this.logAudit('DELETE', 'Record', deletedRecord.id, {
                deletedRecord,
            });
            return deletedRecord;
        }
        catch (error) {
            throw new common_1.BadRequestException('Error deleting record');
        }
    }
    async getRecordsByTags(tags) {
        if (!tags || Object.keys(tags).length === 0) {
            throw new common_1.BadRequestException('Tags parameter is required');
        }
        return this.prisma.record.findMany({
            where: {
                tags: {
                    equals: tags,
                },
            },
            include: { Element: true },
        });
    }
};
exports.RecordService = RecordService;
exports.RecordService = RecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordService);
//# sourceMappingURL=record.service.js.map