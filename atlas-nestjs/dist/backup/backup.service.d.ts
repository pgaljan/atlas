import { PrismaService } from '../prisma/prisma.service';
export declare class BackupService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private encrypt;
    private logAudit;
    createBackup(userId: number, structureId?: number): Promise<{
        message: string;
        fileUrl: string;
    }>;
    getBackup(backupId: number): Promise<{
        publicUrl: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        backupData: import("@prisma/client/runtime/library").JsonValue;
        fileUrl: string | null;
    }>;
    deleteBackup(backupId: number): Promise<{
        message: string;
    }>;
    getAllBackups(userId?: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        backupData: import("@prisma/client/runtime/library").JsonValue;
        fileUrl: string | null;
    }[]>;
}
