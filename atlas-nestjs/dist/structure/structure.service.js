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
exports.StructureService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let StructureService = class StructureService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createStructure(createStructureDto) {
        const { name, description, visibility, ownerId, elements } = createStructureDto;
        try {
            const owner = await this.prisma.user.findUnique({
                where: { id: ownerId },
            });
            if (!owner) {
                throw new common_1.NotFoundException(`User with id ${ownerId} not found`);
            }
            const elementsToProcess = elements || [];
            const formatElements = (elements) => elements.map((element) => ({
                type: element.type,
                wbsLevel: element.wbsLevel,
                children: element.children
                    ? { create: formatElements(element.children) }
                    : undefined,
            }));
            const structure = await this.prisma.structure.create({
                data: {
                    name,
                    description,
                    visibility: visibility || client_1.Visibility.private,
                    ownerId,
                    markmapMM: '#',
                    elements: {
                        create: elements ? formatElements(elements) : [],
                    },
                },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'CREATE',
                    element: 'Structure',
                    elementId: structure.id.toString(),
                    details: {
                        name,
                        description,
                        visibility,
                        elements: elementsToProcess.map((element) => ({
                            type: element.type,
                        })),
                    },
                    userId: ownerId,
                },
            });
            return structure;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to create structure: ${error.message}`);
        }
    }
    async getStructure(id) {
        try {
            const structure = await this.prisma.structure.findUnique({
                where: { id },
                include: {
                    elements: {
                        include: {
                            sourceLinks: true,
                            targetLinks: true,
                            Record: true,
                        },
                    },
                },
            });
            if (!structure) {
                throw new common_1.NotFoundException(`Structure with id ${id} not found`);
            }
            const buildHierarchy = (elements, parentId = null) => elements
                .filter((element) => element.parentId === parentId)
                .map((element) => ({
                ...element,
                children: buildHierarchy(elements, element.id),
            }));
            const nestedElements = buildHierarchy(structure.elements);
            return { ...structure, elements: nestedElements };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Structure not found: ${error.message}`);
        }
    }
    async updateStructure(id, updateData) {
        try {
            const { name, description, visibility, elements, maps } = updateData;
            const structure = await this.prisma.structure.findUnique({
                where: { id },
            });
            if (!structure) {
                throw new common_1.NotFoundException(`Structure with id ${id} not found`);
            }
            const elementsToProcess = elements || [];
            const updatedStructure = await this.prisma.structure.update({
                where: { id },
                data: {
                    name: name || undefined,
                    description: description || undefined,
                    visibility: visibility || undefined,
                    updatedAt: new Date(),
                    elements: elements
                        ? {
                            deleteMany: {},
                            create: elements,
                        }
                        : undefined,
                    StructureMap: maps
                        ? {
                            deleteMany: {},
                            create: maps,
                        }
                        : undefined,
                },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'UPDATE',
                    element: 'Structure',
                    elementId: updatedStructure.id.toString(),
                    details: {
                        name,
                        description,
                        visibility,
                        elements: elementsToProcess.map((element) => ({
                            type: element.type,
                        })),
                    },
                    userId: structure.ownerId,
                },
            });
            return updatedStructure;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to update structure: ${error.message}`);
        }
    }
    async deleteStructure(id) {
        try {
            const structure = await this.prisma.structure.findUnique({
                where: { id },
                include: { elements: true },
            });
            if (!structure) {
                throw new common_1.NotFoundException(`Structure with id ${id} not found`);
            }
            const elementIds = structure.elements.map((element) => element.id);
            await this.prisma.record.deleteMany({
                where: { id: { in: elementIds } },
            });
            await this.prisma.element.deleteMany({ where: { structureId: id } });
            await this.prisma.auditLog.create({
                data: {
                    action: 'DELETE',
                    element: 'Structure',
                    elementId: structure.id.toString(),
                    details: { name: structure.name, description: structure.description },
                    userId: structure.ownerId,
                },
            });
            return this.prisma.structure.delete({ where: { id } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete structure: ${error.message}`);
        }
    }
    async createBatchStructures(structures) {
        try {
            const createdStructures = await Promise.all(structures.map((structure) => this.createStructure(structure)));
            for (const createdStructure of createdStructures) {
                await this.prisma.auditLog.create({
                    data: {
                        action: 'CREATE',
                        element: 'Structure',
                        elementId: createdStructure.id.toString(),
                        details: {
                            name: createdStructure.name,
                            description: createdStructure.description,
                        },
                        userId: createdStructure.ownerId,
                    },
                });
            }
            return createdStructures;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to batch create structures: ${error.message}`);
        }
    }
    async updateBatchStructures(structures) {
        try {
            return Promise.all(structures.map((structure) => this.updateStructure(structure.id, structure)));
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to batch update structures: ${error.message}`);
        }
    }
    async deleteBatchStructures(ids) {
        try {
            return Promise.all(ids.map((id) => this.deleteStructure(id)));
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to batch delete structures: ${error.message}`);
        }
    }
};
exports.StructureService = StructureService;
exports.StructureService = StructureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StructureService);
//# sourceMappingURL=structure.service.js.map