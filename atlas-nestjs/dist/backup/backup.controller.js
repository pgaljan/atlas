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
exports.BackupController = void 0;
const common_1 = require("@nestjs/common");
const backup_service_1 = require("./backup.service");
let BackupController = class BackupController {
    constructor(backupService) {
        this.backupService = backupService;
    }
    async createBackup(userId, structureId) {
        try {
            const parsedUserId = parseInt(userId, 10);
            const parsedStructureId = structureId
                ? parseInt(structureId, 10)
                : undefined;
            if (isNaN(parsedUserId)) {
                throw new common_1.HttpException('Invalid userId provided', common_1.HttpStatus.BAD_REQUEST);
            }
            if (structureId && isNaN(parsedStructureId)) {
                throw new common_1.HttpException('Invalid structureId provided', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.backupService.createBackup(parsedUserId, parsedStructureId);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Unexpected error during backup creation:', error);
            throw new common_1.HttpException(error.message || 'Failed to create backup', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBackup(backupId) {
        try {
            const parsedBackupId = parseInt(backupId, 10);
            if (isNaN(parsedBackupId)) {
                throw new common_1.HttpException('Invalid backupId provided', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.backupService.getBackup(parsedBackupId);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Unexpected error during fetching backup:', error);
            throw new common_1.HttpException(error.message || 'Failed to retrieve the backup', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteBackup(backupId) {
        try {
            const parsedBackupId = parseInt(backupId, 10);
            if (isNaN(parsedBackupId)) {
                throw new common_1.HttpException('Invalid backupId provided', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.backupService.deleteBackup(parsedBackupId);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Unexpected error during backup deletion:', error);
            throw new common_1.HttpException(error.message || 'Failed to delete the backup', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllBackups(userId) {
        try {
            const parsedUserId = userId ? parseInt(userId, 10) : undefined;
            if (userId && isNaN(parsedUserId)) {
                throw new common_1.HttpException('Invalid userId provided', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.backupService.getAllBackups(parsedUserId);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Unexpected error during fetching backups:', error);
            throw new common_1.HttpException(error.message || 'Failed to retrieve the backups', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.BackupController = BackupController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('structureId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackup", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "deleteBackup", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getAllBackups", null);
exports.BackupController = BackupController = __decorate([
    (0, common_1.Controller)('backup'),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupController);
//# sourceMappingURL=backup.controller.js.map