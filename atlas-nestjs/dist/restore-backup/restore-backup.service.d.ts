import { PrismaService } from '../prisma/prisma.service';
export declare class RestoreService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private safeParseJSON;
    private decrypt;
    restoreBackup(fileBuffer: Buffer): Promise<{
        message: string;
    }>;
}
