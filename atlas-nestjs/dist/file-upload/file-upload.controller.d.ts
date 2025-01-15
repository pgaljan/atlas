import { ConfigService } from '@nestjs/config';
import { Attachment } from '@prisma/client';
import { FileUploadService } from './file-upload.service';
export declare class FileUploadController {
    private readonly fileUploadService;
    private readonly configService;
    constructor(fileUploadService: FileUploadService, configService: ConfigService);
    uploadFileAndParse(file: Express.Multer.File, userId: string, req: Request): Promise<{
        message: string;
        parsedFileUrl: string;
        insertedRecordsCount: number;
        fileUrl?: undefined;
    } | {
        message: string;
        fileUrl: string;
        parsedFileUrl?: undefined;
        insertedRecordsCount?: undefined;
    }>;
    private parseCSV;
    private parseExcel;
    private saveParsedDataToDB;
    getFile(id: number): Promise<Attachment>;
    getAllFiles(): Promise<Attachment[]>;
    deleteFile(id: number): Promise<void>;
}
