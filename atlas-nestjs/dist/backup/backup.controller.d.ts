import { BackupService } from './backup.service';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    createBackup(userId: string, structureId?: string): Promise<{
        message: string;
        fileUrl: string;
    }>;
    getBackup(backupId: string): Promise<{
        publicUrl: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        backupData: import("@prisma/client/runtime/library").JsonValue;
        fileUrl: string | null;
    }>;
    deleteBackup(backupId: string): Promise<{
        message: string;
    }>;
    getAllBackups(userId?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        backupData: import("@prisma/client/runtime/library").JsonValue;
        fileUrl: string | null;
    }[]>;
}
