import { Attachment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class FileUploadService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAttachment(userId: number, file: Express.Multer.File, fileUrl: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
        updatedAt: Date;
        fileUrl: string;
        fileType: string;
    }>;
    saveParsedContent(parsedContent: any): Promise<any>;
    findOne(id: number): Promise<Attachment>;
    findAll(): Promise<Attachment[]>;
    remove(id: number): Promise<void>;
    logAudit(action: string, element: string, elementId: number | string, details: object, userId?: number): Promise<void>;
}
