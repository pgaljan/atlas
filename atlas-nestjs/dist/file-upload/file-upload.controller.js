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
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const fs = require("fs");
const multer_1 = require("multer");
const Papa = require("papaparse");
const path_1 = require("path");
const uuid_1 = require("uuid");
const XLSX = require("xlsx");
const file_upload_service_1 = require("./file-upload.service");
let FileUploadController = class FileUploadController {
    constructor(fileUploadService, configService) {
        this.fileUploadService = fileUploadService;
        this.configService = configService;
    }
    async uploadFileAndParse(file, userId, req) {
        const userIdInt = parseInt(userId, 10);
        if (isNaN(userIdInt)) {
            throw new common_1.BadRequestException('Invalid userId. It must be a number.');
        }
        const fileType = file.mimetype;
        const allowedParseTypes = [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        const allowedImageTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/bmp',
        ];
        const protocol = process.env.PROTOCOL || 'http';
        const host = this.configService.get('APP_HOST') || req.headers.host;
        const fileUrl = `${protocol}://${host}/public/${file.filename}`;
        const filePath = (0, path_1.join)('public', file.filename);
        try {
            if (allowedParseTypes.includes(fileType)) {
                let parsedData;
                if (fileType === 'text/csv') {
                    parsedData = await this.parseCSV(filePath);
                }
                else {
                    parsedData = this.parseExcel(filePath);
                }
                const insertedRecords = await this.saveParsedDataToDB(parsedData);
                await this.fileUploadService.logAudit('CREATE', 'File', file.filename, { type: fileType, recordsCount: insertedRecords.length }, userIdInt);
                return {
                    message: 'File uploaded, parsed, and data saved to ParsedContent successfully',
                    parsedFileUrl: fileUrl,
                    insertedRecordsCount: insertedRecords.length,
                };
            }
            else if (allowedImageTypes.includes(fileType)) {
                await this.fileUploadService.createAttachment(userIdInt, file, fileUrl);
                await this.fileUploadService.logAudit('CREATE', 'Attachment', file.filename, { type: fileType }, userIdInt);
                return {
                    message: 'Image uploaded successfully',
                    fileUrl: fileUrl,
                };
            }
            else {
                throw new common_1.BadRequestException('Unsupported file type. Only CSV, Excel, or image files (PNG, JPEG, etc.) are allowed.');
            }
        }
        catch (error) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('File processing failed.');
        }
    }
    async parseCSV(filePath) {
        try {
            return new Promise((resolve, reject) => {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                Papa.parse(fileContent, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => resolve(result.data),
                    error: (error) => reject(error),
                });
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to parse CSV file.');
        }
    }
    parseExcel(filePath) {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            return XLSX.utils.sheet_to_json(sheet);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to parse Excel file.');
        }
    }
    async saveParsedDataToDB(parsedData) {
        try {
            const createdRecords = [];
            for (const row of parsedData) {
                const { type, wbs, level, element, uniqWBS, markmapMM, additionalData, } = row;
                const record = await this.fileUploadService.saveParsedContent({
                    type: type || 'unknown',
                    wbs: wbs || '',
                    level: level ? parseInt(level) : 0,
                    element: element || '',
                    uniqWBS: uniqWBS || '',
                    markmapMM: markmapMM || '',
                    additionalData: additionalData ? JSON.parse(additionalData) : {},
                });
                createdRecords.push(record);
            }
            return createdRecords;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to save parsed data.');
        }
    }
    async getFile(id) {
        try {
            return await this.fileUploadService.findOne(id);
        }
        catch (error) {
            console.error('Error fetching file:', error.message);
            throw error;
        }
    }
    async getAllFiles() {
        try {
            return await this.fileUploadService.findAll();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve files.');
        }
    }
    async deleteFile(id) {
        try {
            const file = await this.fileUploadService.findOne(id);
            await this.fileUploadService.logAudit('DELETE', 'Attachment', id, {
                fileName: file.fileUrl,
            });
            await this.fileUploadService.remove(id);
        }
        catch (error) {
            throw error;
        }
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: 'public/',
            filename: (req, file, callback) => {
                const uniqueName = (0, uuid_1.v4)() + (0, path_1.extname)(file.originalname);
                callback(null, uniqueName);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadFileAndParse", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getAllFiles", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteFile", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, common_1.Controller)('file'),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService,
        config_1.ConfigService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map