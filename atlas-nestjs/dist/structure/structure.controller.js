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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureController = void 0;
const common_1 = require("@nestjs/common");
const dto_1 = require("./dto");
const structure_service_1 = require("./structure.service");
let StructureController = class StructureController {
    constructor(structureService) {
        this.structureService = structureService;
    }
    async createStructure(createStructureDto) {
        try {
            await this.structureService.createStructure(createStructureDto);
            return { message: 'Structure created successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create structure: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStructure(id) {
        try {
            return await this.structureService.getStructure(parseInt(id));
        }
        catch (error) {
            throw new common_1.HttpException(`Structure not found: ${error.message}`, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async updateStructure(id, updateData) {
        try {
            await this.structureService.updateStructure(parseInt(id), updateData);
            return { message: 'Structure updated successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to update structure: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteStructure(id) {
        try {
            await this.structureService.deleteStructure(parseInt(id));
            return { message: 'Structure deleted successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to delete structure: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createBatchStructures(structures) {
        try {
            await this.structureService.createBatchStructures(structures);
            return { message: 'Structures created successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to batch create structures: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateBatchStructures(structures) {
        try {
            await this.structureService.updateBatchStructures(structures);
            return { message: 'Structures updated successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to batch update structures: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteBatchStructures(ids) {
        try {
            await this.structureService.deleteBatchStructures(ids);
            return { message: 'Structures deleted successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to batch delete structures: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StructureController = StructureController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateStructureDto]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "createStructure", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "getStructure", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "updateStructure", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "deleteStructure", null);
__decorate([
    (0, common_1.Post)('batch-create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "createBatchStructures", null);
__decorate([
    (0, common_1.Patch)('batch-update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "updateBatchStructures", null);
__decorate([
    (0, common_1.Delete)('batch-delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "deleteBatchStructures", null);
exports.StructureController = StructureController = __decorate([
    (0, common_1.Controller)('structure'),
    __metadata("design:paramtypes", [structure_service_1.StructureService])
], StructureController);
//# sourceMappingURL=structure.controller.js.map