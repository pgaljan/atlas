import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordService } from './record.service';
export declare class RecordController {
    private readonly recordService;
    constructor(recordService: RecordService);
    create(elementId: string, createRecordDto: CreateRecordDto): Promise<{
        message: string;
    }>;
    findOne(recordId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(elementId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    update(recordId: string, updateRecordDto: UpdateRecordDto): Promise<{
        message: string;
    }>;
    remove(recordId: string): Promise<{
        message: string;
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
