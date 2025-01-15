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
exports.RecordController = void 0;
const common_1 = require("@nestjs/common");
const create_record_dto_1 = require("./dto/create-record.dto");
const update_record_dto_1 = require("./dto/update-record.dto");
const record_service_1 = require("./record.service");
let RecordController = class RecordController {
    constructor(recordService) {
        this.recordService = recordService;
    }
    async create(elementId, createRecordDto) {
        if (!elementId || isNaN(Number(elementId))) {
            throw new common_1.BadRequestException('Invalid element ID');
        }
        await this.recordService.createRecord(+elementId, createRecordDto);
        return { message: 'Record created successfully' };
    }
    async findOne(recordId) {
        if (isNaN(Number(recordId))) {
            throw new common_1.BadRequestException('Invalid record ID');
        }
        return this.recordService.getRecordById(+recordId);
    }
    async findAll(elementId) {
        if (isNaN(Number(elementId))) {
            throw new common_1.BadRequestException('Invalid element ID');
        }
        return this.recordService.getAllRecords(+elementId);
    }
    async update(recordId, updateRecordDto) {
        if (isNaN(Number(recordId))) {
            throw new common_1.BadRequestException('Invalid record ID');
        }
        await this.recordService.updateRecord(+recordId, updateRecordDto);
        return { message: 'Record updated successfully' };
    }
    async remove(recordId) {
        if (isNaN(Number(recordId))) {
            throw new common_1.BadRequestException('Invalid record ID');
        }
        await this.recordService.deleteRecord(+recordId);
        return { message: 'Record deleted successfully' };
    }
    async getRecordsByTags(tags) {
        return this.recordService.getRecordsByTags(tags);
    }
};
exports.RecordController = RecordController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Query)('elementId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_record_dto_1.CreateRecordDto]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('record/:recordId'),
    __param(0, (0, common_1.Param)('recordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('element/:elementId'),
    __param(0, (0, common_1.Param)('elementId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('update/:recordId'),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_record_dto_1.UpdateRecordDto]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('delete/:recordId'),
    __param(0, (0, common_1.Param)('recordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('filter-by-tags'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "getRecordsByTags", null);
exports.RecordController = RecordController = __decorate([
    (0, common_1.Controller)('records'),
    __metadata("design:paramtypes", [record_service_1.RecordService])
], RecordController);
//# sourceMappingURL=record.controller.js.map