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
exports.RestoreController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const restore_backup_service_1 = require("./restore-backup.service");
let RestoreController = class RestoreController {
    constructor(restoreService) {
        this.restoreService = restoreService;
    }
    async restoreBackup(file) {
        if (!file) {
            throw new common_1.HttpException('No file uploaded', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            if (!file.originalname.endsWith('.zip')) {
                throw new common_1.HttpException('Invalid file type. Expected .zip file.', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.restoreService.restoreBackup(file.buffer);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to restore backup: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RestoreController = RestoreController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.memoryStorage(),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestoreController.prototype, "restoreBackup", null);
exports.RestoreController = RestoreController = __decorate([
    (0, common_1.Controller)('restore'),
    __metadata("design:paramtypes", [restore_backup_service_1.RestoreService])
], RestoreController);
//# sourceMappingURL=restore-backup.controller.js.map