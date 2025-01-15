import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
export declare class RecordService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private logAudit;
    createRecord(elementId: number, createRecordDto: CreateRecordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateRecord(recordId: number, updateRecordDto: UpdateRecordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getRecordById(recordId: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getAllRecords(elementId: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    deleteRecord(recordId: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getRecordsByTags(tags: {
        [key: string]: string;
    }): Promise<({
        Element: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            updatedAt: Date;
            structureId: string;
            parentId: string | null;
            type: string | null;
            recordId: string | null;
            wbsLevel: number | null;
            markmapMM: string | null;
            Guid: string;
            uniqWBS: string | null;
            parsedContentId: string | null;
            elementLinkId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
