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
exports.ElementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const markmap_utils_1 = require("../utils/markmap-utils");
let ElementService = class ElementService {
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
    async createElement(createElementDto, userId) {
        const { structureId, type, recordId, wbsLevel } = createElementDto;
        if (!structureId || !type || !wbsLevel) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        const markmapMM = (0, markmap_utils_1.generateMarkmapHeader)(wbsLevel);
        try {
            const createdElement = await this.prisma.element.create({
                data: {
                    structureId,
                    type,
                    recordId,
                    wbsLevel,
                    markmapMM,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            await this.logAudit('CREATE', 'Element', createdElement.id, {
                structureId,
                type,
                recordId,
                wbsLevel,
            }, userId);
            return createdElement;
        }
        catch (error) {
            throw new common_1.BadRequestException('Error creating element');
        }
    }
    async createNestedElements(parentId, nestedElements) {
        for (const elementDto of nestedElements) {
            const { structureId, type, recordId, wbsLevel } = elementDto;
            if (!structureId || !type || !wbsLevel) {
                throw new common_1.BadRequestException('Missing required fields in nested element');
            }
            const markmapMM = (0, markmap_utils_1.generateMarkmapHeader)(wbsLevel);
            try {
                const createdElement = await this.prisma.element.create({
                    data: {
                        structureId,
                        parentId,
                        type,
                        recordId,
                        wbsLevel,
                        markmapMM,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                if (Array.isArray(elementDto.children) &&
                    elementDto.children.length > 0) {
                    await this.createNestedElements(createdElement.id, elementDto.children);
                }
            }
            catch (error) {
                throw new common_1.BadRequestException('Error creating nested elements');
            }
        }
        return { message: 'Nested elements created successfully' };
    }
    async getAllElements() {
        return this.prisma.element.findMany();
    }
    async getElement(id) {
        const element = await this.prisma.element.findUnique({ where: { id } });
        if (!element) {
            throw new common_1.NotFoundException(`Element with id ${id} not found`);
        }
        return element;
    }
    async updateElement(id, updateElementDto, userId) {
        const element = await this.getElement(id);
        if (!updateElementDto.wbsLevel) {
            throw new common_1.BadRequestException('Missing required fields for update');
        }
        const updatedElement = await this.prisma.element.update({
            where: { id },
            data: {
                ...updateElementDto,
                updatedAt: new Date(),
            },
        });
        await this.logAudit('UPDATE', 'Element', updatedElement.id, {
            previousData: element,
            updatedData: updateElementDto,
        }, userId);
        return updatedElement;
    }
    async reparentElements(ReparentElementsDto, userId) {
        const { reparentingRequests } = ReparentElementsDto;
        if (!Array.isArray(reparentingRequests) ||
            reparentingRequests.length === 0) {
            throw new common_1.BadRequestException('Invalid reparenting requests');
        }
        const updatedElements = [];
        for (const request of reparentingRequests) {
            const { sourceElementId, targetElementId, attributes } = request;
            const sourceElement = await this.prisma.element.findUnique({
                where: { id: sourceElementId },
            });
            const targetElement = await this.prisma.element.findUnique({
                where: { id: targetElementId },
            });
            if (!sourceElement || !targetElement) {
                throw new common_1.NotFoundException(`One or both elements not found`);
            }
            if (!attributes) {
                throw new common_1.BadRequestException('Missing attributes for the link');
            }
            const updatedElement = await this.prisma.element.update({
                where: { id: targetElementId },
                data: {
                    parentId: sourceElementId,
                },
            });
            await this.logAudit('REPARENT', 'Element', updatedElement.id, {
                sourceElementId,
                targetElementId,
                attributes,
            }, userId);
            updatedElements.push(updatedElement);
        }
        return {
            message: `${updatedElements.length} elements reparented successfully`,
            updatedElements,
        };
    }
    async deleteElement(id, userId) {
        const element = await this.getElement(id);
        if (element.deletedAt) {
            throw new common_1.BadRequestException('Element is already deleted');
        }
        try {
            const deletedElement = await this.prisma.element.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            await this.logAudit('DELETE', 'Element', deletedElement.id, {
                deletedAt: deletedElement.deletedAt,
                reason: 'Deletion initiated by user',
            }, userId);
            return deletedElement;
        }
        catch (error) {
            throw new common_1.BadRequestException('Error deleting element');
        }
    }
};
exports.ElementService = ElementService;
exports.ElementService = ElementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ElementService);
//# sourceMappingURL=element.service.js.map