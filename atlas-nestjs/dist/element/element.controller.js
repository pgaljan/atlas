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
exports.ElementController = void 0;
const common_1 = require("@nestjs/common");
const create_element_dto_1 = require("./dto/create-element.dto");
const reparent_elements_dto_1 = require("./dto/reparent-elements.dto");
const update_element_dto_1 = require("./dto/update-element.dto");
const element_service_1 = require("./element.service");
let ElementController = class ElementController {
    constructor(elementService) {
        this.elementService = elementService;
    }
    async createElement(createElementDto) {
        try {
            await this.elementService.createElement(createElementDto);
            return { message: 'Element created successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error creating element');
        }
    }
    async createNestedElements(parentId, nestedElements) {
        try {
            const elementsArray = Array.isArray(nestedElements)
                ? nestedElements
                : [nestedElements];
            await this.elementService.createNestedElements(parseInt(parentId), elementsArray);
            return { message: 'Nested elements created successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error creating nested elements');
        }
    }
    async getAllElements() {
        return this.elementService.getAllElements();
    }
    async getElement(id) {
        try {
            return await this.elementService.getElement(parseInt(id));
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException(`Element with id ${id} not found`);
            }
            throw new common_1.BadRequestException('Error retrieving element');
        }
    }
    async updateElement(id, updateElementDto) {
        try {
            await this.elementService.updateElement(parseInt(id), updateElementDto);
            return { message: 'Element updated successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error updating element');
        }
    }
    async reparentElements(reparentElementsDto) {
        try {
            await this.elementService.reparentElements(reparentElementsDto);
            return { message: 'Elements reparented successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error reparenting elements');
        }
    }
    async deleteElement(id) {
        try {
            await this.elementService.deleteElement(parseInt(id));
            return { message: 'Element deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error deleting element');
        }
    }
};
exports.ElementController = ElementController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_element_dto_1.CreateElementDto]),
    __metadata("design:returntype", Promise)
], ElementController.prototype, "createElement", null);
__decorate([
    (0, common_1.Post)('create-nested/:parentId'),
    __param(0, (0, common_1.Param)('parentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ElementController.prototype, "createNestedElements", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElementController.prototype, "getAllElements", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElementController.prototype, "getElement", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_element_dto_1.UpdateElementDto]),
    __metadata("design:returntype", Promise)
], ElementController.prototype, "updateElement", null);
__decorate([
    (0, common_1.Post)('reparent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reparent_elements_dto_1.ReparentElementsDto]),
    __metadata("design:returntype", Promise)
], ElementController.prototype, "reparentElements", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElementController.prototype, "deleteElement", null);
exports.ElementController = ElementController = __decorate([
    (0, common_1.Controller)('element'),
    __metadata("design:paramtypes", [element_service_1.ElementService])
], ElementController);
//# sourceMappingURL=element.controller.js.map